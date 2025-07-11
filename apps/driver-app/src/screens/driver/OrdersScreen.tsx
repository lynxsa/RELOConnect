import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate: string;
  deliveryDate?: string;
  value: number;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  items: string[];
  distance: number;
  commission: number;
}

const OrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      customerName: 'John Smith',
      customerPhone: '+27 82 123 4567',
      pickupAddress: '123 Main St, Cape Town, Western Cape',
      deliveryAddress: '456 Oak Ave, Stellenbosch, Western Cape',
      pickupDate: '2024-01-15T09:00:00Z',
      deliveryDate: '2024-01-15T11:30:00Z',
      value: 850.00,
      status: 'delivered',
      items: ['Furniture', 'Boxes (5)', 'Appliances'],
      distance: 45.2,
      commission: 127.50,
    },
    {
      id: '2',
      customerName: 'Sarah Johnson',
      customerPhone: '+27 83 987 6543',
      pickupAddress: '789 Pine Rd, Durban, KwaZulu-Natal',
      deliveryAddress: '321 Beach Blvd, Umhlanga, KwaZulu-Natal',
      pickupDate: '2024-01-15T14:00:00Z',
      value: 650.00,
      status: 'in_transit',
      items: ['Electronics', 'Documents', 'Personal Items'],
      distance: 28.7,
      commission: 97.50,
    },
    {
      id: '3',
      customerName: 'Mike Wilson',
      customerPhone: '+27 84 555 7890',
      pickupAddress: '654 Forest Lane, Johannesburg, Gauteng',
      deliveryAddress: '987 Valley View, Pretoria, Gauteng',
      pickupDate: '2024-01-16T08:30:00Z',
      value: 1200.00,
      status: 'assigned',
      items: ['Office Equipment', 'Boxes (12)', 'Furniture'],
      distance: 65.4,
      commission: 180.00,
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') {
      return ['assigned', 'picked_up', 'in_transit'].includes(order.status);
    }
    if (filter === 'completed') {
      return ['delivered', 'cancelled'].includes(order.status);
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'assigned': return '#007AFF';
      case 'picked_up': return '#5AC8FA';
      case 'in_transit': return '#34C759';
      case 'delivered': return '#8E8E93';
      case 'cancelled': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'assigned': return 'Assigned';
      case 'picked_up': return 'Picked Up';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    setModalVisible(false);
    Alert.alert('Success', 'Order status updated successfully');
  };

  const callCustomer = (phone: string) => {
    Alert.alert(
      'Call Customer',
      `Call ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log('Calling...') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with filters */}
      <LinearGradient colors={['#0057FF', '#00B2FF']} style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'active' && styles.activeFilter]}
            onPress={() => setFilter('active')}
          >
            <Text style={[styles.filterText, filter === 'active' && styles.activeFilterText]}>
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredOrders.map((order) => (
          <TouchableOpacity
            key={order.id}
            style={styles.orderCard}
            onPress={() => handleOrderPress(order)}
          >
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

            <View style={styles.orderDetails}>
              <Text style={styles.orderDate}>
                📅 {formatDate(order.pickupDate)}
              </Text>
              <Text style={styles.orderDistance}>
                🚛 {order.distance} km
              </Text>
            </View>

            <View style={styles.orderFooter}>
              <View>
                <Text style={styles.orderValue}>R{order.value.toFixed(2)}</Text>
                <Text style={styles.commissionText}>
                  Commission: R{order.commission.toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => callCustomer(order.customerPhone)}
              >
                <Ionicons name="call" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {filteredOrders.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyStateText}>No orders found</Text>
            <Text style={styles.emptyStateSubtext}>
              {filter === 'active' ? 'No active orders at the moment' : 
               filter === 'completed' ? 'No completed orders yet' : 
               'No orders available'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Order Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Order Details</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color="#8E8E93" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Customer Information</Text>
                    <Text style={styles.modalText}>Name: {selectedOrder.customerName}</Text>
                    <Text style={styles.modalText}>Phone: {selectedOrder.customerPhone}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Addresses</Text>
                    <Text style={styles.modalLabel}>Pickup:</Text>
                    <Text style={styles.modalText}>{selectedOrder.pickupAddress}</Text>
                    <Text style={styles.modalLabel}>Delivery:</Text>
                    <Text style={styles.modalText}>{selectedOrder.deliveryAddress}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Items</Text>
                    {selectedOrder.items.map((item, index) => (
                      <Text key={index} style={styles.modalText}>• {item}</Text>
                    ))}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Order Summary</Text>
                    <Text style={styles.modalText}>Distance: {selectedOrder.distance} km</Text>
                    <Text style={styles.modalText}>Value: R{selectedOrder.value.toFixed(2)}</Text>
                    <Text style={styles.modalText}>Commission: R{selectedOrder.commission.toFixed(2)}</Text>
                    <Text style={styles.modalText}>Pickup: {formatDate(selectedOrder.pickupDate)}</Text>
                    {selectedOrder.deliveryDate && (
                      <Text style={styles.modalText}>
                        Delivered: {formatDate(selectedOrder.deliveryDate)}
                      </Text>
                    )}
                  </View>
                </ScrollView>

                {['assigned', 'picked_up', 'in_transit'].includes(selectedOrder.status) && (
                  <View style={styles.modalActions}>
                    {selectedOrder.status === 'assigned' && (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#34C759' }]}
                        onPress={() => handleUpdateStatus(selectedOrder.id, 'picked_up')}
                      >
                        <Text style={styles.actionButtonText}>Mark as Picked Up</Text>
                      </TouchableOpacity>
                    )}
                    {selectedOrder.status === 'picked_up' && (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
                        onPress={() => handleUpdateStatus(selectedOrder.id, 'in_transit')}
                      >
                        <Text style={styles.actionButtonText}>Start Transit</Text>
                      </TouchableOpacity>
                    )}
                    {selectedOrder.status === 'in_transit' && (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#8E8E93' }]}
                        onPress={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                      >
                        <Text style={styles.actionButtonText}>Mark as Delivered</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeFilter: {
    backgroundColor: 'white',
  },
  filterText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#0057FF',
  },
  scrollView: {
    flex: 1,
    padding: 20,
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
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  orderDistance: {
    fontSize: 12,
    color: '#8E8E93',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34C759',
  },
  commissionText: {
    fontSize: 12,
    color: '#0057FF',
    marginTop: 2,
  },
  callButton: {
    backgroundColor: '#34C759',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D1D1F',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 8,
    marginBottom: 4,
  },
  modalText: {
    fontSize: 14,
    color: '#1D1D1F',
    lineHeight: 20,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrdersScreen;
