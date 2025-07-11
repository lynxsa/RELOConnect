import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

export interface TrackingUpdate {
  driverId: string;
  bookingId: string;
  location: LocationData;
  status: 'en_route' | 'arrived' | 'loading' | 'in_transit' | 'unloading' | 'completed';
  estimatedArrival?: Date;
}

export interface ConnectedUser {
  userId: string;
  userType: 'customer' | 'driver' | 'admin';
  socketId: string;
  currentBooking?: string;
}

class RealTimeTrackingHandler {
  private io: Server;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private trackingRooms: Map<string, Set<string>> = new Map(); // bookingId -> Set of socketIds

  constructor(io: Server) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Authenticate user
      this.authenticateSocket(socket);

      // Handle tracking events
      socket.on('join_tracking', (data) => this.handleJoinTracking(socket, data));
      socket.on('leave_tracking', (data) => this.handleLeaveTracking(socket, data));
      socket.on('location_update', (data) => this.handleLocationUpdate(socket, data));
      socket.on('status_update', (data) => this.handleStatusUpdate(socket, data));
      socket.on('emergency_alert', (data) => this.handleEmergencyAlert(socket, data));

      // Handle disconnection
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  private async authenticateSocket(socket: Socket): Promise<void> {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        socket.emit('auth_error', { message: 'No authentication token provided' });
        socket.disconnect(true);
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as any;
      const userId = decoded.userId;

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          driverProfile: true,
        },
      });

      if (!user || !user.isActive) {
        socket.emit('auth_error', { message: 'Invalid or inactive user' });
        socket.disconnect(true);
        return;
      }

      // Determine user type
      let userType: 'customer' | 'driver' | 'admin' = 'customer';
      if (user.role === 'ADMIN') {
        userType = 'admin';
      } else if (user.driverProfile) {
        userType = 'driver';
      }

      // Store connected user
      const connectedUser: ConnectedUser = {
        userId,
        userType,
        socketId: socket.id,
      };

      this.connectedUsers.set(socket.id, connectedUser);
      socket.emit('auth_success', { userId, userType });

      console.log(`✅ User authenticated: ${userId} (${userType})`);
    } catch (error) {
      console.error('Socket authentication failed:', error);
      socket.emit('auth_error', { message: 'Authentication failed' });
      socket.disconnect(true);
    }
  }

  private handleJoinTracking(socket: Socket, data: { bookingId: string; role?: string }): void {
    try {
      const user = this.connectedUsers.get(socket.id);
      if (!user) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const { bookingId } = data;
      
      // Add socket to tracking room
      socket.join(`tracking_${bookingId}`);
      
      // Track room membership
      if (!this.trackingRooms.has(bookingId)) {
        this.trackingRooms.set(bookingId, new Set());
      }
      this.trackingRooms.get(bookingId)!.add(socket.id);

      // Update user's current booking
      user.currentBooking = bookingId;

      console.log(`📍 User ${user.userId} joined tracking for booking: ${bookingId}`);
      
      // Send confirmation
      socket.emit('tracking_joined', { bookingId });

      // If this is a driver, send initial status update
      if (user.userType === 'driver') {
        this.sendDriverStatusUpdate(bookingId, user.userId);
      }
    } catch (error) {
      console.error('Error joining tracking:', error);
      socket.emit('error', { message: 'Failed to join tracking' });
    }
  }

  private handleLeaveTracking(socket: Socket, data: { bookingId: string }): void {
    try {
      const user = this.connectedUsers.get(socket.id);
      if (!user) return;

      const { bookingId } = data;
      
      // Remove from tracking room
      socket.leave(`tracking_${bookingId}`);
      
      // Remove from room tracking
      if (this.trackingRooms.has(bookingId)) {
        this.trackingRooms.get(bookingId)!.delete(socket.id);
        
        // Clean up empty rooms
        if (this.trackingRooms.get(bookingId)!.size === 0) {
          this.trackingRooms.delete(bookingId);
        }
      }

      // Clear current booking
      if (user.currentBooking === bookingId) {
        user.currentBooking = undefined;
      }

      console.log(`📍 User ${user.userId} left tracking for booking: ${bookingId}`);
      socket.emit('tracking_left', { bookingId });
    } catch (error) {
      console.error('Error leaving tracking:', error);
    }
  }

  private async handleLocationUpdate(socket: Socket, data: TrackingUpdate): Promise<void> {
    try {
      const user = this.connectedUsers.get(socket.id);
      if (!user || user.userType !== 'driver') {
        socket.emit('error', { message: 'Only drivers can send location updates' });
        return;
      }

      const { bookingId, location, status } = data;

      // Verify driver is assigned to this booking
      const booking = await prisma.booking.findFirst({
        where: {
          id: bookingId,
          // Add driver assignment check here when schema is fixed
        },
      });

      if (!booking) {
        socket.emit('error', { message: 'Booking not found or not assigned to driver' });
        return;
      }

      // Store location update in database
      await this.storeLocationUpdate(user.userId, bookingId, location, status);

      // Calculate ETA if needed
      const eta = await this.calculateETA(location, booking);

      // Broadcast to all users in tracking room
      const trackingUpdate: TrackingUpdate = {
        driverId: user.userId,
        bookingId,
        location,
        status,
        estimatedArrival: eta,
      };

      this.io.to(`tracking_${bookingId}`).emit('tracking_update', trackingUpdate);

      // Send specific updates to customer
      this.io.to(`tracking_${bookingId}`).emit(`tracking_update_${bookingId}`, trackingUpdate);

      console.log(`📍 Location update broadcasted for booking: ${bookingId}`);
    } catch (error) {
      console.error('Error handling location update:', error);
      socket.emit('error', { message: 'Failed to process location update' });
    }
  }

  private async handleStatusUpdate(socket: Socket, data: any): Promise<void> {
    try {
      const user = this.connectedUsers.get(socket.id);
      if (!user || user.userType !== 'driver') {
        socket.emit('error', { message: 'Only drivers can send status updates' });
        return;
      }

      const { bookingId, status, location } = data;

      // Update booking status in database
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: this.mapTrackingStatusToBookingStatus(status),
          updatedAt: new Date(),
        },
      });

      // Broadcast status update
      this.io.to(`tracking_${bookingId}`).emit('status_update', {
        bookingId,
        status,
        location,
        timestamp: Date.now(),
        driverId: user.userId,
      });

      console.log(`📋 Status update: ${status} for booking: ${bookingId}`);
    } catch (error) {
      console.error('Error handling status update:', error);
      socket.emit('error', { message: 'Failed to process status update' });
    }
  }

  private async handleEmergencyAlert(socket: Socket, data: any): Promise<void> {
    try {
      const user = this.connectedUsers.get(socket.id);
      if (!user) {
        socket.emit('error', { message: 'Not authenticated' });
        return;
      }

      const { bookingId, message, location } = data;

      // Log emergency alert
      console.log(`🚨 EMERGENCY ALERT from ${user.userId}: ${message}`);

      // Store in database
      await this.storeEmergencyAlert(user.userId, bookingId, message, location);

      // Broadcast to admins and emergency contacts
      this.io.emit('emergency_alert', {
        userId: user.userId,
        userType: user.userType,
        bookingId,
        message,
        location,
        timestamp: Date.now(),
      });

      // Send to specific booking tracking room
      this.io.to(`tracking_${bookingId}`).emit('emergency_alert', {
        bookingId,
        message,
        location,
        timestamp: Date.now(),
      });

      socket.emit('emergency_alert_sent', { success: true });
    } catch (error) {
      console.error('Error handling emergency alert:', error);
      socket.emit('error', { message: 'Failed to send emergency alert' });
    }
  }

  private handleDisconnect(socket: Socket): void {
    try {
      const user = this.connectedUsers.get(socket.id);
      if (user) {
        // Remove from all tracking rooms
        for (const [bookingId, socketIds] of this.trackingRooms.entries()) {
          if (socketIds.has(socket.id)) {
            socketIds.delete(socket.id);
            if (socketIds.size === 0) {
              this.trackingRooms.delete(bookingId);
            }
          }
        }

        // Remove from connected users
        this.connectedUsers.delete(socket.id);
        
        console.log(`🔌 User ${user.userId} disconnected`);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }

  private async storeLocationUpdate(
    driverId: string,
    bookingId: string,
    location: LocationData,
    status: string
  ): Promise<void> {
    try {
      // Store in a location tracking table (to be added to schema)
      console.log(`Storing location update for driver ${driverId}, booking ${bookingId}`);
      // Implementation pending schema updates
    } catch (error) {
      console.error('Error storing location update:', error);
    }
  }

  private async calculateETA(location: LocationData, booking: any): Promise<Date> {
    try {
      // Simple ETA calculation - can be enhanced with routing services
      const averageSpeed = 60; // km/h
      const estimatedDistance = 10; // km - replace with actual calculation
      const timeInHours = estimatedDistance / averageSpeed;
      return new Date(Date.now() + (timeInHours * 60 * 60 * 1000));
    } catch (error) {
      console.error('Error calculating ETA:', error);
      return new Date(Date.now() + 60 * 60 * 1000); // Default 1 hour
    }
  }

  private mapTrackingStatusToBookingStatus(trackingStatus: string): string {
    const statusMap: Record<string, string> = {
      'en_route': 'CONFIRMED',
      'arrived': 'IN_PROGRESS',
      'loading': 'IN_PROGRESS',
      'in_transit': 'IN_PROGRESS',
      'unloading': 'IN_PROGRESS',
      'completed': 'COMPLETED',
    };
    return statusMap[trackingStatus] || 'CONFIRMED';
  }

  private async storeEmergencyAlert(
    userId: string,
    bookingId: string,
    message: string,
    location: LocationData
  ): Promise<void> {
    try {
      // Store emergency alert in database
      console.log(`Storing emergency alert from user ${userId}: ${message}`);
      // Implementation pending
    } catch (error) {
      console.error('Error storing emergency alert:', error);
    }
  }

  private async sendDriverStatusUpdate(bookingId: string, driverId: string): Promise<void> {
    try {
      // Send current driver status to newly connected clients
      console.log(`Sending driver status for booking ${bookingId}`);
      // Implementation pending
    } catch (error) {
      console.error('Error sending driver status:', error);
    }
  }

  // Public methods for external use
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getActiveTrackingRooms(): string[] {
    return Array.from(this.trackingRooms.keys());
  }

  public broadcastToBooking(bookingId: string, event: string, data: any): void {
    this.io.to(`tracking_${bookingId}`).emit(event, data);
  }
}

export default RealTimeTrackingHandler;
