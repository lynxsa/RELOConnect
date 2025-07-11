import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModernHeader } from '../components/ui/ModernHeader';
import { ModernCard } from '../components/ui/ModernCard';
import { ModernButton } from '../components/ui/ModernButton';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  metadata: Record<string, any>;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationScreenProps {
  navigation: any;
}

export default function NotificationScreen({ navigation }: NotificationScreenProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  const loadNotifications = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      // Simulate API call - replace with actual notification service
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'BOOKING_CONFIRMED',
          title: 'Booking Confirmed',
          message: 'Your booking #REL001 has been confirmed and assigned to a driver.',
          priority: 'HIGH',
          metadata: { bookingId: 'REL001' },
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        },
        {
          id: '2',
          type: 'DRIVER_ASSIGNED',
          title: 'Driver Assigned',
          message: 'Thabo M. has been assigned to your booking. Contact: 082 123 4567',
          priority: 'HIGH',
          metadata: { bookingId: 'REL001', driverName: 'Thabo M.' },
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        },
        {
          id: '3',
          type: 'DELIVERY_STARTED',
          title: 'Delivery Started',
          message: 'Your driver is on the way to pick up your items. ETA: 15 minutes.',
          priority: 'MEDIUM',
          metadata: { bookingId: 'REL001', eta: 15 },
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
          id: '4',
          type: 'SYSTEM_MAINTENANCE',
          title: 'Maintenance Notice',
          message: 'RELOConnect will be undergoing maintenance tonight from 2-4 AM.',
          priority: 'LOW',
          metadata: {},
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      // Simulate API call
      const count = notifications.filter(n => !n.isRead).length;
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Simulate API call
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      Alert.alert(
        'Mark All as Read',
        'Are you sure you want to mark all notifications as read?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Mark All',
            onPress: async () => {
              // Simulate API call
              setNotifications(prev => 
                prev.map(notification => ({ ...notification, isRead: true }))
              );
              setUnreadCount(0);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'BOOKING_CONFIRMED':
      case 'DRIVER_ASSIGNED':
      case 'DELIVERY_STARTED':
        if (notification.metadata.bookingId) {
          navigation.navigate('OrderTracking', { 
            bookingId: notification.metadata.bookingId 
          });
        }
        break;
      default:
        // Handle other notification types or show details
        break;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '#DC2626';
      case 'HIGH': return '#EA580C';
      case 'MEDIUM': return '#0057FF';
      case 'LOW': return '#64748B';
      default: return '#64748B';
    }
  };

  const getPriorityIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_CONFIRMED': return 'check-circle';
      case 'DRIVER_ASSIGNED': return 'user';
      case 'DELIVERY_STARTED': return 'truck';
      case 'DELIVERY_COMPLETED': return 'check-circle';
      case 'PAYMENT_SUCCESSFUL': return 'credit-card';
      case 'SAFETY_ALERT': return 'alert-triangle';
      case 'EMERGENCY_ALERT': return 'alert-circle';
      case 'SYSTEM_MAINTENANCE': return 'settings';
      default: return 'bell';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => handleNotificationPress(item)}
      style={styles.notificationItem}
    >
      <ModernCard style={[
        styles.notificationCard,
        !item.isRead && styles.unreadCard
      ]}>
        <View style={styles.notificationHeader}>
          <View style={styles.iconContainer}>
            <Feather
              name={getPriorityIcon(item.type)}
              size={20}
              color={getPriorityColor(item.priority)}
            />
          </View>
          <View style={styles.notificationContent}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>
                {item.title}
              </Text>
              {!item.isRead && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.message} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.timestamp}>
              {formatTimeAgo(item.createdAt)}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color="#9CA3AF" />
        </View>
      </ModernCard>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="bell" size={64} color="#E5E7EB" />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyText}>
        You're all caught up! We'll notify you when there's something new.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ModernHeader
        title="Notifications"
        onBack={() => navigation.goBack()}
        rightComponent={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markAllText}>Mark All Read</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      {unreadCount > 0 && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadNotifications(false);
            }}
            tintColor="#0057FF"
          />
        }
        ListEmptyComponent={!loading ? renderEmpty : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContainer: {
    flexGrow: 1,
    padding: 16,
  },
  badgeContainer: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  badgeText: {
    fontSize: 14,
    color: '#0057FF',
    fontWeight: '500',
  },
  markAllText: {
    fontSize: 14,
    color: '#0057FF',
    fontWeight: '500',
  },
  notificationItem: {
    marginBottom: 12,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#0057FF',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  unreadTitle: {
    color: '#0057FF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0057FF',
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
});
