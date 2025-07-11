import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// Notification types
export interface Notification {
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

export interface NotificationBadgeUpdate {
  count: number;
}

// Event types
export type NotificationEventListener = (notification: Notification) => void;
export type BadgeUpdateListener = (update: NotificationBadgeUpdate) => void;

class NotificationService {
  private socket: Socket | null = null;
  private listeners: Map<string, NotificationEventListener[]> = new Map();
  private badgeListeners: BadgeUpdateListener[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Initialize the notification service
   */
  async init(userId: string, token: string) {
    try {
      await this.connect(userId, token);
      await this.registerForPushNotifications();
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  /**
   * Connect to Socket.IO server
   */
  private async connect(userId: string, token: string) {
    if (this.socket) {
      this.socket.disconnect();
    }

    const serverUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      auth: {
        token: `Bearer ${token}`,
        userId
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    this.setupSocketHandlers(userId);
  }

  /**
   * Set up socket event handlers
   */
  private setupSocketHandlers(userId: string) {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Notification service connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join user-specific room
      this.socket?.emit('join', { userId });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Notification service disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Notification service connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    // Notification events
    this.socket.on('notification', (notification: Notification) => {
      this.handleNotification(notification);
    });

    this.socket.on('notificationBadgeUpdate', (update: NotificationBadgeUpdate) => {
      this.handleBadgeUpdate(update);
    });

    // Booking-specific notifications
    this.socket.on('booking:status_changed', (data) => {
      this.handleNotification({
        id: `booking_${data.bookingId}_${Date.now()}`,
        type: 'BOOKING_UPDATE',
        title: 'Booking Update',
        message: `Your booking status has changed to ${data.status.toLowerCase()}`,
        priority: 'MEDIUM',
        metadata: data,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    this.socket.on('booking:driver_assigned', (data) => {
      this.handleNotification({
        id: `driver_assigned_${data.bookingId}_${Date.now()}`,
        type: 'DRIVER_ASSIGNED',
        title: 'Driver Assigned',
        message: 'A driver has been assigned to your booking',
        priority: 'HIGH',
        metadata: data,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });
  }

  /**
   * Handle incoming notifications
   */
  private handleNotification(notification: Notification) {
    console.log('Received notification:', notification);
    
    // Store notification locally
    this.storeNotification(notification);
    
    // Trigger listeners
    const typeListeners = this.listeners.get(notification.type) || [];
    const allListeners = this.listeners.get('*') || [];
    
    [...typeListeners, ...allListeners].forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });

    // Show system notification if app is in background
    this.showSystemNotification(notification);
  }

  /**
   * Handle badge count updates
   */
  private handleBadgeUpdate(update: NotificationBadgeUpdate) {
    this.badgeListeners.forEach(listener => {
      try {
        listener(update);
      } catch (error) {
        console.error('Error in badge update listener:', error);
      }
    });
  }

  /**
   * Store notification locally
   */
  private async storeNotification(notification: Notification) {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      const notifications: Notification[] = stored ? JSON.parse(stored) : [];
      
      // Add new notification to the beginning
      notifications.unshift(notification);
      
      // Keep only last 100 notifications
      if (notifications.length > 100) {
        notifications.splice(100);
      }
      
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Failed to store notification:', error);
    }
  }

  /**
   * Show system notification
   */
  private async showSystemNotification(notification: Notification) {
    try {
      // Check if we have permission for notifications
      // This would typically use expo-notifications
      console.log('Would show system notification:', notification.title);
    } catch (error) {
      console.error('Failed to show system notification:', error);
    }
  }

  /**
   * Register for push notifications
   */
  private async registerForPushNotifications() {
    try {
      // This would typically use expo-notifications to get push token
      // and register with the backend
      console.log('Registering for push notifications...');
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
    }
  }

  /**
   * Add notification listener
   */
  addListener(type: string, listener: NotificationEventListener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  /**
   * Remove notification listener
   */
  removeListener(type: string, listener: NotificationEventListener) {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      const index = typeListeners.indexOf(listener);
      if (index > -1) {
        typeListeners.splice(index, 1);
      }
    }
  }

  /**
   * Add badge update listener
   */
  addBadgeListener(listener: BadgeUpdateListener) {
    this.badgeListeners.push(listener);
  }

  /**
   * Remove badge update listener
   */
  removeBadgeListener(listener: BadgeUpdateListener) {
    const index = this.badgeListeners.indexOf(listener);
    if (index > -1) {
      this.badgeListeners.splice(index, 1);
    }
  }

  /**
   * Get stored notifications
   */
  async getNotifications(): Promise<Notification[]> {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      // Update local storage
      const stored = await AsyncStorage.getItem('notifications');
      const notifications: Notification[] = stored ? JSON.parse(stored) : [];
      
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
        await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
      }

      // Update backend
      await api.put(`/api/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      // Update local storage
      const stored = await AsyncStorage.getItem('notifications');
      const notifications: Notification[] = stored ? JSON.parse(stored) : [];
      
      notifications.forEach(n => n.isRead = true);
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));

      // Update backend
      await api.put('/api/notifications/mark-all-read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter(n => !n.isRead).length;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Send notification (for testing/admin purposes)
   */
  async sendNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) {
    if (this.socket && this.isConnected) {
      this.socket.emit('sendNotification', notification);
    }
  }

  /**
   * Get connection status
   */
  isSocketConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Disconnect from service
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
    this.badgeListeners = [];
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
