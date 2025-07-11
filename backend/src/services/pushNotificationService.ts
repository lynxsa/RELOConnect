import { PrismaClient } from '@prisma/client';
import { Server as SocketServer } from 'socket.io';

const prisma = new PrismaClient();

export interface PushNotification {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  priority?: 'default' | 'high' | 'normal';
  badge?: number;
  channelId?: string;
}

export interface NotificationTemplate {
  type: 'booking_confirmed' | 'driver_assigned' | 'pickup_reminder' | 'delivery_complete' | 'payment_received' | 'payout_processed';
  title: string;
  body: string;
  data?: Record<string, any>;
}

class PushNotificationService {
  private io?: SocketServer;
  private expoAccessToken?: string;

  constructor() {
    this.expoAccessToken = process.env.EXPO_ACCESS_TOKEN;
  }

  setSocketServer(socketServer: SocketServer) {
    this.io = socketServer;
  }

  /**
   * Send push notification via Expo Push Notifications
   */
  async sendExpoPushNotification(notification: PushNotification): Promise<boolean> {
    try {
      if (!this.expoAccessToken) {
        console.warn('Expo access token not configured, skipping push notification');
        return false;
      }

      // Ensure 'to' is an array
      const tokens = Array.isArray(notification.to) ? notification.to : [notification.to];
      
      // Filter out invalid tokens
      const validTokens = tokens.filter(token => 
        token && token.startsWith('ExponentPushToken[')
      );

      if (validTokens.length === 0) {
        console.warn('No valid expo push tokens provided');
        return false;
      }

      const messages = validTokens.map(token => ({
        to: token,
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: notification.sound || 'default',
        priority: notification.priority || 'high',
        badge: notification.badge,
        channelId: notification.channelId || 'default',
      }));

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.expoAccessToken}`,
        },
        body: JSON.stringify(messages),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('Failed to send expo push notification:', result);
        return false;
      }

      console.log('Push notification sent successfully:', result);
      return true;

    } catch (error) {
      console.error('Error sending expo push notification:', error);
      return false;
    }
  }

  /**
   * Send real-time notification via Socket.IO
   */
  async sendSocketNotification(userId: string, notification: Omit<PushNotification, 'to'>) {
    try {
      if (!this.io) {
        console.warn('Socket.IO server not configured');
        return false;
      }

      // Send to specific user room
      this.io.to(`user:${userId}`).emit('notification', {
        id: Date.now().toString(),
        title: notification.title,
        body: notification.body,
        data: notification.data,
        timestamp: new Date().toISOString(),
        read: false,
      });

      return true;

    } catch (error) {
      console.error('Error sending socket notification:', error);
      return false;
    }
  }

  /**
   * Send notification using predefined templates
   */
  async sendTemplatedNotification(
    userId: string,
    template: NotificationTemplate,
    variables: Record<string, string> = {}
  ) {
    try {
      // Get user's push token
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          expoPushToken: true,
          notificationPreferences: true,
        },
      });

      if (!user) {
        console.warn(`User ${userId} not found`);
        return false;
      }

      // Check if user has notifications enabled for this type
      const preferences = user.notificationPreferences as any;
      if (preferences && preferences[template.type] === false) {
        console.log(`User ${userId} has disabled ${template.type} notifications`);
        return false;
      }

      // Replace variables in template
      let title = template.title;
      let body = template.body;
      
      Object.entries(variables).forEach(([key, value]) => {
        title = title.replace(`{{${key}}}`, value);
        body = body.replace(`{{${key}}}`, value);
      });

      const notification: PushNotification = {
        to: user.expoPushToken || '',
        title,
        body,
        data: {
          type: template.type,
          userId,
          ...template.data,
          ...variables,
        },
      };

      // Send both push and socket notifications
      const results = await Promise.allSettled([
        this.sendExpoPushNotification(notification),
        this.sendSocketNotification(userId, notification),
        this.saveNotificationToDatabase(userId, notification),
      ]);

      const success = results.some(result => 
        result.status === 'fulfilled' && result.value === true
      );

      return success;

    } catch (error) {
      console.error('Error sending templated notification:', error);
      return false;
    }
  }

  /**
   * Save notification to database for history
   */
  async saveNotificationToDatabase(userId: string, notification: PushNotification) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          title: notification.title,
          message: notification.body,
          type: (notification.data?.type as string) || 'general',
          data: notification.data ? JSON.stringify(notification.data) : null,
          read: false,
        },
      });

      return true;

    } catch (error) {
      console.error('Error saving notification to database:', error);
      return false;
    }
  }

  /**
   * Send booking status update notifications
   */
  async sendBookingNotification(bookingId: string, status: string) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          driver: true,
        },
      });

      if (!booking || !booking.user) {
        console.warn(`Booking ${bookingId} or user not found`);
        return false;
      }

      const templates: Record<string, NotificationTemplate> = {
        CONFIRMED: {
          type: 'booking_confirmed',
          title: 'Booking Confirmed! 🎉',
          body: 'Your relocation booking #{{bookingId}} has been confirmed.',
          data: { bookingId, status },
        },
        DRIVER_ASSIGNED: {
          type: 'driver_assigned',
          title: 'Driver Assigned 🚛',
          body: '{{driverName}} has been assigned to your booking #{{bookingId}}.',
          data: { bookingId, status, driverId: booking.driverId },
        },
        IN_PROGRESS: {
          type: 'pickup_reminder',
          title: 'Pickup in Progress 📦',
          body: 'Your driver is on the way for pickup. Booking #{{bookingId}}.',
          data: { bookingId, status },
        },
        COMPLETED: {
          type: 'delivery_complete',
          title: 'Delivery Complete! ✅',
          body: 'Your relocation booking #{{bookingId}} has been completed successfully.',
          data: { bookingId, status },
        },
      };

      const template = templates[status];
      if (!template) {
        console.warn(`No template found for booking status: ${status}`);
        return false;
      }

      const variables = {
        bookingId: booking.id,
        driverName: booking.driver ? `${booking.driver.firstName} ${booking.driver.lastName}` : 'Your driver',
      };

      return await this.sendTemplatedNotification(booking.user.id, template, variables);

    } catch (error) {
      console.error('Error sending booking notification:', error);
      return false;
    }
  }

  /**
   * Send payment notifications
   */
  async sendPaymentNotification(userId: string, type: 'received' | 'failed', amount: number, currency: string) {
    try {
      const templates: Record<string, NotificationTemplate> = {
        received: {
          type: 'payment_received',
          title: 'Payment Received 💳',
          body: 'Payment of {{amount}} {{currency}} has been processed successfully.',
          data: { amount, currency, type },
        },
        failed: {
          type: 'payment_received',
          title: 'Payment Failed ❌',
          body: 'Payment of {{amount}} {{currency}} could not be processed. Please check your payment method.',
          data: { amount, currency, type },
        },
      };

      const template = templates[type];
      const variables = {
        amount: amount.toString(),
        currency: currency.toUpperCase(),
      };

      return await this.sendTemplatedNotification(userId, template, variables);

    } catch (error) {
      console.error('Error sending payment notification:', error);
      return false;
    }
  }

  /**
   * Send driver payout notifications
   */
  async sendPayoutNotification(driverId: string, amount: number, currency: string, status: string) {
    try {
      const templates: Record<string, NotificationTemplate> = {
        processed: {
          type: 'payout_processed',
          title: 'Payout Processed 💰',
          body: 'Your payout of {{amount}} {{currency}} has been processed and is on its way to your account.',
          data: { amount, currency, status },
        },
        failed: {
          type: 'payout_processed',
          title: 'Payout Failed ❌',
          body: 'Your payout of {{amount}} {{currency}} could not be processed. Please check your account details.',
          data: { amount, currency, status },
        },
      };

      const template = templates[status === 'paid' ? 'processed' : 'failed'];
      const variables = {
        amount: amount.toString(),
        currency: currency.toUpperCase(),
      };

      return await this.sendTemplatedNotification(driverId, template, variables);

    } catch (error) {
      console.error('Error sending payout notification:', error);
      return false;
    }
  }

  /**
   * Send bulk notifications to multiple users
   */
  async sendBulkNotifications(userIds: string[], notification: Omit<PushNotification, 'to'>) {
    try {
      const users = await prisma.user.findMany({
        where: { 
          id: { in: userIds },
          expoPushToken: { not: null },
        },
        select: { 
          id: true,
          expoPushToken: true,
        },
      });

      const tokens = users
        .map((user: any) => user.expoPushToken)
        .filter((token: any) => token && token.startsWith('ExponentPushToken[')) as string[];

      if (tokens.length === 0) {
        console.warn('No valid push tokens found for bulk notification');
        return false;
      }

      const bulkNotification: PushNotification = {
        to: tokens,
        ...notification,
      };

      return await this.sendExpoPushNotification(bulkNotification);

    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      return false;
    }
  }

  /**
   * Update user's push token
   */
  async updateUserPushToken(userId: string, expoPushToken: string) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { expoPushToken },
      });

      return true;

    } catch (error) {
      console.error('Error updating user push token:', error);
      return false;
    }
  }

  /**
   * Update user's notification preferences
   */
  async updateNotificationPreferences(userId: string, preferences: Record<string, boolean>) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          notificationPreferences: preferences,
        },
      });

      return true;

    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }
}

export default new PushNotificationService();
