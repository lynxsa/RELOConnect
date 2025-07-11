import express, { Request, Response } from 'express';
import { z } from 'zod';
import { body, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth';
import { notificationService, NotificationType, NotificationPriority } from '../services/notificationService';
import pushNotificationService from '../services/pushNotificationService';

const router = express.Router();

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Validation schemas
const markAsReadSchema = z.object({
  notificationId: z.string().optional(),
  markAll: z.boolean().optional()
});

const sendAlertSchema = z.object({
  type: z.enum(['emergency', 'warning', 'info']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  userIds: z.array(z.string()).optional()
});

// Get user notifications
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { limit = '50', offset = '0' } = req.query;

    const result = await notificationService.getUserNotifications(
      userId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to fetch notifications' 
    });
  }
});

// Mark notification(s) as read
router.patch('/read', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const validatedData = markAsReadSchema.parse(req.body);

    if (validatedData.markAll) {
      await notificationService.markAllAsRead(userId);
      return res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } else if (validatedData.notificationId) {
      await notificationService.markAsRead(validatedData.notificationId, userId);
      return res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either notificationId or markAll must be provided'
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    console.error('Mark as read error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to mark notification as read' 
    });
  }
});

// Get unread count
router.get('/unread/count', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await notificationService.getUserNotifications(userId, 1, 0);

    return res.json({
      success: true,
      data: {
        count: result.unreadCount
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to get unread count' 
    });
  }
});

// Send safety alert (admin only)
router.post('/alert', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user has admin role
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const validatedData = sendAlertSchema.parse(req.body);

    await notificationService.sendSafetyAlert(
      validatedData.type,
      validatedData.title,
      validatedData.message,
      validatedData.userIds
    );

    return res.json({
      success: true,
      message: `${validatedData.type} alert sent successfully`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      });
    }
    
    console.error('Send alert error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to send alert' 
    });
  }
});

// Test notification (development only)
router.post('/test', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Test notifications not available in production'
      });
    }

    const userId = req.user!.userId;

    await notificationService.createNotification({
      userId,
      type: NotificationType.SYSTEM_MAINTENANCE,
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working.',
      priority: NotificationPriority.MEDIUM,
      metadata: { test: true }
    });

    return res.json({
      success: true,
      message: 'Test notification sent'
    });
  } catch (error) {
    console.error('Test notification error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Failed to send test notification' 
    });
  }
});

// Update push token endpoint
router.put('/push-token', 
  authMiddleware,
  [
    body('expoPushToken').notEmpty().trim(),
  ],
  async (req: any, res: any) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array(),
        });
      }

      const userId = req.user!.userId;
      const { expoPushToken } = req.body;

      const success = await pushNotificationService.updateUserPushToken(userId, expoPushToken);

      if (!success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update push token',
        });
      }

      return res.json({
        success: true,
        message: 'Push token updated successfully',
      });

    } catch (error) {
      console.error('Update push token error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update push token',
      });
    }
  }
);

// Update notification preferences
router.put('/preferences',
  authMiddleware,
  [
    body('preferences').isObject(),
  ],
  async (req: any, res: any) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: errors.array(),
        });
      }

      const userId = req.user!.userId;
      const { preferences } = req.body;

      const success = await pushNotificationService.updateNotificationPreferences(userId, preferences);

      if (!success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update notification preferences',
        });
      }

      return res.json({
        success: true,
        message: 'Notification preferences updated successfully',
      });

    } catch (error) {
      console.error('Update preferences error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update notification preferences',
      });
    }
  }
);

// Send test push notification
router.post('/test-push',
  authMiddleware,
  async (req: any, res: any) => {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          message: 'Test push notifications not available in production',
        });
      }

      const userId = req.user!.userId;

      const success = await pushNotificationService.sendTemplatedNotification(userId, {
        type: 'booking_confirmed',
        title: 'Test Push Notification 🧪',
        body: 'This is a test push notification to verify your device can receive notifications.',
        data: { test: true },
      });

      return res.json({
        success: true,
        message: success ? 'Test push notification sent' : 'Failed to send test push notification',
        sent: success,
      });

    } catch (error) {
      console.error('Test push notification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send test push notification',
      });
    }
  }
);

export default router;
