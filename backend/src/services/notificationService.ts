import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';

const prisma = new PrismaClient();

export enum NotificationType {
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  DRIVER_ASSIGNED = 'DRIVER_ASSIGNED',
  DELIVERY_STARTED = 'DELIVERY_STARTED',
  DELIVERY_COMPLETED = 'DELIVERY_COMPLETED',
  PAYMENT_SUCCESSFUL = 'PAYMENT_SUCCESSFUL',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_VERIFIED = 'DOCUMENT_VERIFIED',
  DOCUMENT_REJECTED = 'DOCUMENT_REJECTED',
  SAFETY_ALERT = 'SAFETY_ALERT',
  EMERGENCY_ALERT = 'EMERGENCY_ALERT',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  DONATION_RECEIVED = 'DONATION_RECEIVED',
  DONATION_MATCHED = 'DONATION_MATCHED',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  DRIVER_STATUS_CHANGE = 'DRIVER_STATUS_CHANGE',
  VEHICLE_MAINTENANCE_DUE = 'VEHICLE_MAINTENANCE_DUE',
  WEATHER_ALERT = 'WEATHER_ALERT'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  actionUrl?: string;
  expiresAt?: Date;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  icon?: string;
  image?: string;
}

class NotificationService {
  private io: Server | null = null;

  setSocketServer(io: Server) {
    this.io = io;
  }

  /**
   * Create and send a notification
   */
  async createNotification(data: NotificationData): Promise<void> {
    try {
      // Save to database
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          priority: data.priority,
          metadata: data.metadata || {},
          actionUrl: data.actionUrl,
          expiresAt: data.expiresAt,
          isRead: false,
          createdAt: new Date()
        }
      });

      // Send real-time notification via Socket.IO
      if (this.io) {
        this.io.to(`user_${data.userId}`).emit('notification', {
          id: notification.id,
          type: data.type,
          title: data.title,
          message: data.message,
          priority: data.priority,
          metadata: data.metadata,
          actionUrl: data.actionUrl,
          createdAt: notification.createdAt,
          isRead: false
        });
      }

      // Send push notification (if enabled for user)
      await this.sendPushNotification(data.userId, {
        title: data.title,
        body: data.message,
        data: {
          type: data.type,
          priority: data.priority,
          notificationId: notification.id,
          ...data.metadata
        },
        badge: await this.getUnreadNotificationCount(data.userId)
      });

      console.log(`Notification sent to user ${data.userId}: ${data.title}`);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send push notification (placeholder for FCM/APNS integration)
   */
  private async sendPushNotification(userId: string, payload: PushNotificationPayload): Promise<void> {
    try {
      // Get user's push notification settings and tokens
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true,
          pushNotificationEnabled: true,
          fcmToken: true,
          apnsToken: true,
          notificationSettings: true
        }
      });

      if (!user?.pushNotificationEnabled) {
        return;
      }

      // TODO: Implement FCM for Android and APNS for iOS
      // For now, just log the push notification
      console.log(`Push notification for user ${userId}:`, payload);
      
      // Here you would integrate with:
      // - Firebase Cloud Messaging (FCM) for Android
      // - Apple Push Notification Service (APNS) for iOS
      // - Expo Push Notifications for Expo apps
      
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Get unread notification count for badge
   */
  private async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      return await prisma.notification.count({
        where: {
          userId,
          isRead: false,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      });
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });

      // Emit updated badge count
      if (this.io) {
        const unreadCount = await this.getUnreadNotificationCount(userId);
        this.io.to(`user_${userId}`).emit('notificationBadgeUpdate', { count: unreadCount });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      });

      // Emit updated badge count
      if (this.io) {
        this.io.to(`user_${userId}`).emit('notificationBadgeUpdate', { count: 0 });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string, limit: number = 50, offset: number = 0) {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      });

      const totalCount = await prisma.notification.count({
        where: {
          userId,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      });

      const unreadCount = await this.getUnreadNotificationCount(userId);

      return {
        notifications,
        totalCount,
        unreadCount,
        hasMore: totalCount > offset + limit
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Delete old and expired notifications
   */
  async cleanupNotifications(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await prisma.notification.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { 
              createdAt: { lt: thirtyDaysAgo },
              isRead: true
            }
          ]
        }
      });

      console.log('Notification cleanup completed');
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  }

  /**
   * Send booking notifications
   */
  async sendBookingNotification(bookingId: string, type: NotificationType): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          newDriver: {
            include: { user: true }
          }
        }
      });

      if (!booking) return;

      let title: string;
      let message: string;
      let priority: NotificationPriority = NotificationPriority.MEDIUM;

      switch (type) {
        case NotificationType.BOOKING_CREATED:
          title = 'Booking Created';
          message = `Your booking #${booking.bookingNumber} has been created successfully.`;
          break;
        case NotificationType.BOOKING_CONFIRMED:
          title = 'Booking Confirmed';
          message = `Your booking #${booking.bookingNumber} has been confirmed.`;
          break;
        case NotificationType.DRIVER_ASSIGNED:
          title = 'Driver Assigned';
          message = `Driver ${booking.newDriver?.user.firstName} has been assigned to your booking.`;
          priority = NotificationPriority.HIGH;
          break;
        case NotificationType.DELIVERY_STARTED:
          title = 'Delivery Started';
          message = `Your delivery has started. Track your items in real-time.`;
          priority = NotificationPriority.HIGH;
          break;
        case NotificationType.DELIVERY_COMPLETED:
          title = 'Delivery Completed';
          message = `Your delivery has been completed successfully.`;
          priority = NotificationPriority.HIGH;
          break;
        default:
          return;
      }

      // Send to customer
      await this.createNotification({
        userId: booking.userId,
        type,
        title,
        message,
        priority,
        metadata: {
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber
        },
        actionUrl: `/bookings/${booking.id}`
      });

      // Send to driver if applicable
      if (booking.newDriver && [
        NotificationType.DRIVER_ASSIGNED,
        NotificationType.DELIVERY_STARTED,
        NotificationType.DELIVERY_COMPLETED
      ].includes(type)) {
        await this.createNotification({
          userId: booking.newDriver.userId,
          type,
          title: `Booking Update`,
          message: `Booking #${booking.bookingNumber} status updated.`,
          priority,
          metadata: {
            bookingId: booking.id,
            bookingNumber: booking.bookingNumber
          },
          actionUrl: `/driver/bookings/${booking.id}`
        });
      }
    } catch (error) {
      console.error('Error sending booking notification:', error);
    }
  }

  /**
   * Send safety alert
   */
  async sendSafetyAlert(type: 'emergency' | 'warning' | 'info', title: string, message: string, userIds?: string[]): Promise<void> {
    try {
      const priority = type === 'emergency' ? NotificationPriority.URGENT : 
                     type === 'warning' ? NotificationPriority.HIGH : 
                     NotificationPriority.MEDIUM;

      const notificationType = type === 'emergency' ? NotificationType.EMERGENCY_ALERT : NotificationType.SAFETY_ALERT;

      // If no specific users, send to all active users
      if (!userIds) {
        const activeUsers = await prisma.user.findMany({
          where: { isActive: true },
          select: { id: true }
        });
        userIds = activeUsers.map(user => user.id);
      }

      // Send notifications to all specified users
      const notifications = userIds.map(userId => ({
        userId,
        type: notificationType,
        title,
        message,
        priority,
        metadata: { alertType: type },
        expiresAt: type === 'emergency' ? undefined : new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours for non-emergency
      }));

      await Promise.all(notifications.map(notification => this.createNotification(notification)));
    } catch (error) {
      console.error('Error sending safety alert:', error);
    }
  }
}

export const notificationService = new NotificationService();
