import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const sendMessageSchema = z.object({
  receiverId: z.string().min(1),
  message: z.string().min(1).max(1000),
  type: z.enum(['TEXT', 'IMAGE', 'LOCATION', 'SYSTEM']).optional(),
  bookingId: z.string().optional(),
});

// Get user's conversations
router.get('/conversations', async (req, res) => {
  try {
    const userId = (req as any).userId;

    // Get latest message from each conversation
    const conversations = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        booking: {
          select: {
            id: true,
            pickupAddress: true,
            dropoffAddress: true,
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group by conversation partner and get latest message
    const conversationMap = new Map();

    conversations.forEach(message => {
      const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
      const partner = message.senderId === userId ? message.receiver : message.sender;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partner,
          latestMessage: message,
          unreadCount: 0,
          booking: message.booking,
        });
      }

      // Count unread messages
      if (message.receiverId === userId && !message.read) {
        const conversation = conversationMap.get(partnerId);
        conversation.unreadCount += 1;
      }
    });

    const conversationList = Array.from(conversationMap.values());

    return res.json({ conversations: conversationList });
  } catch (error) {
    console.error('Get conversations error:', error);
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages between two users
router.get('/messages/:partnerId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { partnerId } = req.params;
    const { page = 1, limit = 50, bookingId } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    let whereClause: any = {
      OR: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId }
      ]
    };

    if (bookingId) {
      whereClause.bookingId = bookingId;
    }

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: whereClause,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          booking: {
            select: {
              id: true,
              pickupAddress: true,
              dropoffAddress: true,
              status: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take,
      }),
      prisma.chatMessage.count({
        where: whereClause
      })
    ]);

    // Mark messages as read
    await prisma.chatMessage.updateMany({
      where: {
        senderId: partnerId,
        receiverId: userId,
        read: false,
      },
      data: {
        read: true,
      }
    });

    return res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send message
router.post('/send', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const validatedData = sendMessageSchema.parse(req.body);

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: validatedData.receiverId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      }
    });

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Verify booking if provided
    if (validatedData.bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: validatedData.bookingId }
      });

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      // Check if user is part of this booking (customer or driver)
      if (booking.userId !== userId && booking.driverId !== userId) {
        return res.status(403).json({ error: 'Not authorized to send messages for this booking' });
      }
    }

    const message = await prisma.chatMessage.create({
      data: {
        senderId: userId,
        receiverId: validatedData.receiverId,
        message: validatedData.message,
        type: validatedData.type || 'TEXT',
        bookingId: validatedData.bookingId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        booking: {
          select: {
            id: true,
            pickupAddress: true,
            dropoffAddress: true,
            status: true,
          }
        }
      }
    });

    // Emit socket event for real-time messaging (would need socket.io integration)
    // io.to(validatedData.receiverId).emit('new_message', message);

    return res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Send message error:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
router.put('/mark-read/:partnerId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { partnerId } = req.params;
    const { bookingId } = req.body;

    let whereClause: any = {
      senderId: partnerId,
      receiverId: userId,
      read: false,
    };

    if (bookingId) {
      whereClause.bookingId = bookingId;
    }

    const result = await prisma.chatMessage.updateMany({
      where: whereClause,
      data: {
        read: true,
      }
    });

    return res.json({
      message: `Marked ${result.count} messages as read`,
      count: result.count
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    return res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get unread message count
router.get('/unread/count', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const unreadCount = await prisma.chatMessage.count({
      where: {
        receiverId: userId,
        read: false,
      }
    });

    return res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

// Get booking messages
router.get('/booking/:bookingId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { bookingId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of this booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        driver: {
          include: {
            user: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId !== userId && booking.driver?.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to view messages for this booking' });
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: {
          bookingId: bookingId,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        },
        skip,
        take,
      }),
      prisma.chatMessage.count({
        where: {
          bookingId: bookingId,
        }
      })
    ]);

    // Mark messages as read
    await prisma.chatMessage.updateMany({
      where: {
        bookingId: bookingId,
        receiverId: userId,
        read: false,
      },
      data: {
        read: true,
      }
    });

    return res.json({
      messages,
      booking: {
        id: booking.id,
        customer: {
          id: booking.user.id,
          firstName: booking.user.firstName,
          lastName: booking.user.lastName,
          avatar: booking.user.avatar,
        },
        driver: booking.driver ? {
          id: booking.driver.user.id,
          firstName: booking.driver.user.firstName,
          lastName: booking.driver.user.lastName,
          avatar: booking.driver.user.avatar,
        } : null,
        status: booking.status,
      },
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get booking messages error:', error);
    return res.status(500).json({ error: 'Failed to fetch booking messages' });
  }
});

// Delete message (soft delete by setting message to empty)
router.delete('/:messageId', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { messageId } = req.params;

    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

    // Soft delete by updating message content
    const updatedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        message: 'This message was deleted',
        type: 'SYSTEM',
      }
    });

    return res.json({
      message: 'Message deleted successfully',
      data: updatedMessage
    });
  } catch (error) {
    console.error('Delete message error:', error);
    return res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Search messages
router.get('/search/:query', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { query } = req.params;
    const { page = 1, limit = 20, partnerId } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    let whereClause: any = {
      message: {
        contains: query,
        mode: 'insensitive'
      },
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    };

    if (partnerId) {
      whereClause.OR = [
        { senderId: userId, receiverId: partnerId as string },
        { senderId: partnerId as string, receiverId: userId }
      ];
    }

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where: whereClause,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          booking: {
            select: {
              id: true,
              pickupAddress: true,
              dropoffAddress: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take,
      }),
      prisma.chatMessage.count({
        where: whereClause
      })
    ]);

    return res.json({
      messages,
      query,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Search messages error:', error);
    return res.status(500).json({ error: 'Failed to search messages' });
  }
});

export default router;
