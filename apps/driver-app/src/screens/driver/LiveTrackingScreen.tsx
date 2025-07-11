import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  Modal,
  FlatList,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { socketService } from '../../services/socketService';
import { driverAPI, DriverOrder } from '../../services/driverAPI';

const { width, height } = Dimensions.get('window');

interface LiveOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  status: 'assigned' | 'pickup' | 'in_transit' | 'delivered';
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
  estimatedEarnings: number;
  estimatedDuration: string;
  actualStartTime?: string;
  items: Array<{
    name: string;
    quantity: number;
    notes?: string;
  }>;
  customerNotes?: string;
  route?: Array<{
    latitude: number;
    longitude: number;
  }>;
}

interface DriverLocation {
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
}

const LiveTrackingScreen: React.FC = () => {
  const [currentOrder, setCurrentOrder] = useState<DriverOrder | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation>({
    latitude: -33.9234,
    longitude: 18.4224,
    heading: 45,
    speed: 0,
  });

  const [isTracking, setIsTracking] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const mapRef = useRef<MapView>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    initializeScreen();
    setupSocketConnection();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeScreen = async () => {
    try {
      setIsLoading(true);
      await requestLocationPermission();
      await loadActiveOrder();
    } catch (error) {
      console.error('Screen initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketConnection = async () => {
    try {
      await socketService.connect();
      setIsConnected(true);
      
      // Set up socket event listeners
      socketService.on('booking:assigned', handleNewOrderAssignment);
      socketService.on('booking:status_changed', handleOrderStatusChange);
      socketService.on('socket:reconnected', handleSocketReconnect);
      
    } catch (error) {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    }
  };

  const loadActiveOrder = async () => {
    try {
      const activeOrder = await driverAPI.getActiveOrder();
      setCurrentOrder(activeOrder);
      
      if (activeOrder) {
        socketService.joinBooking(activeOrder.id);
      }
    } catch (error) {
      console.error('Load active order error:', error);
    }
  };

  const handleNewOrderAssignment = (data: any) => {
    Alert.alert(
      'New Order Assigned',
      `You have been assigned a new order from ${data.customerName}`,
      [
        {
          text: 'View Order',
          onPress: () => loadActiveOrder(),
        },
      ]
    );
  };

  const handleOrderStatusChange = (data: any) => {
    if (currentOrder && data.bookingId === currentOrder.id) {
      setCurrentOrder(prev => prev ? { ...prev, status: data.status } : null);
    }
  };

  const handleSocketReconnect = () => {
    setIsConnected(true);
    if (currentOrder) {
      socketService.joinBooking(currentOrder.id);
    }
  };

  const cleanup = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }
    socketService.off('booking:assigned', handleNewOrderAssignment);
    socketService.off('booking:status_changed', handleOrderStatusChange);
    socketService.off('socket:reconnected', handleSocketReconnect);
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        getCurrentLocation();
      } else {
        Alert.alert(
          'Location Permission Required',
          'Location access is required for order tracking and navigation.'
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setDriverLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        heading: location.coords.heading || 0,
        speed: location.coords.speed || 0,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const startTracking = async () => {
    if (!locationPermission) {
      await requestLocationPermission();
      return;
    }

    try {
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            heading: location.coords.heading || 0,
            speed: location.coords.speed || 0,
          };
          
          setDriverLocation(newLocation);
          
          // Update backend and notify customers
          driverAPI.updateDriverLocation(newLocation.latitude, newLocation.longitude);
          socketService.updateLocation(newLocation, currentOrder?.id);
        }
      );

      setIsTracking(true);
    } catch (error) {
      console.error('Error starting location tracking:', error);
      Alert.alert('Error', 'Failed to start location tracking');
    }
  };

  const stopTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setIsTracking(false);
  };

  const updateOrderStatus = async (newStatus: DriverOrder['status']) => {
    if (!currentOrder) return;

    try {
      // Update status in backend
      await driverAPI.updateOrderStatus(currentOrder.id, newStatus);
      
      // Update local state
      setCurrentOrder({
        ...currentOrder,
        status: newStatus,
      });

      // Notify via socket
      socketService.updateOrderStatus(currentOrder.id, newStatus);

      let message = '';
      switch (newStatus) {
        case 'pickup':
          message = 'Started moving to pickup location';
          break;
        case 'in_transit':
          message = 'Items picked up, heading to delivery location';
          break;
        case 'delivered':
          message = 'Order completed successfully';
          // Complete the order
          await driverAPI.completeOrder(currentOrder.id, {
            driverNotes: 'Order delivered successfully',
          });
          break;
      }

      Alert.alert('Status Updated', message);
      
      // If order is completed, load next order
      if (newStatus === 'delivered') {
        setTimeout(() => {
          loadActiveOrder();
        }, 2000);
      }
    } catch (error) {
      console.error('Update order status error:', error);
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  const sendArrivalNotification = async () => {
    if (!currentOrder) return;

    try {
      socketService.sendArrivalNotification(currentOrder.id, currentOrder.customer.id);
      Alert.alert('Notification Sent', 'Customer has been notified of your arrival');
    } catch (error) {
      console.error('Send arrival notification error:', error);
      Alert.alert('Error', 'Failed to send arrival notification');
    }
  };

  const openNavigation = (location: { latitude: number; longitude: number }) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}&travelmode=driving`;
    Linking.openURL(url);
  };

  const callCustomer = () => {
    if (currentOrder?.customer.phone) {
      Linking.openURL(`tel:${currentOrder.customer.phone}`);
    }
  };

  const openCustomerChat = () => {
    if (currentOrder) {
      socketService.joinChat(currentOrder.customer.id);
      // Navigate to chat screen - would need navigation prop
      // navigation.navigate('Chat', { partnerId: currentOrder.customer.id });
    }
  };

  const getStatusColor = (status: DriverOrder['status']) => {
    switch (status) {
      case 'assigned': return '#FF9500';
      case 'pickup': return '#007AFF';
      case 'in_transit': return '#34C759';
      case 'delivered': return '#30D158';
      case 'cancelled': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getNextStatusAction = () => {
    if (!currentOrder) return null;

    switch (currentOrder.status) {
      case 'assigned':
        return { text: 'Start Pickup', action: () => updateOrderStatus('pickup') };
      case 'pickup':
        return { text: 'Items Picked Up', action: () => updateOrderStatus('in_transit') };
      case 'in_transit':
        return { text: 'Mark Delivered', action: () => updateOrderStatus('delivered') };
      default:
        return null;
    }
  };

  const renderOrderDetails = () => (
    <Modal
      visible={showOrderDetails}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Order Details</Text>
          <TouchableOpacity
            onPress={() => setShowOrderDetails(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {currentOrder && (
          <FlatList
            style={styles.detailsList}
            data={[
              { label: 'Customer', value: currentOrder.customer.name },
              { label: 'Phone', value: currentOrder.customer.phone },
              { label: 'Pickup', value: currentOrder.pickupLocation.address },
              { label: 'Delivery', value: currentOrder.deliveryLocation.address },
              { label: 'Price', value: `R${currentOrder.estimatedPrice.toFixed(2)}` },
              { label: 'Duration', value: currentOrder.estimatedDuration },
            ]}
            renderItem={({ item }) => (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>{item.label}:</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            )}
            keyExtractor={(item) => item.label}
          />
        )}

        {currentOrder?.items && (
          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>Items to Move</Text>
            <FlatList
              data={currentOrder.items}
              renderItem={({ item }) => (
                <View style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQuantity}>×{item.quantity}</Text>
                </View>
              )}
              keyExtractor={(item, index) => `${item.name}-${index}`}
            />
          </View>
        )}

        {currentOrder?.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>Customer Notes</Text>
            <Text style={styles.notesText}>{currentOrder.notes}</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );

  if (!currentOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noOrderContainer}>
          <Ionicons name="car-outline" size={64} color="#8E8E93" />
          <Text style={styles.noOrderText}>No active orders</Text>
          <Text style={styles.noOrderSubtext}>New orders will appear here</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsTraffic={true}
      >
        {/* Driver Location */}
        <Marker
          coordinate={driverLocation}
          title="Your Location"
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.driverMarker}>
            <Ionicons name="car" size={20} color="white" />
          </View>
        </Marker>

        {/* Pickup Location */}
        <Marker
          coordinate={currentOrder.pickupLocation}
          title="Pickup Location"
          description={currentOrder.pickupLocation.address}
          pinColor="orange"
        />

        {/* Delivery Location */}
        <Marker
          coordinate={currentOrder.deliveryLocation}
          title="Delivery Location"
          description={currentOrder.deliveryLocation.address}
          pinColor="green"
        />

        {/* Route */}
        {/* TODO: Add route coordinates when available
        {routeCoordinates && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#007AFF"
            strokeWidth={4}
          />
        )}
        */}
      </MapView>

      {/* Status Bar */}
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'transparent']}
        style={styles.statusOverlay}
      >
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentOrder.status) }]}>
            <Text style={styles.statusText}>
              {currentOrder.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowOrderDetails(true)}
            style={styles.detailsButton}
          >
            <Ionicons name="information-circle" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Bottom Control Panel */}
      <View style={styles.controlPanel}>
        <View style={styles.orderInfo}>
          <Text style={styles.customerName}>{currentOrder.customer.name}</Text>
          <Text style={styles.earnigns}>R{currentOrder.estimatedPrice.toFixed(2)}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            onPress={callCustomer}
            style={[styles.actionButton, styles.callButton]}
          >
            <Ionicons name="call" size={20} color="white" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => openNavigation(
              currentOrder.status === 'assigned' || currentOrder.status === 'pickup'
                ? currentOrder.pickupLocation
                : currentOrder.deliveryLocation
            )}
            style={[styles.actionButton, styles.navButton]}
          >
            <Ionicons name="navigate" size={20} color="white" />
            <Text style={styles.actionButtonText}>Navigate</Text>
          </TouchableOpacity>

          {getNextStatusAction() && (
            <TouchableOpacity
              onPress={getNextStatusAction()?.action}
              style={[styles.actionButton, styles.statusButton]}
            >
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={styles.actionButtonText}>
                {getNextStatusAction()?.text}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.trackingControls}>
          <Text style={styles.trackingLabel}>
            Live Tracking: {isTracking ? 'ON' : 'OFF'}
          </Text>
          <TouchableOpacity
            onPress={isTracking ? stopTracking : startTracking}
            style={[
              styles.trackingButton,
              { backgroundColor: isTracking ? '#FF3B30' : '#34C759' }
            ]}
          >
            <Text style={styles.trackingButtonText}>
              {isTracking ? 'Stop' : 'Start'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderOrderDetails()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    width: width,
    height: height * 0.6,
  },
  driverMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  statusOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  detailsButton: {
    padding: 8,
  },
  controlPanel: {
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  earnigns: {
    fontSize: 18,
    fontWeight: '700',
    color: '#34C759',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  callButton: {
    backgroundColor: '#007AFF',
  },
  navButton: {
    backgroundColor: '#FF9500',
  },
  statusButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  trackingControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  trackingLabel: {
    fontSize: 16,
    color: '#333',
  },
  trackingButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  trackingButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  noOrderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOrderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  noOrderSubtext: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  detailsList: {
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  itemsSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  notesSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  notesText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});

export default LiveTrackingScreen;
