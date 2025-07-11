import { PrismaClient } from '@prisma/client';
import { Server as SocketServer } from 'socket.io';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const SendMessageSchema = z.object({
  bookingId: z.string().uuid(),
  message: z.string().min(1).max(1000),
  messageType: z.enum(['text', 'image', 'location', 'document']).default('text'),
  metadata: z.record(z.any()).optional(),
});

const MessageReactionSchema = z.object({
  messageId: z.string().uuid(),
  reaction: z.enum(['like', 'dislike', 'helpful', 'urgent']),
});

export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderType: 'USER' | 'DRIVER' | 'ADMIN';
  message: string;
  messageType: 'text' | 'image' | 'location' | 'document';
  metadata?: Record<string, any>;
  timestamp: Date;
  readAt?: Date;
  editedAt?: Date;
  deletedAt?: Date;
}

export interface ChatParticipant {
  userId: string;
  userType: 'USER' | 'DRIVER' | 'ADMIN';
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface ChatRoom {
  bookingId: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: Record<string, number>;
  createdAt: Date;
  status: 'active' | 'archived' | 'blocked';
}

class LiveChatService {
  private io?: SocketServer;
  private activeUsers = new Map<string, { socketId: string; userId: string; bookingId?: string }>();

  setSocketServer(socketServer: SocketServer) {
    this.io = socketServer;
    this.setupSocketHandlers();
  }

  /**
   * Setup Socket.IO event handlers for chat
   */
  private setupSocketHandlers() {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log(`User connected to chat: ${socket.id}`);

      // User joins a chat room
      socket.on('join-chat', async (data: { userId: string; bookingId: string }) => {
        try {
          const { userId, bookingId } = data;
          
          // Verify user has access to this booking chat
          const hasAccess = await this.verifyUserAccess(userId, bookingId);
          if (!hasAccess) {
            socket.emit('chat-error', { message: 'Access denied to this chat' });
            return;
          }

          // Join the chat room
          const roomName = `chat:${bookingId}`;
          socket.join(roomName);
          
          // Track active user
          this.activeUsers.set(socket.id, { socketId: socket.id, userId, bookingId });
          
          // Update user online status
          await this.updateUserOnlineStatus(userId, true);
          
          // Notify other participants that user is online
          socket.to(roomName).emit('user-online', { userId });
          
          // Send chat history
          const chatHistory = await this.getChatHistory(bookingId, 50);
          socket.emit('chat-history', chatHistory);
          
          console.log(`User ${userId} joined chat for booking ${bookingId}`);

        } catch (error) {
          console.error('Join chat error:', error);
          socket.emit('chat-error', { message: 'Failed to join chat' });
        }
      });

      // User sends a message
      socket.on('send-message', async (data: any) => {
        try {
          const validatedData = SendMessageSchema.parse(data);
          const activeUser = this.activeUsers.get(socket.id);
          
          if (!activeUser) {
            socket.emit('chat-error', { message: 'Not authenticated' });
            return;
          }

          const message = await this.sendMessage({
            ...validatedData,
            senderId: activeUser.userId,
          });

          // Broadcast message to all participants in the room
          const roomName = `chat:${validatedData.bookingId}`;
          this.io?.to(roomName).emit('new-message', message);
          
          // Send push notification to offline participants
          await this.notifyOfflineParticipants(validatedData.bookingId, activeUser.userId, message);

        } catch (error) {
          console.error('Send message error:', error);
          socket.emit('chat-error', { message: 'Failed to send message' });
        }
      });

      // User starts typing
      socket.on('typing-start', (data: { bookingId: string }) => {
        const activeUser = this.activeUsers.get(socket.id);
        if (activeUser) {
          const roomName = `chat:${data.bookingId}`;
          socket.to(roomName).emit('user-typing', { userId: activeUser.userId, typing: true });
        }
      });

      // User stops typing
      socket.on('typing-stop', (data: { bookingId: string }) => {
        const activeUser = this.activeUsers.get(socket.id);
        if (activeUser) {
          const roomName = `chat:${data.bookingId}`;
          socket.to(roomName).emit('user-typing', { userId: activeUser.userId, typing: false });
        }
      });

      // Mark messages as read
      socket.on('mark-read', async (data: { bookingId: string; messageId?: string }) => {
        try {
          const activeUser = this.activeUsers.get(socket.id);
          if (!activeUser) return;

          await this.markMessagesAsRead(data.bookingId, activeUser.userId, data.messageId);
          
          const roomName = `chat:${data.bookingId}`;
          socket.to(roomName).emit('messages-read', { 
            userId: activeUser.userId, 
            messageId: data.messageId 
          });

        } catch (error) {
          console.error('Mark read error:', error);
        }
      });

      // React to message
      socket.on('react-message', async (data: any) => {
        try {
          const validatedData = MessageReactionSchema.parse(data);
          const activeUser = this.activeUsers.get(socket.id);
          
          if (!activeUser) return;

          const reaction = await this.addMessageReaction({
            ...validatedData,
            userId: activeUser.userId,
          });

          // Get the booking ID for this message
          const message = await prisma.chatMessage.findUnique({
            where: { id: validatedData.messageId },
            select: { bookingId: true },
          });

          if (message) {
            const roomName = `chat:${message.bookingId}`;
            this.io?.to(roomName).emit('message-reaction', reaction);
          }

        } catch (error) {
          console.error('Message reaction error:', error);
        }
      });

      // User disconnects
      socket.on('disconnect', async () => {
        const activeUser = this.activeUsers.get(socket.id);
        if (activeUser) {
          // Update user offline status
          await this.updateUserOnlineStatus(activeUser.userId, false);
          
          // Notify other participants that user is offline
          if (activeUser.bookingId) {
            const roomName = `chat:${activeUser.bookingId}`;
            socket.to(roomName).emit('user-offline', { userId: activeUser.userId });
          }
          
          this.activeUsers.delete(socket.id);
        }
        
        console.log(`User disconnected from chat: ${socket.id}`);
      });
    });
  }

  /**
   * Send a chat message
   */
  async sendMessage(data: {
    bookingId: string;
    senderId: string;
    message: string;
    messageType?: 'text' | 'image' | 'location' | 'document';
    metadata?: Record<string, any>;
  }): Promise<ChatMessage> {
    try {
      // Get sender information
      const sender = await prisma.user.findUnique({
        where: { id: data.senderId },
        select: { id: true, role: true, firstName: true, lastName: true },
      });

      if (!sender) {
        throw new Error('Sender not found');
      }

      // Create the message
      const chatMessage = await prisma.chatMessage.create({
        data: {
          bookingId: data.bookingId,
          senderId: data.senderId,
          senderType: sender.role as 'USER' | 'DRIVER' | 'ADMIN',
          message: data.message,
          messageType: data.messageType || 'text',
          metadata: data.metadata || {},
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
            },
          },
        },
      });

      // Update chat room last activity
      await this.updateChatRoomActivity(data.bookingId);

      return {
        id: chatMessage.id,
        bookingId: chatMessage.bookingId,
        senderId: chatMessage.senderId,
        senderType: chatMessage.senderType as 'USER' | 'DRIVER' | 'ADMIN',
        message: chatMessage.message,
        messageType: chatMessage.messageType as 'text' | 'image' | 'location' | 'document',
        metadata: chatMessage.metadata as Record<string, any>,
        timestamp: chatMessage.createdAt,
        readAt: chatMessage.readAt || undefined,
        editedAt: chatMessage.editedAt || undefined,
        deletedAt: chatMessage.deletedAt || undefined,
      };

    } catch (error) {
      console.error('Send message error:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Get chat history for a booking
   */
  async getChatHistory(bookingId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    try {
      const messages = await prisma.chatMessage.findMany({
        where: {
          bookingId,
          deletedAt: null,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
            },
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      return messages.map((msg: any) => ({
        id: msg.id,
        bookingId: msg.bookingId,
        senderId: msg.senderId,
        senderType: msg.senderType as 'USER' | 'DRIVER' | 'ADMIN',
        message: msg.message,
        messageType: msg.messageType as 'text' | 'image' | 'location' | 'document',
        metadata: msg.metadata as Record<string, any>,
        timestamp: msg.createdAt,
        readAt: msg.readAt || undefined,
        editedAt: msg.editedAt || undefined,
        deletedAt: msg.deletedAt || undefined,
      })).reverse(); // Return in chronological order

    } catch (error) {
      console.error('Get chat history error:', error);
      throw new Error('Failed to get chat history');
    }
  }

  /**
   * Get chat participants for a booking
   */
  async getChatParticipants(bookingId: string): Promise<ChatParticipant[]> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              isOnline: true,
              lastSeen: true,
            },
          },
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              isOnline: true,
              lastSeen: true,
            },
          },
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      const participants: ChatParticipant[] = [];

      // Add customer
      if (booking.user) {
        participants.push({
          userId: booking.user.id,
          userType: 'USER',
          name: `${booking.user.firstName} ${booking.user.lastName}`,
          avatar: booking.user.profilePicture || undefined,
          isOnline: booking.user.isOnline || false,
          lastSeen: booking.user.lastSeen || undefined,
        });
      }

      // Add driver
      if (booking.driver) {
        participants.push({
          userId: booking.driver.id,
          userType: 'DRIVER',
          name: `${booking.driver.firstName} ${booking.driver.lastName}`,
          avatar: booking.driver.profilePicture || undefined,
          isOnline: booking.driver.isOnline || false,
          lastSeen: booking.driver.lastSeen || undefined,
        });
      }

      return participants;

    } catch (error) {
      console.error('Get chat participants error:', error);
      throw new Error('Failed to get chat participants');
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(bookingId: string, userId: string, messageId?: string): Promise<void> {
    try {
      if (messageId) {
        // Mark specific message as read
        await prisma.chatMessage.update({
          where: { id: messageId },
          data: { readAt: new Date() },
        });
      } else {
        // Mark all unread messages as read
        await prisma.chatMessage.updateMany({
          where: {
            bookingId,
            senderId: { not: userId },
            readAt: null,
          },
          data: { readAt: new Date() },
        });
      }

    } catch (error) {
      console.error('Mark messages as read error:', error);
      throw new Error('Failed to mark messages as read');
    }
  }

  /**
   * Add reaction to message
   */
  async addMessageReaction(data: {
    messageId: string;
    userId: string;
    reaction: 'like' | 'dislike' | 'helpful' | 'urgent';
  }) {
    try {
      // Remove existing reaction from this user
      await prisma.messageReaction.deleteMany({
        where: {
          messageId: data.messageId,
          userId: data.userId,
        },
      });

      // Add new reaction
      const reaction = await prisma.messageReaction.create({
        data: {
          messageId: data.messageId,
          userId: data.userId,
          reaction: data.reaction,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      return reaction;

    } catch (error) {
      console.error('Add message reaction error:', error);
      throw new Error('Failed to add message reaction');
    }
  }

  /**
   * Get unread message count for user
   */
  async getUnreadCount(userId: string, bookingId?: string): Promise<Record<string, number>> {
    try {
      const whereClause: any = {
        senderId: { not: userId },
        readAt: null,
      };

      if (bookingId) {
        whereClause.bookingId = bookingId;
      }

      if (bookingId) {
        // Get count for specific booking
        const count = await prisma.chatMessage.count({
          where: whereClause,
        });
        return { [bookingId]: count };
      } else {
        // Get counts for all bookings
        const counts = await prisma.chatMessage.groupBy({
          by: ['bookingId'],
          where: whereClause,
          _count: {
            id: true,
          },
        });

        return counts.reduce((acc: any, item: any) => {
          acc[item.bookingId] = item._count.id;
          return acc;
        }, {} as Record<string, number>);
      }

    } catch (error) {
      console.error('Get unread count error:', error);
      return {};
    }
  }

  /**
   * Verify user has access to chat
   */
  private async verifyUserAccess(userId: string, bookingId: string): Promise<boolean> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: { userId: true, driverId: true },
      });

      if (!booking) {
        return false;
      }

      return booking.userId === userId || booking.driverId === userId;

    } catch (error) {
      console.error('Verify user access error:', error);
      return false;
    }
  }

  /**
   * Update user online status
   */
  private async updateUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isOnline,
          lastSeen: isOnline ? undefined : new Date(),
        },
      });
    } catch (error) {
      console.error('Update user online status error:', error);
    }
  }

  /**
   * Update chat room last activity
   */
  private async updateChatRoomActivity(bookingId: string): Promise<void> {
    try {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { lastChatActivity: new Date() },
      });
    } catch (error) {
      console.error('Update chat room activity error:', error);
    }
  }

  /**
   * Notify offline participants about new message
   */
  private async notifyOfflineParticipants(
    bookingId: string,
    senderId: string,
    message: ChatMessage
  ): Promise<void> {
    try {
      const participants = await this.getChatParticipants(bookingId);
      const offlineParticipants = participants.filter(
        p => p.userId !== senderId && !p.isOnline
      );

      for (const participant of offlineParticipants) {
        // Send push notification (integrate with push notification service)
        console.log(`Sending chat notification to ${participant.userId}: ${message.message}`);
      }

    } catch (error) {
      console.error('Notify offline participants error:', error);
    }
  }

  /**
   * Archive chat room
   */
  async archiveChatRoom(bookingId: string): Promise<void> {
    try {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { chatStatus: 'archived' },
      });
    } catch (error) {
      console.error('Archive chat room error:', error);
    }
  }

  /**
   * Get chat rooms for user
   */
  async getUserChatRooms(userId: string): Promise<ChatRoom[]> {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          OR: [
            { userId },
            { driverId: userId },
          ],
          status: { not: 'CANCELLED' },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              isOnline: true,
              lastSeen: true,
            },
          },
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePicture: true,
              isOnline: true,
              lastSeen: true,
            },
          },
          _count: {
            select: {
              chatMessages: {
                where: {
                  senderId: { not: userId },
                  readAt: null,
                },
              },
            },
          },
        },
        orderBy: { lastChatActivity: 'desc' },
      });

      return bookings.map((booking: any) => ({
        bookingId: booking.id,
        participants: [
          booking.user && {
            userId: booking.user.id,
            userType: 'USER' as const,
            name: `${booking.user.firstName} ${booking.user.lastName}`,
            avatar: booking.user.profilePicture || undefined,
            isOnline: booking.user.isOnline || false,
            lastSeen: booking.user.lastSeen || undefined,
          },
          booking.driver && {
            userId: booking.driver.id,
            userType: 'DRIVER' as const,
            name: `${booking.driver.firstName} ${booking.driver.lastName}`,
            avatar: booking.driver.profilePicture || undefined,
            isOnline: booking.driver.isOnline || false,
            lastSeen: booking.driver.lastSeen || undefined,
          },
        ].filter(Boolean) as ChatParticipant[],
        unreadCount: { [userId]: booking._count.chatMessages },
        createdAt: booking.createdAt,
        status: (booking.chatStatus as 'active' | 'archived' | 'blocked') || 'active',
      }));

    } catch (error) {
      console.error('Get user chat rooms error:', error);
      return [];
    }
  }
}

export default new LiveChatService();
