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
import { notificationService, Notification } from '../services/notificationService';
import { ModernCard } from '../components/ui/ModernCard';
import { ModernButton } from '../components/ui/ModernButton';

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
    
    // Listen for new notifications
    const handleNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    notificationService.addListener('*', handleNotification);

    return () => {
      notificationService.removeListener('*', handleNotification);
    };
  }, []);

  const loadNotifications = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      
      const notifications = await notificationService.getNotifications();
      setNotifications(notifications);
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
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications(false);
    loadUnreadCount();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case 'BOOKING_UPDATE':
      case 'DRIVER_ASSIGNED':
      case 'DELIVERY_STARTED':
        if (notification.metadata?.bookingId) {
          navigation.navigate('BookingDetails', {
            bookingId: notification.metadata.bookingId,
          });
        }
        break;
      case 'PRICE_UPDATE':
        navigation.navigate('Pricing');
        break;
      default:
        // Show notification details or do nothing
        break;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return '#EF4444';
      case 'HIGH':
        return '#F97316';
      case 'MEDIUM':
        return '#3B82F6';
      case 'LOW':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'alert-circle';
      case 'HIGH':
        return 'alert-triangle';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'message-circle';
      default:
        return 'bell';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BOOKING_UPDATE':
      case 'BOOKING_CONFIRMED':
        return 'package';
      case 'DRIVER_ASSIGNED':
        return 'user-check';
      case 'DELIVERY_STARTED':
        return 'truck';
      case 'DELIVERY_COMPLETED':
        return 'check-circle';
      case 'PRICE_UPDATE':
        return 'dollar-sign';
      case 'SYSTEM_MAINTENANCE':
        return 'settings';
      default:
        return 'bell';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationDate.toLocaleDateString();
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadNotification,
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <ModernCard variant="elevated" padding="medium">
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={styles.iconContainer}>
              <Feather
                name={getNotificationIcon(item.type)}
                size={20}
                color="#0057FF"
              />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationTime}>
                {formatTimeAgo(item.createdAt)}
              </Text>
            </View>
            <View style={styles.priorityBadge}>
              <Feather
                name={getPriorityIcon(item.priority)}
                size={14}
                color={getPriorityColor(item.priority)}
              />
            </View>
          </View>
          
          <Text style={styles.notificationMessage}>{item.message}</Text>
          
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
      </ModernCard>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#0057FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={48} color="#6B7280" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyMessage}>
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 14,
    color: '#0057FF',
    fontWeight: '500',
  },
  unreadBanner: {
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  unreadText: {
    fontSize: 14,
    color: '#0057FF',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    marginBottom: 12,
  },
  unreadNotification: {
    transform: [{ scale: 1.02 }],
  },
  notificationContent: {
    position: 'relative',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#EBF4FF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#64748B',
  },
  priorityBadge: {
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginLeft: 52,
  },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: '#0057FF',
    borderRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
});
