import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { liveDataService } from '../services/liveDataService';
import { realTimeService } from '../services/realTimeService';

interface BookingTracking {
  id: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate: string;
  deliveryDate: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  serviceType: string;
  packageDetails: string;
  specialInstructions?: string;
  driver?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      phone: string;
    };
    rating: number;
    currentLatitude?: number;
    currentLongitude?: number;
  };
  truck?: {
    id: string;
    make: string;
    model: string;
    registrationNumber: string;
    truckType: string;
    fleetOwner: {
      companyName: string;
      user: {
        firstName: string;
        lastName: string;
        phone: string;
      };
    };
  };
  trackingUpdates: Array<{
    id: string;
    status: string;
    message: string;
    timestamp: string;
    location?: string;
  }>;
}

const ModernTrackingScreen: React.FC = () => {
  const [activeBookings, setActiveBookings] = useState<BookingTracking[]>([]);
  const [completedBookings, setCompletedBookings] = useState<BookingTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    fetchBookings();
    setupRealTimeTracking();
    
    return () => {
      realTimeService.disconnect();
    };
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await liveDataService.get('/bookings/my-bookings');
      
      if (response.success) {
        const bookings = response.data;
        setActiveBookings(
          bookings.filter((b: BookingTracking) => 
            ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'PICKUP_COMPLETED'].includes(b.status)
          )
        );
        setCompletedBookings(
          bookings.filter((b: BookingTracking) => 
            ['DELIVERED', 'CANCELLED'].includes(b.status)
          )
        );
      } else {
        Alert.alert('Error', 'Failed to load bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Network error while loading bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const setupRealTimeTracking = () => {
    realTimeService.connect();
    
    // Listen for tracking updates
    realTimeService.onTrackingUpdate((update) => {
      setActiveBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === update.bookingId 
            ? { 
                ...booking, 
                trackingUpdates: [...booking.trackingUpdates, update],
                driver: update.driverLocation ? {
                  ...booking.driver!,
                  currentLatitude: update.driverLocation.latitude,
                  currentLongitude: update.driverLocation.longitude,
                } : booking.driver
              }
            : booking
        )
      );
    });

    // Listen for status changes
    realTimeService.onBookingStatusUpdate((statusUpdate) => {
      setActiveBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === statusUpdate.bookingId 
            ? { ...booking, status: statusUpdate.status }
            : booking
        )
      );
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#F59E0B';
      case 'CONFIRMED':
        return '#3B82F6';
      case 'IN_PROGRESS':
        return '#8B5CF6';
      case 'PICKUP_COMPLETED':
        return '#06B6D4';
      case 'DELIVERED':
        return '#10B981';
      case 'CANCELLED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'clock';
      case 'CONFIRMED':
        return 'check-circle';
      case 'IN_PROGRESS':
        return 'truck';
      case 'PICKUP_COMPLETED':
        return 'package';
      case 'DELIVERED':
        return 'check-circle-2';
      case 'CANCELLED':
        return 'x-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending Confirmation';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'PICKUP_COMPLETED':
        return 'Picked Up';
      case 'DELIVERED':
        return 'Delivered';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const callDriver = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const callFleetOwner = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderBookingCard = (booking: BookingTracking) => (
    <View key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingId}>#{booking.id.slice(-8)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
            <Feather name={getStatusIcon(booking.status) as any} size={12} color="#FFFFFF" />
            <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
          </View>
        </View>
        <Text style={styles.bookingAmount}>R{booking.totalAmount.toFixed(2)}</Text>
      </View>

      <View style={styles.addressSection}>
        <View style={styles.addressItem}>
          <View style={styles.addressIconContainer}>
            <Feather name="map-pin" size={16} color="#10B981" />
          </View>
          <View style={styles.addressText}>
            <Text style={styles.addressLabel}>Pickup</Text>
            <Text style={styles.addressValue}>{booking.pickupAddress}</Text>
            <Text style={styles.addressTime}>{formatDate(booking.pickupDate)}</Text>
          </View>
        </View>

        <View style={styles.addressDivider}>
          <View style={styles.dividerLine} />
          <View style={styles.dividerDots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.addressItem}>
          <View style={styles.addressIconContainer}>
            <Feather name="navigation" size={16} color="#EF4444" />
          </View>
          <View style={styles.addressText}>
            <Text style={styles.addressLabel}>Delivery</Text>
            <Text style={styles.addressValue}>{booking.deliveryAddress}</Text>
            <Text style={styles.addressTime}>{formatDate(booking.deliveryDate)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.packageSection}>
        <Text style={styles.packageTitle}>Package Details</Text>
        <Text style={styles.packageDescription}>{booking.packageDetails}</Text>
        <Text style={styles.serviceType}>{booking.serviceType.replace('_', ' ')}</Text>
      </View>

      {booking.driver && (
        <View style={styles.driverSection}>
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Feather name="user" size={20} color="#0057FF" />
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>
                {booking.driver.user.firstName} {booking.driver.user.lastName}
              </Text>
              <View style={styles.driverRating}>
                <Feather name="star" size={12} color="#FFB800" />
                <Text style={styles.driverRatingText}>{booking.driver.rating.toFixed(1)}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => callDriver(booking.driver!.user.phone)}
            >
              <Feather name="phone" size={16} color="#10B981" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {booking.truck && (
        <View style={styles.truckSection}>
          <View style={styles.truckInfo}>
            <Feather name="truck" size={20} color="#0057FF" />
            <View style={styles.truckDetails}>
              <Text style={styles.truckName}>
                {booking.truck.make} {booking.truck.model}
              </Text>
              <Text style={styles.truckRegNumber}>{booking.truck.registrationNumber}</Text>
            </View>
          </View>
          <View style={styles.fleetOwnerInfo}>
            <Text style={styles.fleetOwnerName}>{booking.truck.fleetOwner.companyName}</Text>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => callFleetOwner(booking.truck!.fleetOwner.user.phone)}
            >
              <Feather name="phone" size={16} color="#0057FF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {booking.trackingUpdates.length > 0 && (
        <View style={styles.trackingSection}>
          <Text style={styles.trackingTitle}>Tracking Updates</Text>
          {booking.trackingUpdates.slice(0, 3).map((update, index) => (
            <View key={update.id} style={styles.trackingUpdate}>
              <View style={styles.trackingIcon}>
                <View style={styles.trackingDot} />
                {index < booking.trackingUpdates.length - 1 && <View style={styles.trackingLine} />}
              </View>
              <View style={styles.trackingContent}>
                <Text style={styles.trackingMessage}>{update.message}</Text>
                <Text style={styles.trackingTime}>
                  {new Date(update.timestamp).toLocaleString()}
                </Text>
                {update.location && (
                  <Text style={styles.trackingLocation}>{update.location}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.bookingActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="message-circle" size={16} color="#0057FF" />
          <Text style={styles.actionButtonText}>Chat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="map" size={16} color="#0057FF" />
          <Text style={styles.actionButtonText}>Track Live</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Feather name="file-text" size={16} color="#0057FF" />
          <Text style={styles.actionButtonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Track Your Moves</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Feather name="refresh-cw" size={20} color="#0057FF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'active' && styles.tabActive]}
          onPress={() => setSelectedTab('active')}
        >
          <Text style={[styles.tabText, selectedTab === 'active' && styles.tabTextActive]}>
            Active ({activeBookings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.tabActive]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.tabTextActive]}>
            Completed ({completedBookings.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading your bookings...</Text>
          </View>
        ) : (
          <>
            {selectedTab === 'active' && (
              <>
                {activeBookings.length > 0 ? (
                  activeBookings.map(renderBookingCard)
                ) : (
                  <View style={styles.emptyContainer}>
                    <Feather name="package" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>No active bookings</Text>
                    <Text style={styles.emptyText}>Your active moves will appear here</Text>
                  </View>
                )}
              </>
            )}

            {selectedTab === 'completed' && (
              <>
                {completedBookings.length > 0 ? (
                  completedBookings.map(renderBookingCard)
                ) : (
                  <View style={styles.emptyContainer}>
                    <Feather name="check-circle" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>No completed bookings</Text>
                    <Text style={styles.emptyText}>Your completed moves will appear here</Text>
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  refreshButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#0057FF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#0057FF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  bookingAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0057FF',
  },
  addressSection: {
    marginBottom: 16,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressText: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  addressValue: {
    fontSize: 14,
    color: '#111827',
    marginTop: 2,
  },
  addressTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  addressDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    marginLeft: 16,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
    flex: 1,
  },
  dividerDots: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D1D5DB',
    marginVertical: 1,
  },
  packageSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  packageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  serviceType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0057FF',
    textTransform: 'uppercase',
  },
  driverSection: {
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverDetails: {
    flex: 1,
    marginLeft: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  driverRatingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  truckSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  truckInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  truckDetails: {
    flex: 1,
    marginLeft: 12,
  },
  truckName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  truckRegNumber: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  fleetOwnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fleetOwnerName: {
    fontSize: 12,
    color: '#6B7280',
  },
  trackingSection: {
    marginBottom: 16,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  trackingUpdate: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  trackingIcon: {
    alignItems: 'center',
    marginRight: 12,
  },
  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0057FF',
  },
  trackingLine: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  trackingContent: {
    flex: 1,
  },
  trackingMessage: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 2,
  },
  trackingTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  trackingLocation: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#0057FF',
    marginLeft: 6,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ModernTrackingScreen;
