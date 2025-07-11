import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NotificationData {
  type: 'message' | 'booking' | 'payment' | 'system';
  bookingId?: string;
  senderId?: string;
  amount?: number;
  title: string;
  body: string;
  data?: any;
}

export interface PushNotificationPreferences {
  messages: boolean;
  bookingUpdates: boolean;
  paymentNotifications: boolean;
  promotions: boolean;
  systemAlerts: boolean;
}

class MobilePushNotificationService {
  private expoPushToken: string | null = null;
  private preferences: PushNotificationPreferences = {
    messages: true,
    bookingUpdates: true,
    paymentNotifications: true,
    promotions: false,
    systemAlerts: true,
  };

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Load saved preferences
    await this.loadPreferences();
  }

  // Register for push notifications
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permission not granted');
      return null;
    }

    try {
      // Get the push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      
      if (!projectId) {
        throw new Error('Project ID not found');
      }

      const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.expoPushToken = pushToken.data;
      
      // Store token locally
      await AsyncStorage.setItem('expoPushToken', this.expoPushToken);
      
      console.log('Push token registered:', this.expoPushToken);
      return this.expoPushToken;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  // Send token to backend
  async registerTokenWithBackend(authToken: string, userId: string): Promise<boolean> {
    if (!this.expoPushToken) {
      await this.registerForPushNotifications();
    }

    if (!this.expoPushToken) {
      return false;
    }

    try {
      const serverUrl = Platform.OS === 'ios' 
        ? 'http://localhost:3001' 
        : 'http://10.0.2.2:3001';

      const response = await fetch(`${serverUrl}/api/notifications/register-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          userId,
          pushToken: this.expoPushToken,
          platform: Platform.OS,
          deviceId: Device.osInternalBuildId || 'unknown',
        }),
      });

      if (response.ok) {
        console.log('Push token registered with backend');
        return true;
      } else {
        console.error('Failed to register push token with backend');
        return false;
      }
    } catch (error) {
      console.error('Error registering push token:', error);
      return false;
    }
  }

  // Update notification preferences
  async updatePreferences(
    newPreferences: Partial<PushNotificationPreferences>,
    authToken: string
  ): Promise<boolean> {
    this.preferences = { ...this.preferences, ...newPreferences };
    
    // Save locally
    await this.savePreferences();

    // Sync with backend
    try {
      const serverUrl = Platform.OS === 'ios' 
        ? 'http://localhost:3001' 
        : 'http://10.0.2.2:3001';

      const response = await fetch(`${serverUrl}/api/notifications/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(this.preferences),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to update preferences on backend:', error);
      return false;
    }
  }

  // Schedule local notification
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: trigger || null, // null means immediate
    });

    return notificationId;
  }

  // Handle received notifications
  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
  ) {
    // Notification received while app is running
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      
      // Check if this type of notification is enabled
      const notificationType = notification.request.content.data?.type;
      if (this.isNotificationTypeEnabled(notificationType)) {
        onNotificationReceived?.(notification);
      }
    });

    // Notification tapped
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      onNotificationTapped?.(response);
    });

    return {
      remove: () => {
        receivedSubscription.remove();
        responseSubscription.remove();
      }
    };
  }

  // Check if notification type is enabled
  private isNotificationTypeEnabled(type: string): boolean {
    switch (type) {
      case 'message':
        return this.preferences.messages;
      case 'booking':
        return this.preferences.bookingUpdates;
      case 'payment':
        return this.preferences.paymentNotifications;
      case 'promotion':
        return this.preferences.promotions;
      case 'system':
        return this.preferences.systemAlerts;
      default:
        return true;
    }
  }

  // Notification templates for different types
  async showChatNotification(senderName: string, message: string, bookingId?: string): Promise<void> {
    if (!this.preferences.messages) return;

    await this.scheduleLocalNotification(
      `Message from ${senderName}`,
      message,
      {
        type: 'message',
        bookingId,
        action: 'open_chat',
      }
    );
  }

  async showBookingNotification(title: string, body: string, bookingId: string): Promise<void> {
    if (!this.preferences.bookingUpdates) return;

    await this.scheduleLocalNotification(
      title,
      body,
      {
        type: 'booking',
        bookingId,
        action: 'open_booking',
      }
    );
  }

  async showPaymentNotification(amount: number, type: 'received' | 'sent' | 'failed'): Promise<void> {
    if (!this.preferences.paymentNotifications) return;

    const titles = {
      received: 'Payment Received',
      sent: 'Payment Sent',
      failed: 'Payment Failed'
    };

    const bodies = {
      received: `You received $${amount.toFixed(2)}`,
      sent: `Payment of $${amount.toFixed(2)} sent successfully`,
      failed: `Payment of $${amount.toFixed(2)} failed`
    };

    await this.scheduleLocalNotification(
      titles[type],
      bodies[type],
      {
        type: 'payment',
        amount,
        status: type,
        action: 'open_payments',
      }
    );
  }

  async showDriverAssignedNotification(driverName: string, bookingId: string): Promise<void> {
    if (!this.preferences.bookingUpdates) return;

    await this.scheduleLocalNotification(
      'Driver Assigned',
      `${driverName} has been assigned to your booking`,
      {
        type: 'booking',
        bookingId,
        action: 'open_tracking',
      }
    );
  }

  async showDriverArrivedNotification(bookingId: string): Promise<void> {
    if (!this.preferences.bookingUpdates) return;

    await this.scheduleLocalNotification(
      'Driver Arrived',
      'Your driver has arrived at the pickup location',
      {
        type: 'booking',
        bookingId,
        action: 'open_tracking',
      }
    );
  }

  // Badge management
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  // Clear all notifications
  async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  // Cancel specific notification
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Get all scheduled notifications
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Preferences management
  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Failed to save notification preferences:', error);
    }
  }

  private async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('notificationPreferences');
      if (stored) {
        this.preferences = { ...this.preferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  // Getters
  get pushToken(): string | null {
    return this.expoPushToken;
  }

  get notificationPreferences(): PushNotificationPreferences {
    return { ...this.preferences };
  }

  // Test notification
  async sendTestNotification(): Promise<void> {
    await this.scheduleLocalNotification(
      'Test Notification',
      'This is a test notification from RELOConnect',
      { type: 'test' }
    );
  }
}

// Create singleton instance
const mobilePushNotificationService = new MobilePushNotificationService();

export default mobilePushNotificationService;
