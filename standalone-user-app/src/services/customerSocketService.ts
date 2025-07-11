import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface CustomerOrder {
  id: string;
  status: 'confirmed' | 'assigned' | 'pickup' | 'in_transit' | 'delivered' | 'cancelled';
  driverId: string;
  pickupLocation: { latitude: number; longitude: number; address: string };
  deliveryLocation: { latitude: number; longitude: number; address: string };
  scheduledDateTime: string;
  estimatedArrival?: string;
  eta?: number;
  distance?: number;
}

export interface DriverLocationUpdate {
  driverId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
  bookingId: string;
  senderType: 'customer' | 'driver';
}

export interface OrderStatusUpdate {
  bookingId: string;
  status: string;
  message: string;
  timestamp: Date;
  location?: string;
}

class CustomerSocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  // Initialize socket connection
  async connect(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const serverUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
      
      this.socket = io(serverUrl, {
        auth: {
          token: token
        },
        timeout: 10000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        transports: ['websocket', 'polling']
      });

      this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        this.socket?.on('connect', () => {
          console.log('Customer socket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emitToListeners('socket:connected', {});
          resolve();
        });

        this.socket?.on('connect_error', (error) => {
          console.error('Customer socket connection error:', error);
          this.isConnected = false;
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error('Failed to connect after multiple attempts'));
          }
        });

        this.socket?.on('disconnect', (reason) => {
          console.log('Customer socket disconnected:', reason);
          this.isConnected = false;
          this.emitToListeners('socket:disconnected', { reason });
        });
      });
    } catch (error) {
      console.error('Customer socket connection failed:', error);
      throw error;
    }
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Check if connected
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Join booking room for real-time updates
  joinBooking(bookingId: string): void {
    if (this.socket) {
      this.socket.emit('booking:join', { bookingId });
      console.log(`Joined booking room: ${bookingId}`);
    }
  }

  // Leave booking room
  leaveBooking(bookingId: string): void {
    if (this.socket) {
      this.socket.emit('booking:leave', { bookingId });
      console.log(`Left booking room: ${bookingId}`);
    }
  }

  // Request ETA update from driver
  requestETA(bookingId: string, driverId: string): void {
    if (this.socket) {
      this.socket.emit('location:request_eta', {
        bookingId,
        driverId
      });
    }
  }

  // Send chat message to driver
  sendChatMessage(receiverId: string, message: string, bookingId: string): void {
    if (this.socket) {
      this.getCurrentCustomerId().then(customerId => {
        const messageData: Omit<ChatMessage, 'id' | 'timestamp'> = {
          senderId: customerId,
          receiverId,
          message,
          bookingId,
          senderType: 'customer'
        };

        this.socket?.emit('chat:message_sent', messageData);
      });
    }
  }

  // Get current customer ID from storage
  private async getCurrentCustomerId(): Promise<string> {
    try {
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        return profile.id || 'anonymous';
      }
      return 'anonymous';
    } catch (error) {
      console.error('Error getting customer ID:', error);
      return 'anonymous';
    }
  }

  // Join chat conversation with driver
  joinChat(driverId: string): void {
    if (this.socket) {
      this.socket.emit('chat:join_conversation', { partnerId: driverId });
    }
  }

  // Leave chat conversation
  leaveChat(driverId: string): void {
    if (this.socket) {
      this.socket.emit('chat:leave_conversation', { partnerId: driverId });
    }
  }

  // Send typing indicator
  sendTypingIndicator(driverId: string, isTyping: boolean): void {
    if (this.socket) {
      this.socket.emit('chat:typing', { partnerId: driverId, isTyping });
    }
  }

  // Rate driver after completion
  rateDriver(bookingId: string, driverId: string, rating: number, feedback?: string): void {
    if (this.socket) {
      this.socket.emit('booking:rate_driver', {
        bookingId,
        driverId,
        rating,
        feedback
      });
    }
  }

  // Report issue with order
  reportIssue(bookingId: string, issueType: string, description: string): void {
    if (this.socket) {
      this.socket.emit('booking:report_issue', {
        bookingId,
        issueType,
        description,
        timestamp: new Date()
      });
    }
  }

  // Subscribe to events
  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Unsubscribe from events
  off(event: string, callback?: (...args: any[]) => void): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
      if (this.socket) {
        this.socket.off(event, callback);
      }
    } else {
      this.listeners.delete(event);
      if (this.socket) {
        this.socket.removeAllListeners(event);
      }
    }
  }

  // Setup event handlers
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Handle driver location updates
    this.socket.on('location:driver_update', (data: DriverLocationUpdate) => {
      console.log('Driver location update received:', data);
      this.emitToListeners('driver:location_update', data);
    });

    // Handle booking status changes
    this.socket.on('booking:status_changed', (data: OrderStatusUpdate) => {
      console.log('Booking status changed:', data);
      this.emitToListeners('booking:status_changed', data);
      
      // Show notification for important status changes
      this.handleStatusChangeNotification(data);
    });

    // Handle driver assignment
    this.socket.on('booking:driver_assigned', (data: any) => {
      console.log('Driver assigned:', data);
      this.emitToListeners('booking:driver_assigned', data);
      
      Alert.alert(
        'Driver Assigned',
        `${data.driverName} has been assigned to your booking`,
        [{ text: 'OK' }]
      );
    });

    // Handle driver arrival
    this.socket.on('booking:driver_arrived', (data: any) => {
      console.log('Driver arrived:', data);
      this.emitToListeners('driver:arrived', data);
      
      Alert.alert(
        'Driver Arrived',
        data.message || 'Your driver has arrived at the pickup location',
        [{ text: 'OK' }]
      );
    });

    // Handle ETA updates
    this.socket.on('location:eta_update', (data: any) => {
      console.log('ETA update received:', data);
      this.emitToListeners('booking:eta_update', data);
    });

    // Handle chat messages
    this.socket.on('chat:new_message', (data: ChatMessage) => {
      console.log('New chat message:', data);
      this.emitToListeners('chat:new_message', data);
    });

    // Handle typing indicators
    this.socket.on('chat:user_typing', (data: any) => {
      console.log('User typing:', data);
      this.emitToListeners('chat:typing', data);
    });

    // Handle connection events
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Customer socket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emitToListeners('socket:reconnected', { attemptNumber });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Customer socket reconnection attempt ${attemptNumber}`);
      this.emitToListeners('socket:reconnect_attempt', { attemptNumber });
    });

    this.socket.on('reconnect_failed', () => {
      console.log('Customer socket reconnection failed');
      this.emitToListeners('socket:reconnect_failed', {});
      
      Alert.alert(
        'Connection Failed',
        'Could not reconnect to the server. Please check your internet connection and try again.',
        [
          { text: 'Retry', onPress: () => this.connect() },
          { text: 'Cancel' }
        ]
      );
    });

    // Handle general errors
    this.socket.on('error', (error) => {
      console.error('Customer socket error:', error);
      this.emitToListeners('socket:error', { error });
    });

    // Handle booking completion
    this.socket.on('booking:completed', (data: any) => {
      console.log('Booking completed:', data);
      this.emitToListeners('booking:completed', data);
      
      Alert.alert(
        'Order Completed',
        'Your move has been completed successfully! Please rate your driver.',
        [{ text: 'Rate Driver', onPress: () => this.emitToListeners('show:rating_modal', data) }]
      );
    });
  }

  // Handle status change notifications
  private handleStatusChangeNotification(data: OrderStatusUpdate): void {
    const notificationMessages = {
      'assigned': 'A driver has been assigned to your booking',
      'pickup': 'Your driver is on the way to pickup location',
      'in_transit': 'Your items have been picked up and are in transit',
      'delivered': 'Your items have been delivered successfully!'
    };

    const message = notificationMessages[data.status as keyof typeof notificationMessages];
    if (message) {
      // This could be enhanced with push notifications
      console.log('Status notification:', message);
    }
  }

  // Emit events to all listeners
  private emitToListeners(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }

  // Get connection status
  getConnectionStatus(): { connected: boolean; reconnectAttempts: number } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Force reconnection
  async forceReconnect(): Promise<void> {
    this.disconnect();
    await this.connect();
  }
}

// Export singleton instance
export const customerSocketService = new CustomerSocketService();
export default customerSocketService;
