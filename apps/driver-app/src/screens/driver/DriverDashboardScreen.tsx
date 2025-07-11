import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Dimensions,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import driverChatService from '../../services/driverChatService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface DriverStats {
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  completedOrders: number;
  rating: number;
  isOnline: boolean;
}

interface ActiveOrder {
  id: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedTime: string;
  value: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
}

// Enhanced interfaces for real-time features
interface DriverLocation {
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  accuracy: number;
  timestamp: string;
}

interface NewOrderNotification {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  distance: number;
  estimatedDuration: string;
  estimatedEarnings: number;
  priority: 'normal' | 'urgent' | 'express';
  expiresAt: string;
  items: Array<{
    name: string;
    quantity: number;
    weight?: number;
  }>;
}

interface RealTimeUpdate {
  type: 'new_order' | 'order_cancelled' | 'customer_message' | 'system_alert';
  data: any;
  timestamp: string;
}

const DriverDashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<DriverStats>({
    todayEarnings: 1250.00,
    weeklyEarnings: 8500.00,
    monthlyEarnings: 32500.00,
    completedOrders: 18,
    rating: 4.8,
    isOnline: true,
  });

  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([
    {
      id: '1',
      customerName: 'John Smith',
      pickupAddress: '123 Main St, Cape Town',
      deliveryAddress: '456 Oak Ave, Stellenbosch',
      estimatedTime: '45 min',
      value: 850.00,
      status: 'assigned',
    },
    {
      id: '2',
      customerName: 'Sarah Johnson',
      pickupAddress: '789 Pine Rd, Durban',
      deliveryAddress: '321 Beach Blvd, Umhlanga',
      estimatedTime: '30 min',
      value: 650.00,
      status: 'picked_up',
    },
  ]);

  const [refreshing, setRefreshing] = useState(false);
  const [locationTracking, setLocationTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<DriverLocation | null>(null);
  
  // Chat integration state
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isChatConnected, setIsChatConnected] = useState(false);
  const [driverId, setDriverId] = useState<string | null>(null);

  // Initialize chat service
  useEffect(() => {
    const initializeChatService = async () => {
      try {
        const authToken = await AsyncStorage.getItem('authToken');
        const userId = await AsyncStorage.getItem('userId');
        const storedDriverId = await AsyncStorage.getItem('driverId');
        
        if (authToken && userId) {
          setDriverId(storedDriverId);
          
          // Connect to chat service
          await driverChatService.connect(authToken, userId, storedDriverId || undefined);
          
          // Set up chat event handlers
          driverChatService.setEventHandlers({
            onNewMessage: (message) => {
              setUnreadMessages(prev => prev + 1);
              
              // Show notification for new customer message
              Alert.alert(
                'New Message',
                `Message from ${message.sender.firstName}: ${message.message.substring(0, 50)}...`,
                [
                  { text: 'Dismiss', style: 'cancel' },
                  { text: 'Open Chat', onPress: () => openChatWithCustomer(message.senderId, message.bookingId) }
                ]
              );
            },
            
            onConnectionChange: (connected) => {
              setIsChatConnected(connected);
            },
            
            onBookingUpdate: (data) => {
              // Handle booking updates
              if (data.type === 'driver_assigned') {
                // Auto-join booking chat room
                driverChatService.joinBooking(data.bookingId);
              }
            },
            
            onError: (error) => {
              Alert.alert('Chat Error', error);
            }
          });
        }
      } catch (error) {
        console.error('Failed to initialize chat service:', error);
      }
    };

    initializeChatService();

    return () => {
      driverChatService.removeEventHandlers();
    };
  }, []);

  // Chat functions
  const openChatWithCustomer = (customerId: string, bookingId?: string) => {
    // Navigate to chat screen with booking and customer info
    if (bookingId) {
      const customerInfo = JSON.stringify({
        id: customerId,
        firstName: 'Customer', // In a real app, you'd get this from the order data
        lastName: ''
      });
      
      // For now, let's use Alert to show the action until we have proper navigation
      Alert.alert(
        'Open Chat',
        `Opening chat for booking ${bookingId}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open', 
            onPress: () => {
              console.log('Would navigate to:', `/chat/${bookingId}?customer=${encodeURIComponent(customerInfo)}`);
              // In a proper setup, you'd use navigation here:
              // router.push(`/chat/${bookingId}?customer=${encodeURIComponent(customerInfo)}`);
            }
          }
        ]
      );
    }
  };

  const sendQuickUpdate = async (customerId: string, bookingId: string, updateType: 'arrived' | 'en_route' | 'loading' | 'completed') => {
    try {
      await driverChatService.sendCustomerUpdate(customerId, bookingId, updateType);
      Alert.alert('Success', 'Customer has been notified');
    } catch (error) {
      Alert.alert('Error', 'Failed to send update');
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const toggleOnlineStatus = () => {
    setStats(prev => ({
      ...prev,
      isOnline: !prev.isOnline,
    }));
    Alert.alert(
      'Status Updated',
      `You are now ${!stats.isOnline ? 'online' : 'offline'}`,
    );
  };

  const handleAcceptOrder = (orderId: string) => {
    Alert.alert(
      'Accept Order',
      'Do you want to accept this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: () => {
            // Update order status
            setActiveOrders(prev => 
              prev.map(order => 
                order.id === orderId 
                  ? { ...order, status: 'picked_up' as const }
                  : order
              )
            );
          }
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return '#FF9500';
      case 'picked_up': return '#007AFF';
      case 'in_transit': return '#34C759';
      case 'delivered': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned': return 'New Order';
      case 'picked_up': return 'Picked Up';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      default: return 'Unknown';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={['#0057FF', '#00B2FF']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Good morning, Driver!</Text>
              <View style={styles.connectionStatus}>
                <View style={[
                  styles.connectionDot,
                  { backgroundColor: isChatConnected ? '#34C759' : '#FF3B30' }
                ]} />
                <Text style={styles.connectionText}>
                  {isChatConnected ? 'Connected' : 'Connecting...'}
                </Text>
              </View>
            </View>
            
            <View style={styles.headerRight}>
              {/* Chat Button */}
              <TouchableOpacity
                style={styles.chatButton}
                onPress={() => openChatWithCustomer('', '')}
              >
                <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
                {unreadMessages > 0 && (
                  <View style={styles.chatBadge}>
                    <Text style={styles.chatBadgeText}>
                      {unreadMessages > 99 ? '99+' : unreadMessages.toString()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Online/Offline Status */}
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  { backgroundColor: stats.isOnline ? '#34C759' : '#FF3B30' },
                ]}
                onPress={toggleOnlineStatus}
              >
                <Text style={styles.statusText}>
                  {stats.isOnline ? 'ONLINE' : 'OFFLINE'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>R{stats.todayEarnings.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.completedOrders}</Text>
            <Text style={styles.statLabel}>Orders Today</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>R{stats.weeklyEarnings.toFixed(2)}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.rating}⭐</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Active Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Orders</Text>
          {activeOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.status) }
                ]}>
                  <Text style={styles.statusBadgeText}>
                    {getStatusText(order.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.addressContainer}>
                <View style={styles.addressRow}>
                  <Ionicons name="location" size={16} color="#0057FF" />
                  <Text style={styles.addressText}>{order.pickupAddress}</Text>
                </View>
                <View style={styles.addressRow}>
                  <Ionicons name="flag" size={16} color="#34C759" />
                  <Text style={styles.addressText}>{order.deliveryAddress}</Text>
                </View>
              </View>

              <View style={styles.orderFooter}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderValue}>R{order.value.toFixed(2)}</Text>
                  <Text style={styles.estimatedTime}>⏱️ {order.estimatedTime}</Text>
                </View>
                
                {order.status === 'assigned' ? (
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptOrder(order.id)}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                ) : null}
                
                {order.status === 'picked_up' ? (
                  <TouchableOpacity style={styles.navigateButton}>
                    <Ionicons name="navigate" size={18} color="white" />
                    <Text style={styles.navigateButtonText}>Navigate</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Chat and Quick Actions for Active Orders */}
              {(order.status === 'accepted' || order.status === 'picked_up' || order.status === 'in_transit') && (
                <View style={styles.chatActionsContainer}>
                  <TouchableOpacity
                    style={styles.chatButton}
                    onPress={() => openChatWithCustomer(order.customerId, order.id)}
                  >
                    <Ionicons name="chatbubble" size={16} color="#0057FF" />
                    <Text style={styles.chatButtonText}>Chat</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.quickUpdateButtons}>
                    {order.status === 'accepted' && (
                      <TouchableOpacity
                        style={styles.quickUpdateButton}
                        onPress={() => sendQuickUpdate(order.customerId, order.id, 'en_route')}
                      >
                        <Ionicons name="car" size={14} color="#34C759" />
                        <Text style={styles.quickUpdateText}>En Route</Text>
                      </TouchableOpacity>
                    )}
                    
                    {order.status === 'accepted' && (
                      <TouchableOpacity
                        style={styles.quickUpdateButton}
                        onPress={() => sendQuickUpdate(order.customerId, order.id, 'arrived')}
                      >
                        <Ionicons name="location" size={14} color="#FF9500" />
                        <Text style={styles.quickUpdateText}>Arrived</Text>
                      </TouchableOpacity>
                    )}
                    
                    {order.status === 'picked_up' && (
                      <TouchableOpacity
                        style={styles.quickUpdateButton}
                        onPress={() => sendQuickUpdate(order.customerId, order.id, 'loading')}
                      >
                        <Ionicons name="cube" size={14} color="#007AFF" />
                        <Text style={styles.quickUpdateText}>Loading</Text>
                      </TouchableOpacity>
                    )}
                    
                    {order.status === 'in_transit' && (
                      <TouchableOpacity
                        style={styles.quickUpdateButton}
                        onPress={() => sendQuickUpdate(order.customerId, order.id, 'completed')}
                      >
                        <Ionicons name="checkmark-circle" size={14} color="#34C759" />
                        <Text style={styles.quickUpdateText}>Delivered</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="document-text" size={24} color="#0057FF" />
              <Text style={styles.actionText}>View Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="wallet" size={24} color="#0057FF" />
              <Text style={styles.actionText}>Earnings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="settings" size={24} color="#0057FF" />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="help-circle" size={24} color="#0057FF" />
              <Text style={styles.actionText}>Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0057FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#1D1D1F',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addressContainer: {
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {},
  orderValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
  },
  estimatedTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  acceptButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0057FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  navigateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: (width - 64) / 2,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    color: '#1D1D1F',
    marginTop: 8,
    textAlign: 'center',
  },
  // Chat Actions Styles
  chatActionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    marginTop: 12,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#0057FF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  chatButtonText: {
    color: '#0057FF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  quickUpdateButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickUpdateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  quickUpdateText: {
    fontSize: 12,
    color: '#6C757D',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default DriverDashboardScreen;
