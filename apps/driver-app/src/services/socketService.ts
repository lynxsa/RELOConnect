import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface DriverLocationUpdate {
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  timestamp: Date;
}

export interface OrderUpdate {
  bookingId: string;
  status: 'assigned' | 'pickup' | 'in_transit' | 'delivered' | 'cancelled';
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
  bookingId?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

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
        reconnectionAttempts: 5,
        transports: ['websocket']
      });

      this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        this.socket?.on('connect', () => {
          console.log('Socket connected');
          this.isConnected = true;
          this.markDriverOnline();
          resolve();
        });

        this.socket?.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        this.socket?.on('disconnect', () => {
          console.log('Socket disconnected');
          this.isConnected = false;
        });
      });
    } catch (error) {
      console.error('Socket connection failed:', error);
      throw error;
    }
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.markDriverOffline();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Check if connected
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Mark driver as online
  markDriverOnline(): void {
    if (this.socket) {
      this.socket.emit('driver:online');
    }
  }

  // Mark driver as offline
  markDriverOffline(): void {
    if (this.socket) {
      this.socket.emit('driver:offline');
    }
  }

  // Update driver location
  updateLocation(location: Omit<DriverLocationUpdate, 'timestamp'>, bookingId?: string): void {
    if (this.socket) {
      this.socket.emit('location:update', {
        latitude: location.latitude,
        longitude: location.longitude,
        bookingId: bookingId
      });
    }
  }

  // Update order status
  updateOrderStatus(bookingId: string, status: OrderUpdate['status']): void {
    if (this.socket) {
      this.socket.emit('booking:status_update', {
        bookingId,
        status
      });
    }
  }

  // Join booking room for real-time updates
  joinBooking(bookingId: string): void {
    if (this.socket) {
      this.socket.emit('booking:join', { bookingId });
    }
  }

  // Leave booking room
  leaveBooking(bookingId: string): void {
    if (this.socket) {
      this.socket.emit('booking:leave', { bookingId });
    }
  }

  // Send arrival notification
  sendArrivalNotification(bookingId: string, customerId: string): void {
    if (this.socket) {
      this.socket.emit('booking:arrival_notification', {
        bookingId,
        customerId
      });
    }
  }

  // Send chat message
  sendChatMessage(receiverId: string, message: string, bookingId?: string): void {
    if (this.socket) {
      const messageData: ChatMessage = {
        id: Date.now().toString(),
        senderId: 'current_driver_id', // This should be the actual driver ID
        receiverId,
        message,
        timestamp: new Date(),
        bookingId
      };

      this.socket.emit('chat:message_sent', messageData);
    }
  }

  // Join chat conversation
  joinChat(partnerId: string): void {
    if (this.socket) {
      this.socket.emit('chat:join_conversation', { partnerId });
    }
  }

  // Leave chat conversation
  leaveChat(partnerId: string): void {
    if (this.socket) {
      this.socket.emit('chat:leave_conversation', { partnerId });
    }
  }

  // Send typing indicator
  sendTypingIndicator(partnerId: string, isTyping: boolean): void {
    if (this.socket) {
      this.socket.emit('chat:typing', { partnerId, isTyping });
    }
  }

  // Request ETA update
  requestETA(bookingId: string, customerId: string): void {
    if (this.socket) {
      this.socket.emit('location:request_eta', { bookingId, customerId });
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

    // Handle booking assignments
    this.socket.on('booking:driver_assigned', (data) => {
      console.log('New booking assigned:', data);
      this.emitToListeners('booking:assigned', data);
    });

    // Handle location updates
    this.socket.on('location:driver_update', (data) => {
      console.log('Driver location updated:', data);
      this.emitToListeners('location:updated', data);
    });

    // Handle booking status changes
    this.socket.on('booking:status_changed', (data) => {
      console.log('Booking status changed:', data);
      this.emitToListeners('booking:status_changed', data);
    });

    // Handle chat messages
    this.socket.on('chat:new_message', (data) => {
      console.log('New chat message:', data);
      this.emitToListeners('chat:message_received', data);
    });

    // Handle typing indicators
    this.socket.on('chat:user_typing', (data) => {
      console.log('User typing:', data);
      this.emitToListeners('chat:typing', data);
    });

    // Handle ETA updates
    this.socket.on('location:eta_update', (data) => {
      console.log('ETA updated:', data);
      this.emitToListeners('location:eta_updated', data);
    });

    // Handle driver status changes
    this.socket.on('driver:status_changed', (data) => {
      console.log('Driver status changed:', data);
      this.emitToListeners('driver:status_changed', data);
    });

    // Handle connection errors
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      Alert.alert('Connection Error', 'Lost connection to server. Attempting to reconnect...');
    });

    // Handle reconnection
    this.socket.on('reconnect', () => {
      console.log('Socket reconnected');
      this.isConnected = true;
      this.markDriverOnline();
      this.emitToListeners('socket:reconnected', {});
    });

    // Handle reconnection attempts
    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
    });

    // Handle reconnection failure
    this.socket.on('reconnect_failed', () => {
      console.log('Reconnection failed');
      Alert.alert('Connection Failed', 'Could not reconnect to server. Please check your internet connection.');
    });
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
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
