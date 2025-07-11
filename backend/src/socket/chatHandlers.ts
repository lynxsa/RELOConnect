import { Server as SocketIOServer, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Validation schemas
const sendMessageSchema = z.object({
  receiverId: z.string().min(1),
  message: z.string().min(1).max(1000),
  type: z.enum(['TEXT', 'IMAGE', 'LOCATION', 'SYSTEM']).optional(),
  bookingId: z.string().optional(),
});

const typingSchema = z.object({
  receiverId: z.string().min(1),
  bookingId: z.string().optional(),
});

const joinRoomSchema = z.object({
  bookingId: z.string().min(1),
});

// Track user connections and typing status
interface UserConnection {
  socketId: string;
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
}

interface TypingStatus {
  userId: string;
  receiverId: string;
  isTyping: boolean;
  timestamp: Date;
  bookingId?: string;
}

const userConnections = new Map<string, UserConnection>();
const typingUsers = new Map<string, TypingStatus>();

export const setupChatHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected to chat:', socket.id);

    // Authenticate user on connection
    socket.on('authenticate', async (token: string) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
        const userId = decoded.userId;

        // Store user connection
        userConnections.set(socket.id, {
          socketId: socket.id,
          userId,
          isOnline: true,
          lastSeen: new Date(),
        });

        // Join user to their personal room
        socket.join(`user_${userId}`);

        // Update user online status
        await prisma.user.update({
          where: { id: userId },
          data: { 
            isOnline: true,
            lastSeen: new Date(),
          },
        });

        // Notify contacts about online status
        socket.broadcast.emit('user_online', { userId, timestamp: new Date() });

        socket.emit('authenticated', { userId, status: 'online' });
        console.log(`User ${userId} authenticated and joined chat`);
      } catch (error) {
        console.error('Chat authentication error:', error);
        socket.emit('auth_error', { message: 'Invalid token' });
        socket.disconnect();
      }
    });

    // Join booking room for real-time chat
    socket.on('join_booking', async (data) => {
      try {
        const validatedData = joinRoomSchema.parse(data);
        const connection = userConnections.get(socket.id);

        if (!connection) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Verify user is part of this booking
        const booking = await prisma.booking.findUnique({
          where: { id: validatedData.bookingId },
          include: {
            driver: true,
          }
        });

        if (!booking) {
          socket.emit('error', { message: 'Booking not found' });
          return;
        }

        if (booking.userId !== connection.userId && booking.driver?.userId !== connection.userId) {
          socket.emit('error', { message: 'Not authorized for this booking' });
          return;
        }

        socket.join(`booking_${validatedData.bookingId}`);
        socket.emit('joined_booking', { bookingId: validatedData.bookingId });
        console.log(`User ${connection.userId} joined booking room: ${validatedData.bookingId}`);
      } catch (error) {
        console.error('Join booking error:', error);
        socket.emit('error', { message: 'Failed to join booking' });
      }
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const validatedData = sendMessageSchema.parse(data);
        const connection = userConnections.get(socket.id);

        if (!connection) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Verify receiver exists
        const receiver = await prisma.user.findUnique({
          where: { id: validatedData.receiverId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          }
        });

        if (!receiver) {
          socket.emit('error', { message: 'Receiver not found' });
          return;
        }

        // Verify booking if provided
        if (validatedData.bookingId) {
          const booking = await prisma.booking.findUnique({
            where: { id: validatedData.bookingId }
          });

          if (!booking) {
            socket.emit('error', { message: 'Booking not found' });
            return;
          }

          // Check if user is part of this booking
          if (booking.userId !== connection.userId && booking.driverId !== connection.userId) {
            socket.emit('error', { message: 'Not authorized to send messages for this booking' });
            return;
          }
        }

        // Create message in database
        const message = await prisma.chatMessage.create({
          data: {
            senderId: connection.userId,
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

        // Send to receiver's personal room
        io.to(`user_${validatedData.receiverId}`).emit('new_message', message);

        // Send to booking room if applicable
        if (validatedData.bookingId) {
          io.to(`booking_${validatedData.bookingId}`).emit('booking_message', message);
        }

        // Send confirmation to sender
        socket.emit('message_sent', { messageId: message.id, timestamp: message.createdAt });

        // Stop typing for this user
        const typingKey = `${connection.userId}_${validatedData.receiverId}`;
        if (typingUsers.has(typingKey)) {
          typingUsers.delete(typingKey);
          io.to(`user_${validatedData.receiverId}`).emit('user_stopped_typing', {
            userId: connection.userId,
            receiverId: validatedData.receiverId,
            bookingId: validatedData.bookingId,
          });
        }

        console.log(`Message sent from ${connection.userId} to ${validatedData.receiverId}`);
      } catch (error) {
        console.error('Send message error:', error);
        if (error instanceof z.ZodError) {
          socket.emit('error', { message: 'Invalid message data', details: error.errors });
        } else {
          socket.emit('error', { message: 'Failed to send message' });
        }
      }
    });

    // Handle typing indicators
    socket.on('typing_start', async (data) => {
      try {
        const validatedData = typingSchema.parse(data);
        const connection = userConnections.get(socket.id);

        if (!connection) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        const typingKey = `${connection.userId}_${validatedData.receiverId}`;
        typingUsers.set(typingKey, {
          userId: connection.userId,
          receiverId: validatedData.receiverId,
          isTyping: true,
          timestamp: new Date(),
          bookingId: validatedData.bookingId,
        });

        // Notify receiver
        io.to(`user_${validatedData.receiverId}`).emit('user_typing', {
          userId: connection.userId,
          receiverId: validatedData.receiverId,
          bookingId: validatedData.bookingId,
        });

        // Auto-stop typing after 3 seconds
        setTimeout(() => {
          if (typingUsers.has(typingKey)) {
            const typingStatus = typingUsers.get(typingKey);
            if (typingStatus && new Date().getTime() - typingStatus.timestamp.getTime() >= 3000) {
              typingUsers.delete(typingKey);
              io.to(`user_${validatedData.receiverId}`).emit('user_stopped_typing', {
                userId: connection.userId,
                receiverId: validatedData.receiverId,
                bookingId: validatedData.bookingId,
              });
            }
          }
        }, 3000);
      } catch (error) {
        console.error('Typing start error:', error);
        socket.emit('error', { message: 'Failed to update typing status' });
      }
    });

    socket.on('typing_stop', async (data) => {
      try {
        const validatedData = typingSchema.parse(data);
        const connection = userConnections.get(socket.id);

        if (!connection) {
          return;
        }

        const typingKey = `${connection.userId}_${validatedData.receiverId}`;
        typingUsers.delete(typingKey);

        // Notify receiver
        io.to(`user_${validatedData.receiverId}`).emit('user_stopped_typing', {
          userId: connection.userId,
          receiverId: validatedData.receiverId,
          bookingId: validatedData.bookingId,
        });
      } catch (error) {
        console.error('Typing stop error:', error);
      }
    });

    // Mark messages as read
    socket.on('mark_messages_read', async (data) => {
      try {
        const { partnerId, bookingId } = data;
        const connection = userConnections.get(socket.id);

        if (!connection) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        let whereClause: any = {
          senderId: partnerId,
          receiverId: connection.userId,
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

        // Notify sender that messages were read
        io.to(`user_${partnerId}`).emit('messages_read', {
          readerId: connection.userId,
          count: result.count,
          bookingId,
        });

        socket.emit('messages_marked_read', { count: result.count });
      } catch (error) {
        console.error('Mark messages read error:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Get online users
    socket.on('get_online_users', (data) => {
      const connection = userConnections.get(socket.id);
      if (!connection) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const onlineUsers = Array.from(userConnections.values())
        .filter(conn => conn.isOnline && conn.userId !== connection.userId)
        .map(conn => ({
          userId: conn.userId,
          lastSeen: conn.lastSeen,
        }));

      socket.emit('online_users', onlineUsers);
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log('User disconnected from chat:', socket.id);
      
      const connection = userConnections.get(socket.id);
      if (connection) {
        try {
          // Update user offline status
          await prisma.user.update({
            where: { id: connection.userId },
            data: { 
              isOnline: false,
              lastSeen: new Date(),
            },
          });

          // Clean up typing status
          for (const [key, typing] of typingUsers.entries()) {
            if (typing.userId === connection.userId) {
              typingUsers.delete(key);
              io.to(`user_${typing.receiverId}`).emit('user_stopped_typing', {
                userId: typing.userId,
                receiverId: typing.receiverId,
                bookingId: typing.bookingId,
              });
            }
          }

          // Notify contacts about offline status
          socket.broadcast.emit('user_offline', { 
            userId: connection.userId, 
            lastSeen: new Date() 
          });

          // Remove connection
          userConnections.delete(socket.id);
          
          console.log(`User ${connection.userId} disconnected from chat`);
        } catch (error) {
          console.error('Error updating user offline status:', error);
        }
      }
    });
  });

  // Clean up typing indicators periodically
  setInterval(() => {
    const now = new Date();
    for (const [key, typing] of typingUsers.entries()) {
      if (now.getTime() - typing.timestamp.getTime() > 10000) { // 10 seconds
        typingUsers.delete(key);
        io.to(`user_${typing.receiverId}`).emit('user_stopped_typing', {
          userId: typing.userId,
          receiverId: typing.receiverId,
          bookingId: typing.bookingId,
        });
      }
    }
  }, 5000); // Check every 5 seconds
};

// Helper functions for external use
export const sendSystemMessage = async (
  io: SocketIOServer,
  senderId: string,
  receiverId: string,
  message: string,
  bookingId?: string
) => {
  try {
    const systemMessage = await prisma.chatMessage.create({
      data: {
        senderId,
        receiverId,
        message,
        type: 'SYSTEM',
        bookingId,
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

    // Send to receiver
    io.to(`user_${receiverId}`).emit('new_message', systemMessage);

    // Send to booking room if applicable
    if (bookingId) {
      io.to(`booking_${bookingId}`).emit('booking_message', systemMessage);
    }

    return systemMessage;
  } catch (error) {
    console.error('Send system message error:', error);
    throw error;
  }
};

export const notifyBookingUpdate = (
  io: SocketIOServer,
  bookingId: string,
  updateType: string,
  data: any
) => {
  io.to(`booking_${bookingId}`).emit('booking_update', {
    bookingId,
    type: updateType,
    data,
    timestamp: new Date(),
  });
};

export const getOnlineUsers = (): string[] => {
  return Array.from(userConnections.values())
    .filter(conn => conn.isOnline)
    .map(conn => conn.userId);
};

export const isUserOnline = (userId: string): boolean => {
  return Array.from(userConnections.values())
    .some(conn => conn.userId === userId && conn.isOnline);
};
