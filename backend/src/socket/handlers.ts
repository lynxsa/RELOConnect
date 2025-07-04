import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SocketUser {
  userId: string;
  socketId: string;
}

// Store connected users
const connectedUsers = new Map<string, SocketUser>();

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.userId = decoded.userId;
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    
    console.log(`User ${userId} connected with socket ${socket.id}`);
    
    // Store user connection
    connectedUsers.set(userId, {
      userId,
      socketId: socket.id
    });

    // Join user to their personal room
    socket.join(userId);

    // Handle user going online/offline for drivers
    handleDriverStatus(socket);

    // Handle chat events
    handleChatEvents(socket, io);

    // Handle booking events
    handleBookingEvents(socket, io);

    // Handle location updates
    handleLocationEvents(socket, io);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
      connectedUsers.delete(userId);
      
      // Mark driver as offline if applicable
      markDriverOffline(userId);
    });
  });
};

// Driver status handlers
const handleDriverStatus = (socket: any) => {
  const userId = socket.data.userId;

  socket.on('driver:online', async () => {
    try {
      await prisma.driver.updateMany({
        where: { userId },
        data: { isOnline: true }
      });
      
      socket.broadcast.emit('driver:status_changed', {
        driverId: userId,
        isOnline: true
      });
    } catch (error) {
      console.error('Driver online error:', error);
    }
  });

  socket.on('driver:offline', async () => {
    try {
      await prisma.driver.updateMany({
        where: { userId },
        data: { isOnline: false }
      });
      
      socket.broadcast.emit('driver:status_changed', {
        driverId: userId,
        isOnline: false
      });
    } catch (error) {
      console.error('Driver offline error:', error);
    }
  });
};

// Chat event handlers
const handleChatEvents = (socket: any, io: Server) => {
  const userId = socket.data.userId;

  socket.on('chat:join_conversation', (data: { partnerId: string }) => {
    const roomId = [userId, data.partnerId].sort().join('-');
    socket.join(roomId);
  });

  socket.on('chat:leave_conversation', (data: { partnerId: string }) => {
    const roomId = [userId, data.partnerId].sort().join('-');
    socket.leave(roomId);
  });

  socket.on('chat:typing', (data: { partnerId: string, isTyping: boolean }) => {
    const roomId = [userId, data.partnerId].sort().join('-');
    socket.to(roomId).emit('chat:user_typing', {
      userId,
      isTyping: data.isTyping
    });
  });

  socket.on('chat:message_sent', (messageData: any) => {
    // Emit to receiver
    io.to(messageData.receiverId).emit('chat:new_message', messageData);
    
    // Emit to conversation room
    const roomId = [userId, messageData.receiverId].sort().join('-');
    socket.to(roomId).emit('chat:new_message', messageData);
  });
};

// Booking event handlers
const handleBookingEvents = (socket: any, io: Server) => {
  const userId = socket.data.userId;

  socket.on('booking:join', (data: { bookingId: string }) => {
    socket.join(`booking:${data.bookingId}`);
  });

  socket.on('booking:leave', (data: { bookingId: string }) => {
    socket.leave(`booking:${data.bookingId}`);
  });

  socket.on('booking:status_update', (data: { bookingId: string, status: string }) => {
    io.to(`booking:${data.bookingId}`).emit('booking:status_changed', {
      bookingId: data.bookingId,
      status: data.status,
      updatedBy: userId,
      timestamp: new Date()
    });
  });

  socket.on('booking:driver_assigned', (data: { bookingId: string, driverId: string, customerId: string }) => {
    // Notify customer
    io.to(data.customerId).emit('booking:driver_assigned', {
      bookingId: data.bookingId,
      driverId: data.driverId,
      timestamp: new Date()
    });
    
    // Notify booking room
    io.to(`booking:${data.bookingId}`).emit('booking:driver_assigned', data);
  });

  socket.on('booking:arrival_notification', (data: { bookingId: string, customerId: string }) => {
    io.to(data.customerId).emit('booking:driver_arrived', {
      bookingId: data.bookingId,
      message: 'Your driver has arrived at the pickup location',
      timestamp: new Date()
    });
  });
};

// Location event handlers
const handleLocationEvents = (socket: any, io: Server) => {
  const userId = socket.data.userId;

  socket.on('location:update', async (data: { latitude: number, longitude: number, bookingId?: string }) => {
    try {
      // Update driver location in database
      await prisma.driver.updateMany({
        where: { userId },
        data: {
          currentLatitude: data.latitude,
          currentLongitude: data.longitude,
        }
      });

      // If tracking for a specific booking, emit to that booking room
      if (data.bookingId) {
        io.to(`booking:${data.bookingId}`).emit('location:driver_update', {
          driverId: userId,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: new Date()
        });
      }

      // Emit general location update
      socket.broadcast.emit('location:driver_update', {
        driverId: userId,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Location update error:', error);
    }
  });

  socket.on('location:request_eta', async (data: { bookingId: string, customerId: string }) => {
    // Calculate and send ETA (simplified)
    const eta = Math.floor(Math.random() * 20) + 5; // Random ETA between 5-25 minutes
    
    io.to(data.customerId).emit('location:eta_update', {
      bookingId: data.bookingId,
      eta: eta,
      timestamp: new Date()
    });
  });
};

// Helper functions
const markDriverOffline = async (userId: string) => {
  try {
    await prisma.driver.updateMany({
      where: { userId },
      data: { isOnline: false }
    });
  } catch (error) {
    console.error('Mark driver offline error:', error);
  }
};

// Utility functions to emit events from REST routes
export const emitToUser = (io: Server, userId: string, event: string, data: any) => {
  io.to(userId).emit(event, data);
};

export const emitToBooking = (io: Server, bookingId: string, event: string, data: any) => {
  io.to(`booking:${bookingId}`).emit(event, data);
};

export const emitToRoom = (io: Server, roomId: string, event: string, data: any) => {
  io.to(roomId).emit(event, data);
};

export const getConnectedUsers = () => {
  return Array.from(connectedUsers.values());
};

export const isUserOnline = (userId: string) => {
  return connectedUsers.has(userId);
};
