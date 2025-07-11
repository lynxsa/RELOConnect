import io from 'socket.io-client';

class RealTimeService {
  private socket: any;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    if (this.connectionStatus !== 'disconnected') return;

    this.connectionStatus = 'connecting';
    
    try {
      this.socket = io('http://localhost:5000', {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket.IO connected to backend');
        this.connectionStatus = 'connected';
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket.IO disconnected from backend');
        this.connectionStatus = 'disconnected';
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('Socket.IO connection error:', error);
        this.connectionStatus = 'disconnected';
      });

      // User-specific events
      this.socket.on('bookingStatusUpdate', (data: any) => {
        this.emit('bookingStatusUpdate', data);
      });

      this.socket.on('driverLocationUpdate', (data: any) => {
        this.emit('driverLocationUpdate', data);
      });

      this.socket.on('newMessage', (data: any) => {
        this.emit('newMessage', data);
      });

      // Driver-specific events
      this.socket.on('newOrderAvailable', (data: any) => {
        this.emit('newOrderAvailable', data);
      });

      this.socket.on('orderCancelled', (data: any) => {
        this.emit('orderCancelled', data);
      });

    } catch (error) {
      console.error('Failed to initialize Socket.IO connection:', error);
      this.connectionStatus = 'disconnected';
    }
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // User actions
  joinUserRoom(userId: string) {
    if (this.isConnected()) {
      this.socket.emit('joinUserRoom', { userId });
    }
  }

  trackOrder(orderId: string) {
    if (this.isConnected()) {
      this.socket.emit('trackOrder', { orderId });
    }
  }

  sendMessage(conversationId: string, message: string) {
    if (this.isConnected()) {
      this.socket.emit('sendMessage', { conversationId, message });
    }
  }

  // Driver actions
  joinDriverRoom(driverId: string) {
    if (this.isConnected()) {
      this.socket.emit('joinDriverRoom', { driverId });
    }
  }

  updateDriverLocation(location: { latitude: number; longitude: number; heading?: number }) {
    if (this.isConnected()) {
      this.socket.emit('updateDriverLocation', location);
    }
  }

  updateOrderStatus(orderId: string, status: string, location?: any) {
    if (this.isConnected()) {
      this.socket.emit('updateOrderStatus', { orderId, status, location });
    }
  }

  acceptOrder(orderId: string) {
    if (this.isConnected()) {
      this.socket.emit('acceptOrder', { orderId });
    }
  }

  // Connection status
  isConnected(): boolean {
    return this.connectionStatus === 'connected' && this.socket?.connected;
  }

  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  // Cleanup
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionStatus = 'disconnected';
    this.listeners.clear();
  }

  // Reconnect
  reconnect() {
    this.disconnect();
    setTimeout(() => {
      this.initializeConnection();
    }, 1000);
  }
}

// Singleton instance
const realTimeService = new RealTimeService();

export default realTimeService;
