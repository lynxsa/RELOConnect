import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps'; // Temporarily disabled
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useBookingStore } from '../../store';
import { Button, Card } from '../../components/ui';

const { width, height } = Dimensions.get('window');

interface DriverInfo {
  id: string;
  name: string;
  rating: number;
  phone: string;
  vehicle: {
    make: string;
    model: string;
    color: string;
    licensePlate: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  eta: string;
  status: 'assigned' | 'en_route_pickup' | 'arrived_pickup' | 'loading' | 'en_route_dropoff' | 'arrived_dropoff' | 'completed';
}

const mockDriver: DriverInfo = {
  id: 'driver_123',
  name: 'James Nkomo',
  rating: 4.8,
  phone: '+27 82 123 4567',
  vehicle: {
    make: 'Ford',
    model: 'Transit',
    color: 'White',
    licensePlate: 'GP 123 ABC',
  },
  location: {
    latitude: -26.2041,
    longitude: 28.0473,
  },
  eta: '15 minutes',
  status: 'en_route_pickup',
};

const statusMessages = {
  assigned: 'Driver has been assigned to your booking',
  en_route_pickup: 'Driver is on the way to pickup location',
  arrived_pickup: 'Driver has arrived at pickup location',
  loading: 'Loading your items',
  en_route_dropoff: 'On the way to drop-off location',
  arrived_dropoff: 'Arrived at drop-off location',
  completed: 'Move completed successfully',
};

export default function OrderTrackingScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { bookingHistory } = useBookingStore();
  // const mapRef = useRef<MapView>(null); // Temporarily disabled

  const [driver, setDriver] = useState<DriverInfo>(mockDriver);
  const [showDriverCard, setShowDriverCard] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Get the latest booking
  const latestBooking = bookingHistory[bookingHistory.length - 1];

  useEffect(() => {
    // Animate driver card slide in
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Simulate driver location updates
    const locationInterval = setInterval(() => {
      setDriver(prev => ({
        ...prev,
        location: {
          latitude: prev.location.latitude + (Math.random() - 0.5) * 0.001,
          longitude: prev.location.longitude + (Math.random() - 0.5) * 0.001,
        },
      }));
    }, 5000);

    return () => clearInterval(locationInterval);
  }, [slideAnim]);

  const handleCallDriver = () => {
    Alert.alert(
      'Call Driver',
      `Call ${driver.name} at ${driver.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Calling driver...') },
      ]
    );
  };

  const handleChatDriver = () => {
    navigation.navigate('Chat' as never);
  };

  const handleCenterMap = () => {
    // Temporarily disabled
    console.log('Map centering disabled until maps integration is complete');
    /*
    if (mapRef.current && latestBooking) {
      mapRef.current.fitToCoordinates([
        latestBooking.pickupLocation,
        latestBooking.dropoffLocation,
        driver.location,
      ], {
        edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
        animated: true,
      });
    }
    */
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
      case 'en_route_pickup':
        return '#3B82F6';
      case 'arrived_pickup':
      case 'loading':
        return '#F59E0B';
      case 'en_route_dropoff':
        return '#8B5CF6';
      case 'arrived_dropoff':
      case 'completed':
        return '#10B981';
      default:
        return colors.primary;
    }
  };

  if (!latestBooking) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            No active booking found
          </Text>
        </View>
      </View>
    );
  }

  const routeCoordinates = [
    latestBooking.pickupLocation,
    driver.location,
    latestBooking.dropoffLocation,
  ];

  return (
    <View style={styles.container}>
      {/* Map View - Temporarily disabled */}
      <View style={[styles.map, { backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text, fontSize: 16 }}>Tracking Map</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Real-time tracking coming soon</Text>
      </View>
      {/* 
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: (latestBooking.pickupLocation.latitude + latestBooking.dropoffLocation.latitude) / 2,
          longitude: (latestBooking.pickupLocation.longitude + latestBooking.dropoffLocation.longitude) / 2,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        onMapReady={handleCenterMap}
      >
        <Marker
          coordinate={latestBooking.pickupLocation}
          title="Pickup Location"
          description={latestBooking.pickupLocation.address}
        >
          <View style={styles.pickupMarker}>
            <Ionicons name="location" size={30} color="#0057FF" />
          </View>
        </Marker>

        <Marker
          coordinate={latestBooking.dropoffLocation}
          title="Drop-off Location"
          description={latestBooking.dropoffLocation.address}
        >
          <View style={styles.dropoffMarker}>
            <Ionicons name="location" size={30} color="#00B2FF" />
          </View>
        </Marker>

        <Marker
          coordinate={driver.location}
          title={`${driver.name} - ${driver.vehicle.make} ${driver.vehicle.model}`}
          description={`ETA: ${driver.eta}`}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.driverMarker}>
            <Ionicons name="car" size={24} color="white" />
          </View>
        </Marker>

        <Polyline
          coordinates={routeCoordinates}
          strokeColor="#0057FF"
          strokeWidth={3}
          lineDashPattern={[5, 5]}
        />
      </MapView>
      */}

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <TouchableOpacity
          style={[styles.mapButton, { backgroundColor: colors.background }]}
          onPress={handleCenterMap}
        >
          <Ionicons name="locate" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Status Header */}
      <View style={[styles.statusHeader, { backgroundColor: colors.background }]}>
        <View style={styles.statusContent}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(driver.status) }]} />
          <View style={styles.statusInfo}>
            <Text style={[styles.statusTitle, { color: colors.text }]}>
              {statusMessages[driver.status]}
            </Text>
            <Text style={[styles.statusEta, { color: colors.textSecondary }]}>
              ETA: {driver.eta}
            </Text>
          </View>
        </View>
      </View>

      {/* Driver Card */}
      {showDriverCard && (
        <Animated.View
          style={[
            styles.driverCard,
            {
              backgroundColor: colors.background,
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                }),
              }],
            },
          ]}
        >
          <View style={styles.cardHandle} />
          
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverInitials}>
                {driver.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            
            <View style={styles.driverDetails}>
              <Text style={[styles.driverName, { color: colors.text }]}>
                {driver.name}
              </Text>
              <View style={styles.driverRating}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                  {driver.rating}
                </Text>
              </View>
              <Text style={[styles.vehicleInfo, { color: colors.textSecondary }]}>
                {driver.vehicle.color} {driver.vehicle.make} {driver.vehicle.model}
              </Text>
              <Text style={[styles.licensePlate, { color: colors.textSecondary }]}>
                {driver.vehicle.licensePlate}
              </Text>
            </View>
          </View>

          <View style={styles.driverActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
              onPress={handleChatDriver}
            >
              <Ionicons name="chatbubble-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#10B981' + '20' }]}
              onPress={handleCallDriver}
            >
              <Ionicons name="call" size={24} color="#10B981" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
  },
  mapControls: {
    position: 'absolute',
    top: 100,
    right: 16,
    zIndex: 1,
  },
  mapButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusEta: {
    fontSize: 14,
  },
  pickupMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropoffMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0057FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  driverCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 34,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  driverInfo: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0057FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  driverInitials: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  vehicleInfo: {
    fontSize: 14,
    marginBottom: 2,
  },
  licensePlate: {
    fontSize: 14,
    fontWeight: '500',
  },
  driverActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
