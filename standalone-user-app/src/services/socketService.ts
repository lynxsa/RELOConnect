import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Socket configuration
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';

interface SocketEvents {
  // Driver location updates
  'driver:location-update': (data: {
    driverId: string;
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
    timestamp: string;
  }) => void;

  // Booking status updates
  'booking:status-update': (data: {
    bookingId: string;
    status: string;
    message?: string;
    estimatedArrival?: string;
  }) => void;

  // Driver assignment
  'booking:driver-assigned': (data: {
    bookingId: string;
    driver: {
      id: string;
      name: string;
      phone: string;
      avatar?: string;
      rating: number;
      vehicle: {
        make: string;
        model: string;
        color: string;
        licensePlate: string;
      };
    };
  }) => void;

  // Real-time messages
  'message:new': (data: {
    id: string;
    bookingId: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: string;
    type: 'text' | 'image' | 'location';
  }) => void;

  // Price updates
  'price:update': (data: {
    bookingId: string;
    newPricing: any;
    reason: string;
  }) => void;

  // System notifications
  'notification:new': (data: {
    id: string;
    title: string;
    body: string;
    type: 'booking' | 'payment' | 'promotion' | 'system';
    data?: any;
  }) => void;
}

export class RELOConnectSocket {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeSocket();
  }

  private async initializeSocket() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      this.socket = io(SOCKET_URL, {
        auth: {
          token,
        },
        transports: ['websocket'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection:established');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
      this.emit('connection:lost', { reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      this.emit('connection:error', { error, attempt: this.reconnectAttempts });
    });

    // Set up event forwarding
    this.socket.onAny((eventName, ...args) => {
      this.emit(eventName, args[0]);
    });
  }

  // Connection management
  public async connect(): Promise<void> {
    if (this.socket && !this.isConnected) {
      const token = await AsyncStorage.getItem('authToken');
      this.socket.auth = { token };
      this.socket.connect();
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Event handling
  public on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (!listeners) return;

    if (callback) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.set(event, []);
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Booking-specific methods
  public joinBookingRoom(bookingId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('booking:join', { bookingId });
    }
  }

  public leaveBookingRoom(bookingId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('booking:leave', { bookingId });
    }
  }

  // Driver tracking
  public subscribeToDriverLocation(driverId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('driver:subscribe-location', { driverId });
    }
  }

  public unsubscribeFromDriverLocation(driverId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('driver:unsubscribe-location', { driverId });
    }
  }

  // Messaging
  public sendMessage(bookingId: string, message: string, type: 'text' | 'image' | 'location' = 'text'): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('message:send', {
        bookingId,
        message,
        type,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Location sharing
  public shareLocation(bookingId: string, location: { latitude: number; longitude: number }): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('location:share', {
        bookingId,
        location,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // User presence
  public updateUserStatus(status: 'online' | 'offline' | 'busy'): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('user:status-update', { status });
    }
  }

  // Notifications
  public markNotificationAsRead(notificationId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('notification:mark-read', { notificationId });
    }
  }
}

// React Hook for Socket Integration
import { useEffect, useRef, useState } from 'react';

export function useRELOSocket() {
  const socketRef = useRef<RELOConnectSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize socket
    socketRef.current = new RELOConnectSocket();

    // Listen for connection events
    socketRef.current.on('connection:established' as any, () => {
      setIsConnected(true);
      setConnectionError(null);
    });

    socketRef.current.on('connection:lost' as any, () => {
      setIsConnected(false);
    });

    socketRef.current.on('connection:error' as any, (data: any) => {
      setConnectionError(data.error.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
  };
}

// Export singleton instance
export const reloSocket = new RELOConnectSocket();
