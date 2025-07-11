import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { liveDataService } from '../services/liveDataService';
import { realTimeService } from '../services/realTimeService';

const { width, height } = Dimensions.get('window');

interface TrackingData {
  bookingId: string;
  driver: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    currentLocation: {
      latitude: number;
      longitude: number;
      heading?: number;
      speed?: number;
    };
    isOnline: boolean;
  };
  truck: {
    id: string;
    make: string;
    model: string;
    registrationNumber: string;
    fuelLevel?: number;
    mileage?: number;
  };
  route: {
    pickup: {
      address: string;
      latitude: number;
      longitude: number;
      estimatedArrival?: Date;
      status: 'pending' | 'arrived' | 'completed';
    };
    delivery: {
      address: string;
      latitude: number;
      longitude: number;
      estimatedArrival?: Date;
      status: 'pending' | 'arrived' | 'completed';
    };
    waypoints: Array<{
      latitude: number;
      longitude: number;
      timestamp: Date;
    }>;
  };
  status: string;
  estimatedDuration: number;
  actualDuration?: number;
  distance: number;
  geofences: Array<{
    id: string;
    latitude: number;
    longitude: number;
    radius: number;
    type: 'pickup' | 'delivery' | 'checkpoint';
    name: string;
  }>;
}

interface LiveTrackingProps {
  bookingId: string;
  onClose: () => void;
}

const LiveTrackingScreen: React.FC<LiveTrackingProps> = ({ bookingId, onClose }) => {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [followDriver, setFollowDriver] = useState(true);
  const [showDriverInfo, setShowDriverInfo] = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  
  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    initializeTracking();
    setupRealTimeUpdates();
    requestLocationPermission();

    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      realTimeService.disconnect();
    };
  }, [bookingId]);

  const initializeTracking = async () => {
    try {
      const response = await liveDataService.get(`/tracking/${bookingId}`);
      if (response.success) {
        setTrackingData(response.data);
        if (followDriver && response.data.driver.currentLocation) {
          centerMapOnDriver(response.data.driver.currentLocation);
        }
      } else {
        Alert.alert('Error', 'Failed to load tracking data');
      }
    } catch (error) {
      console.error('Error loading tracking data:', error);
      Alert.alert('Error', 'Network error while loading tracking data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    realTimeService.connect();
    
    // Listen for driver location updates
    realTimeService.onDriverLocationUpdate((update) => {
      if (update.bookingId === bookingId) {
        setTrackingData(prev => {
          if (!prev) return null;
          
          const updatedData = {
            ...prev,
            driver: {
              ...prev.driver,
              currentLocation: update.location,
            },
            route: {
              ...prev.route,
              waypoints: [...prev.route.waypoints, {
                latitude: update.location.latitude,
                longitude: update.location.longitude,
                timestamp: new Date(),
              }],
            },
          };

          if (followDriver) {
            centerMapOnDriver(update.location);
          }

          return updatedData;
        });
      }
    });

    // Listen for status updates
    realTimeService.onTrackingUpdate((update) => {
      if (update.bookingId === bookingId) {
        setTrackingData(prev => {
          if (!prev) return null;
          return {
            ...prev,
            status: update.status,
            route: {
              ...prev.route,
              pickup: {
                ...prev.route.pickup,
                status: update.pickupStatus || prev.route.pickup.status,
                estimatedArrival: update.pickupETA ? new Date(update.pickupETA) : prev.route.pickup.estimatedArrival,
              },
              delivery: {
                ...prev.route.delivery,
                status: update.deliveryStatus || prev.route.delivery.status,
                estimatedArrival: update.deliveryETA ? new Date(update.deliveryETA) : prev.route.delivery.estimatedArrival,
              },
            },
          };
        });
      }
    });

    // Listen for geofence events
    realTimeService.onGeofenceEvent((event) => {
      if (event.bookingId === bookingId) {
        const message = event.entered 
          ? `Driver has arrived at ${event.geofenceName}`
          : `Driver has left ${event.geofenceName}`;
        
        Alert.alert('Location Update', message);
      }
    });
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        
        // Start watching user location
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000,
            distanceInterval: 50,
          },
          (location) => {
            setUserLocation(location);
          }
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const centerMapOnDriver = (location: { latitude: number; longitude: number }) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const centerMapOnRoute = () => {
    if (mapRef.current && trackingData) {
      const coordinates = [
        trackingData.route.pickup,
        trackingData.driver.currentLocation,
        trackingData.route.delivery,
      ];
      
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      });
      setFollowDriver(false);
    }
  };

  const callDriver = () => {
    if (trackingData?.driver.phone) {
      const phoneUrl = `tel:${trackingData.driver.phone}`;
      Alert.alert(
        'Call Driver',
        `Call ${trackingData.driver.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Call', onPress: () => Linking.openURL(phoneUrl) },
        ]
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'arrived':
        return '#3B82F6';
      case 'completed':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'clock';
      case 'arrived':
        return 'map-pin';
      case 'completed':
        return 'check-circle';
      default:
        return 'help-circle';
    }
  };

  const formatTime = (date: Date | undefined) => {
    if (!date) return 'Calculating...';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatSpeed = (speed: number | undefined) => {
    if (!speed) return '0 km/h';
    return `${Math.round(speed * 3.6)} km/h`;
  };

  if (loading || !trackingData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading tracking data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setShowDriverInfo(true)}
        >
          <Feather name="user" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        mapType={mapType}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsTraffic={true}
        initialRegion={{
          latitude: trackingData.driver.currentLocation.latitude,
          longitude: trackingData.driver.currentLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* Driver Marker */}
        <Marker
          coordinate={trackingData.driver.currentLocation}
          title={trackingData.driver.name}
          description={`${trackingData.truck.make} ${trackingData.truck.model}`}
          rotation={trackingData.driver.currentLocation.heading || 0}
        >
          <View style={styles.driverMarker}>
            <Feather name="truck" size={20} color="#FFFFFF" />
          </View>
        </Marker>

        {/* Pickup Marker */}
        <Marker
          coordinate={trackingData.route.pickup}
          title="Pickup Location"
          description={trackingData.route.pickup.address}
        >
          <View style={[styles.locationMarker, { backgroundColor: getStatusColor(trackingData.route.pickup.status) }]}>
            <Feather name="package" size={16} color="#FFFFFF" />
          </View>
        </Marker>

        {/* Delivery Marker */}
        <Marker
          coordinate={trackingData.route.delivery}
          title="Delivery Location"
          description={trackingData.route.delivery.address}
        >
          <View style={[styles.locationMarker, { backgroundColor: getStatusColor(trackingData.route.delivery.status) }]}>
            <Feather name="map-pin" size={16} color="#FFFFFF" />
          </View>
        </Marker>

        {/* Route Polyline */}
        {trackingData.route.waypoints.length > 1 && (
          <Polyline
            coordinates={trackingData.route.waypoints}
            strokeColor="#0057FF"
            strokeWidth={3}
            strokePattern={[1]}
          />
        )}

        {/* Geofences */}
        {trackingData.geofences.map((geofence) => (
          <Circle
            key={geofence.id}
            center={geofence}
            radius={geofence.radius}
            strokeColor="#0057FF"
            strokeWidth={2}
            fillColor="rgba(0, 87, 255, 0.1)"
          />
        ))}
      </MapView>

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={[styles.controlButton, followDriver && styles.controlButtonActive]}
          onPress={() => {
            setFollowDriver(!followDriver);
            if (!followDriver) {
              centerMapOnDriver(trackingData.driver.currentLocation);
            }
          }}
        >
          <Feather name="navigation" size={20} color={followDriver ? "#FFFFFF" : "#0057FF"} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={centerMapOnRoute}
        >
          <Feather name="maximize" size={20} color="#0057FF" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            const nextMapType = mapType === 'standard' ? 'satellite' : mapType === 'satellite' ? 'hybrid' : 'standard';
            setMapType(nextMapType);
          }}
        >
          <Feather name="layers" size={20} color="#0057FF" />
        </TouchableOpacity>
      </View>

      {/* Status Panel */}
      <View style={styles.statusPanel}>
        <TouchableOpacity 
          style={styles.statusHeader}
          onPress={() => setShowRouteDetails(true)}
        >
          <View style={styles.statusInfo}>
            <Text style={styles.statusTitle}>
              {trackingData.status.charAt(0).toUpperCase() + trackingData.status.slice(1)}
            </Text>
            <Text style={styles.statusSubtitle}>
              Distance: {formatDistance(trackingData.distance)} • 
              Speed: {formatSpeed(trackingData.driver.currentLocation.speed)}
            </Text>
          </View>
          <Feather name="chevron-up" size={20} color="#6B7280" />
        </TouchableOpacity>

        <View style={styles.routeProgress}>
          <View style={styles.routeStep}>
            <View style={[styles.stepIcon, { backgroundColor: getStatusColor(trackingData.route.pickup.status) }]}>
              <Feather name={getStatusIcon(trackingData.route.pickup.status) as any} size={12} color="#FFFFFF" />
            </View>
            <View style={styles.stepDetails}>
              <Text style={styles.stepTitle}>Pickup</Text>
              <Text style={styles.stepTime}>ETA: {formatTime(trackingData.route.pickup.estimatedArrival)}</Text>
            </View>
          </View>

          <View style={styles.progressLine} />

          <View style={styles.routeStep}>
            <View style={[styles.stepIcon, { backgroundColor: getStatusColor(trackingData.route.delivery.status) }]}>
              <Feather name={getStatusIcon(trackingData.route.delivery.status) as any} size={12} color="#FFFFFF" />
            </View>
            <View style={styles.stepDetails}>
              <Text style={styles.stepTitle}>Delivery</Text>
              <Text style={styles.stepTime}>ETA: {formatTime(trackingData.route.delivery.estimatedArrival)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={callDriver}>
          <Feather name="phone" size={20} color="#10B981" />
          <Text style={styles.actionButtonText}>Call Driver</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="message-circle" size={20} color="#0057FF" />
          <Text style={styles.actionButtonText}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="help-circle" size={20} color="#F59E0B" />
          <Text style={styles.actionButtonText}>Support</Text>
        </TouchableOpacity>
      </View>

      {/* Driver Info Modal */}
      <Modal visible={showDriverInfo} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Driver Information</Text>
            <TouchableOpacity onPress={() => setShowDriverInfo(false)}>
              <Feather name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.driverCard}>
              <View style={styles.driverAvatar}>
                <Feather name="user" size={32} color="#0057FF" />
              </View>
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{trackingData.driver.name}</Text>
                <View style={styles.driverRating}>
                  <Feather name="star" size={16} color="#FFB800" />
                  <Text style={styles.ratingText}>{trackingData.driver.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.driverPhone}>{trackingData.driver.phone}</Text>
                <View style={[styles.onlineStatus, { backgroundColor: trackingData.driver.isOnline ? '#10B981' : '#EF4444' }]}>
                  <Text style={styles.onlineStatusText}>
                    {trackingData.driver.isOnline ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.truckCard}>
              <Text style={styles.cardTitle}>Vehicle Information</Text>
              <View style={styles.truckDetails}>
                <Text style={styles.truckName}>
                  {trackingData.truck.make} {trackingData.truck.model}
                </Text>
                <Text style={styles.truckReg}>{trackingData.truck.registrationNumber}</Text>
                {trackingData.truck.fuelLevel && (
                  <View style={styles.truckStat}>
                    <Feather name="zap" size={16} color="#F59E0B" />
                    <Text style={styles.truckStatText}>Fuel: {trackingData.truck.fuelLevel}%</Text>
                  </View>
                )}
                {trackingData.truck.mileage && (
                  <View style={styles.truckStat}>
                    <Feather name="activity" size={16} color="#6B7280" />
                    <Text style={styles.truckStatText}>Mileage: {trackingData.truck.mileage.toLocaleString()}km</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Route Details Modal */}
      <Modal visible={showRouteDetails} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Route Details</Text>
            <TouchableOpacity onPress={() => setShowRouteDetails(false)}>
              <Feather name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.routeCard}>
              <Text style={styles.cardTitle}>Journey Progress</Text>
              <View style={styles.journeyStats}>
                <View style={styles.journeyStat}>
                  <Text style={styles.journeyStatValue}>{formatDistance(trackingData.distance)}</Text>
                  <Text style={styles.journeyStatLabel}>Total Distance</Text>
                </View>
                <View style={styles.journeyStat}>
                  <Text style={styles.journeyStatValue}>
                    {Math.round(trackingData.estimatedDuration / 60)}min
                  </Text>
                  <Text style={styles.journeyStatLabel}>Est. Duration</Text>
                </View>
                <View style={styles.journeyStat}>
                  <Text style={styles.journeyStatValue}>
                    {formatSpeed(trackingData.driver.currentLocation.speed)}
                  </Text>
                  <Text style={styles.journeyStatLabel}>Current Speed</Text>
                </View>
              </View>
            </View>

            <View style={styles.addressCard}>
              <Text style={styles.cardTitle}>Addresses</Text>
              <View style={styles.addressItem}>
                <Feather name="map-pin" size={20} color="#10B981" />
                <View style={styles.addressDetails}>
                  <Text style={styles.addressLabel}>Pickup</Text>
                  <Text style={styles.addressText}>{trackingData.route.pickup.address}</Text>
                </View>
              </View>
              <View style={styles.addressItem}>
                <Feather name="navigation" size={20} color="#EF4444" />
                <View style={styles.addressDetails}>
                  <Text style={styles.addressLabel}>Delivery</Text>
                  <Text style={styles.addressText}>{trackingData.route.delivery.address}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#0057FF',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerButton: {
    padding: 8,
  },
  map: {
    width: width,
    height: height,
  },
  mapControls: {
    position: 'absolute',
    top: 140,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  controlButtonActive: {
    backgroundColor: '#0057FF',
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0057FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  locationMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  statusPanel: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  routeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeStep: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  stepDetails: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  stepTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  driverCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  driverAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverDetails: {
    alignItems: 'center',
  },
  driverName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 4,
  },
  driverPhone: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  onlineStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  truckCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  truckDetails: {
    alignItems: 'center',
  },
  truckName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  truckReg: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  truckStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  truckStatText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  routeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  journeyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  journeyStat: {
    alignItems: 'center',
  },
  journeyStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  journeyStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  addressCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addressDetails: {
    flex: 1,
    marginLeft: 12,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: 16,
    color: '#111827',
    marginTop: 2,
  },
});

export default LiveTrackingScreen;
