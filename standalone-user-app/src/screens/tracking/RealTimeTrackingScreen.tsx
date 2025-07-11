import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Import real-time services
import { customerSocketService } from '../../services/customerSocketService';
import { customerAPI } from '../../services/customerAPI';

const { width, height } = Dimensions.get('window');

type RealTimeTrackingScreenProps = NativeStackScreenProps<any, 'RealTimeTracking'>;

interface DriverLocation {
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  timestamp: Date;
}

interface TrackingEvent {
  id: string;
  status: 'confirmed' | 'assigned' | 'pickup' | 'in_transit' | 'arrived' | 'delivered';
  message: string;
  timestamp: string;
  location?: string;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  rating: number;
  vehicle: {
    type: string;
    make: string;
    model: string;
    plateNumber: string;
    color: string;
  };
  photo?: string;
  currentLocation?: DriverLocation;
}

interface LiveBooking {
  id: string;
  customerId: string;
  driverId: string;
  status: 'confirmed' | 'assigned' | 'pickup' | 'in_transit' | 'delivered' | 'cancelled';
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  deliveryLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  scheduledDateTime: string;
  estimatedArrival?: string;
  actualArrival?: string;
  driver: Driver;
  totalCost: number;
  events: TrackingEvent[];
  route?: Array<{ latitude: number; longitude: number }>;
  eta?: number; // minutes
  distance?: number; // kilometers
}

export default function RealTimeTrackingScreen({ navigation, route }: RealTimeTrackingScreenProps) {
  const [booking, setBooking] = useState<LiveBooking | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDriverChat, setShowDriverChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mapRef = useRef<MapView>(null);
  const bookingId = route.params?.bookingId;

  useEffect(() => {
    initializeTracking();
    return () => {
      cleanup();
    };
  }, [bookingId]);

  const initializeTracking = async () => {
    try {
      setIsLoading(true);
      
      // Load booking details
      await loadBookingDetails();
      
      // Connect to real-time services
      await connectToRealTimeServices();
      
    } catch (error) {
      console.error('Initialize tracking error:', error);
      Alert.alert('Error', 'Failed to load tracking information');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookingDetails = async () => {
    try {
      const bookingData = await customerAPI.getBookingDetails(bookingId);
      
      // Convert BookingDetails to LiveBooking format
      const liveBooking: LiveBooking = {
        id: bookingData.id,
        customerId: '', // Will be filled from context or socket
        driverId: bookingData.driverId,
        status: bookingData.status,
        pickupLocation: bookingData.pickupLocation,
        deliveryLocation: bookingData.deliveryLocation,
        scheduledDateTime: bookingData.scheduledDateTime,
        estimatedArrival: bookingData.estimatedArrival,
        driver: {
          id: bookingData.driverId,
          name: bookingData.driverName,
          phone: bookingData.driverPhone,
          rating: bookingData.driverRating,
          vehicle: {
            type: bookingData.vehicleType,
            make: '',
            model: '',
            plateNumber: bookingData.vehicleNumber,
            color: '',
          },
        },
        totalCost: bookingData.totalPrice,
        events: [], // Will be loaded separately or from socket
        eta: bookingData.eta,
        distance: bookingData.distance,
      };
      
      setBooking(liveBooking);

      // Focus map on route if available
      if (bookingData.pickupLocation && bookingData.deliveryLocation) {
        focusMapOnRoute(bookingData.pickupLocation, bookingData.deliveryLocation);
      }
    } catch (error) {
      console.error('Load booking details error:', error);
    }
  };

  const connectToRealTimeServices = async () => {
    try {
      await customerSocketService.connect();
      setIsConnected(true);

      // Join booking room for real-time updates
      customerSocketService.joinBooking(bookingId);

      // Set up event listeners
      customerSocketService.on('driver:location_update', handleDriverLocationUpdate);
      customerSocketService.on('booking:status_changed', handleBookingStatusChange);
      customerSocketService.on('booking:eta_update', handleETAUpdate);
      customerSocketService.on('chat:new_message', handleNewChatMessage);
      customerSocketService.on('driver:arrived', handleDriverArrival);

    } catch (error) {
      console.error('Real-time connection error:', error);
      setIsConnected(false);
    }
  };

  const cleanup = () => {
    if (bookingId) {
      customerSocketService.leaveBooking(bookingId);
    }
    customerSocketService.off('driver:location_update', handleDriverLocationUpdate);
    customerSocketService.off('booking:status_changed', handleBookingStatusChange);
    customerSocketService.off('booking:eta_update', handleETAUpdate);
    customerSocketService.off('chat:new_message', handleNewChatMessage);
    customerSocketService.off('driver:arrived', handleDriverArrival);
  };

  const handleDriverLocationUpdate = (data: { driverId: string; latitude: number; longitude: number; timestamp: Date }) => {
    if (booking && data.driverId === booking.driverId) {
      setBooking(prev => prev ? {
        ...prev,
        driver: {
          ...prev.driver,
          currentLocation: {
            latitude: data.latitude,
            longitude: data.longitude,
            heading: 0,
            speed: 0,
            timestamp: data.timestamp
          }
        }
      } : null);

      // Update ETA based on new location
      requestETAUpdate();
    }
  };

  const handleBookingStatusChange = (data: { bookingId: string; status: string; timestamp: Date }) => {
    if (data.bookingId === bookingId) {
      setBooking(prev => prev ? { ...prev, status: data.status as any } : null);
      
      // Add event to timeline
      const newEvent: TrackingEvent = {
        id: Date.now().toString(),
        status: data.status as any,
        message: getStatusMessage(data.status),
        timestamp: data.timestamp.toISOString(),
      };

      setBooking(prev => prev ? {
        ...prev,
        events: [...prev.events, newEvent]
      } : null);
    }
  };

  const handleETAUpdate = (data: { bookingId: string; eta: number; distance: number }) => {
    if (data.bookingId === bookingId) {
      setBooking(prev => prev ? {
        ...prev,
        eta: data.eta,
        distance: data.distance
      } : null);
    }
  };

  const handleNewChatMessage = (message: any) => {
    setChatMessages(prev => [...prev, message]);
  };

  const handleDriverArrival = (data: { bookingId: string; message: string }) => {
    if (data.bookingId === bookingId) {
      Alert.alert('Driver Arrived', data.message, [
        { text: 'OK', onPress: () => {} }
      ]);
    }
  };

  const requestETAUpdate = () => {
    if (booking?.driverId) {
      customerSocketService.requestETA(bookingId, booking.driverId);
    }
  };

  const focusMapOnRoute = (pickup: { latitude: number; longitude: number }, delivery: { latitude: number; longitude: number }) => {
    if (mapRef.current) {
      mapRef.current.fitToCoordinates([pickup, delivery], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  const getStatusMessage = (status: string): string => {
    switch (status) {
      case 'confirmed': return 'Booking confirmed';
      case 'assigned': return 'Driver assigned to your booking';
      case 'pickup': return 'Driver is heading to pickup location';
      case 'in_transit': return 'Items picked up, heading to delivery';
      case 'delivered': return 'Order delivered successfully';
      default: return 'Status updated';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#0057FF';
      case 'assigned': return '#FF8C00';
      case 'pickup': return '#007AFF';
      case 'in_transit': return '#34C759';
      case 'delivered': return '#30D158';
      case 'cancelled': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const callDriver = () => {
    if (booking?.driver.phone) {
      Linking.openURL(`tel:${booking.driver.phone}`);
    }
  };

  const openDriverChat = () => {
    setShowDriverChat(true);
    // Load chat history
    loadChatHistory();
  };

  const loadChatHistory = async () => {
    try {
      const response = await customerAPI.getChatMessages(bookingId);
      // Handle both array and object responses
      const messages = Array.isArray(response) ? response : response.messages || [];
      setChatMessages(messages);
    } catch (error) {
      console.error('Load chat history error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookingDetails();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading tracking information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#FF3B30" />
          <Text style={styles.errorTitle}>Booking Not Found</Text>
          <Text style={styles.errorText}>Could not load tracking information</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBookingDetails}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <View style={styles.headerRight}>
          <View style={[styles.connectionStatus, { backgroundColor: isConnected ? '#34C759' : '#FF3B30' }]}>
            <Text style={styles.connectionText}>{isConnected ? 'LIVE' : 'OFFLINE'}</Text>
          </View>
        </View>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsTraffic={true}
          initialRegion={{
            latitude: booking.pickupLocation.latitude,
            longitude: booking.pickupLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* Pickup Location */}
          <Marker
            coordinate={booking.pickupLocation}
            title="Pickup Location"
            description={booking.pickupLocation.address}
            pinColor="orange"
          />

          {/* Delivery Location */}
          <Marker
            coordinate={booking.deliveryLocation}
            title="Delivery Location"
            description={booking.deliveryLocation.address}
            pinColor="green"
          />

          {/* Driver Location */}
          {booking.driver.currentLocation && (
            <Marker
              coordinate={{
                latitude: booking.driver.currentLocation.latitude,
                longitude: booking.driver.currentLocation.longitude,
              }}
              title={`${booking.driver.name} - ${booking.driver.vehicle.plateNumber}`}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.driverMarker}>
                <Feather name="truck" size={20} color="white" />
              </View>
            </Marker>
          )}

          {/* Route */}
          {booking.route && (
            <Polyline
              coordinates={booking.route}
              strokeColor="#007AFF"
              strokeWidth={4}
            />
          )}
        </MapView>

        {/* Map Controls */}
        <TouchableOpacity
          style={styles.centerButton}
          onPress={() => {
            if (booking.driver.currentLocation) {
              mapRef.current?.animateToRegion({
                latitude: booking.driver.currentLocation.latitude,
                longitude: booking.driver.currentLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
            }
          }}
        >
          <Feather name="navigation" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <ScrollView 
        style={styles.bottomSheet}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
              <Text style={styles.statusText}>{booking.status.toUpperCase()}</Text>
            </View>
            {booking.eta && (
              <Text style={styles.etaText}>ETA: {booking.eta} min</Text>
            )}
          </View>
          
          <View style={styles.addressContainer}>
            <View style={styles.addressRow}>
              <View style={styles.addressDot} />
              <Text style={styles.addressText}>{booking.pickupLocation.address}</Text>
            </View>
            <View style={styles.addressLine} />
            <View style={styles.addressRow}>
              <View style={[styles.addressDot, { backgroundColor: '#34C759' }]} />
              <Text style={styles.addressText}>{booking.deliveryLocation.address}</Text>
            </View>
          </View>
        </View>

        {/* Driver Info Card */}
        <View style={styles.driverCard}>
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarText}>{booking.driver.name.charAt(0)}</Text>
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{booking.driver.name}</Text>
              <Text style={styles.vehicleInfo}>
                {booking.driver.vehicle.make} {booking.driver.vehicle.model} • {booking.driver.vehicle.plateNumber}
              </Text>
              <View style={styles.ratingContainer}>
                <Feather name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{booking.driver.rating}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.driverActions}>
            <TouchableOpacity style={styles.actionButton} onPress={callDriver}>
              <Feather name="phone" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={openDriverChat}>
              <Feather name="message-circle" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Tracking Timeline</Text>
          {booking.events.map((event, index) => (
            <View key={event.id} style={styles.timelineItem}>
              <View style={styles.timelineMarker}>
                <View style={[styles.timelineDot, { backgroundColor: getStatusColor(event.status) }]} />
                {index < booking.events.length - 1 && <View style={styles.timelineLine} />}
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineMessage}>{event.message}</Text>
                <Text style={styles.timelineTime}>{new Date(event.timestamp).toLocaleString()}</Text>
                {event.location && (
                  <Text style={styles.timelineLocation}>{event.location}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  headerRight: {
    width: 32,
  },
  connectionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connectionText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  mapContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  driverMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  centerButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  statusCard: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  etaText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  addressContainer: {
    marginLeft: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  addressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF8C00',
    marginRight: 12,
  },
  addressLine: {
    width: 1,
    height: 20,
    backgroundColor: '#e0e0e0',
    marginLeft: 4,
    marginVertical: 2,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  driverCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  driverDetails: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  vehicleInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  driverActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineMarker: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  timelineTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  timelineLocation: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 2,
  },
});
