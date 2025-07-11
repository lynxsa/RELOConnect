import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Switch,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

interface DriverStats {
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  completedOrders: number;
  rating: number;
  totalDistance: number;
  hoursWorked: number;
}

interface Order {
  id: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedTime: string;
  value: number;
  distance: string;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  priority: 'normal' | 'urgent' | 'premium';
}

const ModernDriverDashboard: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [driverStats, setDriverStats] = useState<DriverStats>({
    todayEarnings: 0,
    weeklyEarnings: 0,
    monthlyEarnings: 0,
    completedOrders: 0,
    rating: 0,
    totalDistance: 0,
    hoursWorked: 0,
  });
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    initializeDashboard();
    if (isOnline) {
      startLocationTracking();
    }
  }, [isOnline]);

  const initializeDashboard = async () => {
    setLoading(true);
    await Promise.all([
      loadDriverStats(),
      loadAvailableOrders(),
      loadActiveOrder(),
    ]);
    setLoading(false);
  };

  const loadDriverStats = async () => {
    try {
      // Mock data - replace with real API call
      setDriverStats({
        todayEarnings: 185.50,
        weeklyEarnings: 1240.75,
        monthlyEarnings: 4820.30,
        completedOrders: 12,
        rating: 4.8,
        totalDistance: 145.5,
        hoursWorked: 8.5,
      });
    } catch (error) {
      console.error('Error loading driver stats:', error);
    }
  };

  const loadAvailableOrders = async () => {
    try {
      // Mock data - replace with real API call
      const mockOrders: Order[] = [
        {
          id: 'ORD-001',
          customerName: 'Sarah Johnson',
          pickupAddress: '123 Main St, Downtown',
          deliveryAddress: '456 Oak Ave, Uptown',
          estimatedTime: '45 min',
          value: 85.00,
          distance: '12.5 mi',
          status: 'assigned',
          priority: 'premium',
        },
        {
          id: 'ORD-002',
          customerName: 'Mike Chen',
          pickupAddress: '789 Pine Rd, Midtown',
          deliveryAddress: '321 Elm Dr, Westside',
          estimatedTime: '30 min',
          value: 65.00,
          distance: '8.2 mi',
          status: 'assigned',
          priority: 'urgent',
        },
        {
          id: 'ORD-003',
          customerName: 'Emily Davis',
          pickupAddress: '555 Cedar Ln, Eastside',
          deliveryAddress: '888 Maple Ct, Southtown',
          estimatedTime: '60 min',
          value: 120.00,
          distance: '18.7 mi',
          status: 'assigned',
          priority: 'normal',
        },
      ];
      setAvailableOrders(mockOrders);
    } catch (error) {
      console.error('Error loading available orders:', error);
    }
  };

  const loadActiveOrder = async () => {
    try {
      // Mock active order - replace with real API call
      const mockActiveOrder: Order = {
        id: 'ORD-ACTIVE',
        customerName: 'John Smith',
        pickupAddress: '999 Broadway, Central',
        deliveryAddress: '777 5th Ave, North End',
        estimatedTime: '20 min',
        value: 95.00,
        distance: '9.8 mi',
        status: 'in_transit',
        priority: 'premium',
      };
      setActiveOrder(mockActiveOrder);
    } catch (error) {
      console.error('Error loading active order:', error);
    }
  };

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        // In a real app, you'd set up background location tracking here
      }
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const toggleOnlineStatus = async (value: boolean) => {
    setIsOnline(value);
    if (value) {
      Alert.alert('You\'re Online!', 'You will now receive order requests');
      startLocationTracking();
    } else {
      Alert.alert('You\'re Offline', 'You won\'t receive new order requests');
    }
  };

  const acceptOrder = (order: Order) => {
    Alert.alert(
      'Accept Order',
      `Accept order from ${order.customerName}?\nEstimated earnings: $${order.value}`,
      [
        { text: 'Decline', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: () => {
            setActiveOrder(order);
            setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
            Alert.alert('Order Accepted!', 'Navigate to pickup location');
          }
        },
      ]
    );
  };

  const updateOrderStatus = (status: Order['status']) => {
    if (!activeOrder) return;
    
    setActiveOrder(prev => prev ? { ...prev, status } : null);
    
    if (status === 'delivered') {
      Alert.alert('Order Completed!', `You earned $${activeOrder.value}`, [
        { text: 'OK', onPress: () => setActiveOrder(null) }
      ]);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    initializeDashboard().finally(() => setRefreshing(false));
  };

  const getPriorityColor = (priority: Order['priority']) => {
    switch (priority) {
      case 'premium': return '#FFD700';
      case 'urgent': return '#FF4757';
      case 'normal': return '#0057FF';
      default: return '#0057FF';
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'assigned': return '#FF9500';
      case 'picked_up': return '#007AFF';
      case 'in_transit': return '#34C759';
      case 'delivered': return '#30D158';
      default: return '#8E8E93';
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#0057FF', '#00B2FF']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greeting}>Good morning, Driver!</Text>
          <Text style={styles.locationText}>
            {location ? '📍 Location tracking active' : '📍 Location unavailable'}
          </Text>
        </View>
        <View style={styles.onlineToggle}>
          <Text style={styles.onlineLabel}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={toggleOnlineStatus}
            trackColor={{ false: '#767577', true: '#34C759' }}
            thumbColor={isOnline ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>
      </View>
    </LinearGradient>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.earningsCard]}>
          <Text style={styles.statValue}>${driverStats.todayEarnings}</Text>
          <Text style={styles.statLabel}>Today's Earnings</Text>
        </View>
        <View style={[styles.statCard, styles.ordersCard]}>
          <Text style={styles.statValue}>{driverStats.completedOrders}</Text>
          <Text style={styles.statLabel}>Orders Complete</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.ratingCard]}>
          <View style={styles.ratingContainer}>
            <Feather name="star" size={16} color="#FFD700" />
            <Text style={styles.statValue}>{driverStats.rating}</Text>
          </View>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={[styles.statCard, styles.distanceCard]}>
          <Text style={styles.statValue}>{driverStats.totalDistance} mi</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
      </View>
    </View>
  );

  const renderActiveOrder = () => {
    if (!activeOrder) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Order</Text>
        <View style={[styles.orderCard, styles.activeOrderCard]}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.customerName}>{activeOrder.customerName}</Text>
              <Text style={styles.orderId}>#{activeOrder.id}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(activeOrder.priority) }]}>
              <Text style={styles.priorityText}>{activeOrder.priority.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.addressContainer}>
            <View style={styles.addressRow}>
              <Feather name="circle" size={12} color="#34C759" />
              <Text style={styles.addressText}>{activeOrder.pickupAddress}</Text>
            </View>
            <View style={styles.addressDivider} />
            <View style={styles.addressRow}>
              <Feather name="map-pin" size={12} color="#FF3B30" />
              <Text style={styles.addressText}>{activeOrder.deliveryAddress}</Text>
            </View>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.detailItem}>
              <Feather name="clock" size={16} color="#666" />
              <Text style={styles.detailText}>{activeOrder.estimatedTime}</Text>
            </View>
            <View style={styles.detailItem}>
              <Feather name="navigation" size={16} color="#666" />
              <Text style={styles.detailText}>{activeOrder.distance}</Text>
            </View>
            <View style={styles.detailItem}>
              <Feather name="dollar-sign" size={16} color="#34C759" />
              <Text style={[styles.detailText, styles.earningsText]}>${activeOrder.value}</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            {activeOrder.status === 'assigned' && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.pickupButton]}
                onPress={() => updateOrderStatus('picked_up')}
              >
                <Text style={styles.actionButtonText}>Start Pickup</Text>
              </TouchableOpacity>
            )}
            {activeOrder.status === 'picked_up' && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.transitButton]}
                onPress={() => updateOrderStatus('in_transit')}
              >
                <Text style={styles.actionButtonText}>Items Loaded</Text>
              </TouchableOpacity>
            )}
            {activeOrder.status === 'in_transit' && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.deliverButton]}
                onPress={() => updateOrderStatus('delivered')}
              >
                <Text style={styles.actionButtonText}>Complete Delivery</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderAvailableOrders = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Available Orders</Text>
      {availableOrders.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="package" size={48} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>No Orders Available</Text>
          <Text style={styles.emptySubtext}>
            {isOnline ? 'New orders will appear here' : 'Go online to see available orders'}
          </Text>
        </View>
      ) : (
        availableOrders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <Text style={styles.orderId}>#{order.id}</Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(order.priority) }]}>
                <Text style={styles.priorityText}>{order.priority.toUpperCase()}</Text>
              </View>
            </View>
            
            <View style={styles.addressContainer}>
              <View style={styles.addressRow}>
                <Feather name="circle" size={12} color="#34C759" />
                <Text style={styles.addressText}>{order.pickupAddress}</Text>
              </View>
              <View style={styles.addressDivider} />
              <View style={styles.addressRow}>
                <Feather name="map-pin" size={12} color="#FF3B30" />
                <Text style={styles.addressText}>{order.deliveryAddress}</Text>
              </View>
            </View>

            <View style={styles.orderDetails}>
              <View style={styles.detailItem}>
                <Feather name="clock" size={16} color="#666" />
                <Text style={styles.detailText}>{order.estimatedTime}</Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="navigation" size={16} color="#666" />
                <Text style={styles.detailText}>{order.distance}</Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="dollar-sign" size={16} color="#34C759" />
                <Text style={[styles.detailText, styles.earningsText]}>${order.value}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => acceptOrder(order)}
              disabled={!isOnline}
            >
              <Text style={styles.actionButtonText}>Accept Order</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderStatsCards()}
        {renderActiveOrder()}
        {renderAvailableOrders()}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#E0F2FF',
  },
  onlineToggle: {
    alignItems: 'center',
  },
  onlineLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginTop: -10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  earningsCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  ordersCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  ratingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  distanceCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeOrderCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  orderId: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addressContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 14,
    color: '#1A1A1A',
    marginLeft: 8,
    flex: 1,
  },
  addressDivider: {
    width: 2,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginLeft: 6,
    marginVertical: 4,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  earningsText: {
    color: '#34C759',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#0057FF',
  },
  pickupButton: {
    backgroundColor: '#FF9500',
  },
  transitButton: {
    backgroundColor: '#007AFF',
  },
  deliverButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9E9E9E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BDBDBD',
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});

export default ModernDriverDashboard;
