import { Socket, io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  type: 'TEXT' | 'IMAGE' | 'LOCATION' | 'SYSTEM';
  read: boolean;
  createdAt: string;
  bookingId?: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  booking?: {
    id: string;
    pickupAddress: string;
    dropoffAddress: string;
    status: string;
  };
}

export interface Conversation {
  partnerId: string;
  partner: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  latestMessage: ChatMessage;
  unreadCount: number;
  booking?: {
    id: string;
    pickupAddress: string;
    dropoffAddress: string;
    status: string;
  };
}

export interface TypingStatus {
  userId: string;
  receiverId: string;
  bookingId?: string;
}

export interface OnlineStatus {
  userId: string;
  timestamp: string;
}

interface ChatEventHandlers {
  onNewMessage?: (message: ChatMessage) => void;
  onMessageSent?: (data: { messageId: string; timestamp: string }) => void;
  onMessagesRead?: (data: { readerId: string; count: number; bookingId?: string }) => void;
  onUserTyping?: (data: TypingStatus) => void;
  onUserStoppedTyping?: (data: TypingStatus) => void;
  onUserOnline?: (data: OnlineStatus) => void;
  onUserOffline?: (data: OnlineStatus) => void;
  onBookingMessage?: (message: ChatMessage) => void;
  onBookingUpdate?: (data: { bookingId: string; type: string; data: any; timestamp: string }) => void;
  onConnectionChange?: (connected: boolean) => void;
  onError?: (error: string) => void;
}

class MobileChatService {
  private socket: Socket | null = null;
  private eventHandlers: ChatEventHandlers = {};
  private isConnected = false;
  private userId: string | null = null;
  private authToken: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private typingTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

  constructor() {
    this.initializeService();
  }

  private async initializeService() {
    // Load persisted auth token
    try {
      this.authToken = await AsyncStorage.getItem('authToken');
      this.userId = await AsyncStorage.getItem('userId');
    } catch (error) {
      console.error('Failed to load auth data:', error);
    }
  }

  // Initialize connection
  async connect(authToken?: string, userId?: string): Promise<void> {
    if (authToken) {
      this.authToken = authToken;
      await AsyncStorage.setItem('authToken', authToken);
    }

    if (userId) {
      this.userId = userId;
      await AsyncStorage.setItem('userId', userId);
    }

    if (!this.authToken) {
      throw new Error('Authentication token required');
    }

    const serverUrl = Platform.OS === 'ios' 
      ? 'http://localhost:3001' 
      : 'http://10.0.2.2:3001';

    this.socket = io(serverUrl, {
      auth: {
        token: this.authToken,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.eventHandlers.onConnectionChange?.(true);

      // Authenticate after connection
      if (this.authToken) {
        this.socket?.emit('authenticate', this.authToken);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      this.isConnected = false;
      this.eventHandlers.onConnectionChange?.(false);
      this.attemptReconnect();
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Chat connection error:', error);
      this.isConnected = false;
      this.eventHandlers.onConnectionChange?.(false);
      this.attemptReconnect();
    });

    // Authentication events
    this.socket.on('authenticated', (data: { userId: string; status: string }) => {
      console.log('Chat authentication successful:', data);
      this.userId = data.userId;
    });

    this.socket.on('auth_error', (data: { message: string }) => {
      console.error('Chat authentication error:', data.message);
      this.eventHandlers.onError?.(data.message);
    });

    // Chat events
    this.socket.on('new_message', (message: ChatMessage) => {
      this.eventHandlers.onNewMessage?.(message);
    });

    this.socket.on('message_sent', (data: { messageId: string; timestamp: string }) => {
      this.eventHandlers.onMessageSent?.(data);
    });

    this.socket.on('messages_read', (data: { readerId: string; count: number; bookingId?: string }) => {
      this.eventHandlers.onMessagesRead?.(data);
    });

    this.socket.on('user_typing', (data: TypingStatus) => {
      this.eventHandlers.onUserTyping?.(data);
    });

    this.socket.on('user_stopped_typing', (data: TypingStatus) => {
      this.eventHandlers.onUserStoppedTyping?.(data);
    });

    this.socket.on('user_online', (data: OnlineStatus) => {
      this.eventHandlers.onUserOnline?.(data);
    });

    this.socket.on('user_offline', (data: OnlineStatus) => {
      this.eventHandlers.onUserOffline?.(data);
    });

    this.socket.on('booking_message', (message: ChatMessage) => {
      this.eventHandlers.onBookingMessage?.(message);
    });

    this.socket.on('booking_update', (data: { bookingId: string; type: string; data: any; timestamp: string }) => {
      this.eventHandlers.onBookingUpdate?.(data);
    });

    this.socket.on('joined_booking', (data: { bookingId: string }) => {
      console.log(`Joined booking room: ${data.bookingId}`);
    });

    this.socket.on('error', (data: { message: string }) => {
      console.error('Chat error:', data.message);
      this.eventHandlers.onError?.(data.message);
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      if (this.authToken && this.userId) {
        this.connect();
      }
    }, delay);
  }

  // Event handler management
  setEventHandlers(handlers: ChatEventHandlers) {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  removeEventHandlers() {
    this.eventHandlers = {};
  }

  // Chat operations
  async sendMessage(
    receiverId: string,
    message: string,
    type: 'TEXT' | 'IMAGE' | 'LOCATION' | 'SYSTEM' = 'TEXT',
    bookingId?: string
  ): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to chat server');
    }

    this.socket.emit('send_message', {
      receiverId,
      message,
      type,
      bookingId,
    });
  }

  async joinBooking(bookingId: string): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to chat server');
    }

    this.socket.emit('join_booking', { bookingId });
  }

  async markMessagesAsRead(partnerId: string, bookingId?: string): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to chat server');
    }

    this.socket.emit('mark_messages_read', { partnerId, bookingId });
  }

  async startTyping(receiverId: string, bookingId?: string): Promise<void> {
    if (!this.socket || !this.isConnected) {
      return;
    }

    // Clear existing timeout for this receiver
    const timeoutKey = `${receiverId}_${bookingId || 'general'}`;
    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey)!);
    }

    this.socket.emit('typing_start', { receiverId, bookingId });

    // Auto-stop typing after 3 seconds
    const timeout = setTimeout(() => {
      this.stopTyping(receiverId, bookingId);
    }, 3000);

    this.typingTimeouts.set(timeoutKey, timeout);
  }

  async stopTyping(receiverId: string, bookingId?: string): Promise<void> {
    if (!this.socket || !this.isConnected) {
      return;
    }

    const timeoutKey = `${receiverId}_${bookingId || 'general'}`;
    if (this.typingTimeouts.has(timeoutKey)) {
      clearTimeout(this.typingTimeouts.get(timeoutKey)!);
      this.typingTimeouts.delete(timeoutKey);
    }

    this.socket.emit('typing_stop', { receiverId, bookingId });
  }

  async getOnlineUsers(): Promise<void> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to chat server');
    }

    this.socket.emit('get_online_users');
  }

  // Connection management
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.reconnectAttempts = 0;
    
    // Clear all typing timeouts
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
  }

  // Getters
  get connected(): boolean {
    return this.isConnected;
  }

  get currentUserId(): string | null {
    return this.userId;
  }

  // Message location helpers
  async sendLocationMessage(
    receiverId: string,
    latitude: number,
    longitude: number,
    address?: string,
    bookingId?: string
  ): Promise<void> {
    const locationMessage = address 
      ? `📍 Location: ${address} (${latitude}, ${longitude})`
      : `📍 Location: ${latitude}, ${longitude}`;

    await this.sendMessage(receiverId, locationMessage, 'LOCATION', bookingId);
  }

  // Utility methods
  async clearStoredData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['authToken', 'userId']);
      this.authToken = null;
      this.userId = null;
    } catch (error) {
      console.error('Failed to clear stored data:', error);
    }
  }

  // Status methods
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      userId: this.userId,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Create singleton instance
const mobileChatService = new MobileChatService();

export default mobileChatService;
