import realTimeService from './realTimeService';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: string;
  createdAt: string;
  preferences?: any;
}

interface LiveBooking {
  id: string;
  userId: string;
  serviceType: string;
  fromAddress: string;
  toAddress: string;
  scheduledDate: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  estimatedPrice: number;
  finalPrice?: number;
  driverId?: string;
  driver?: any;
  items?: any[];
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
  trackingEvents?: any[];
}

class LiveDataService {
  private baseURL = 'http://localhost:5000/api';
  private authToken: string | null = null;

  constructor() {
    // Try to restore auth token from storage
    this.restoreAuthToken();
  }

  private restoreAuthToken() {
    try {
      // In a real app, use SecureStore or AsyncStorage
      this.authToken = localStorage.getItem('authToken');
    } catch (error) {
      console.warn('Could not restore auth token:', error);
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ user: UserProfile; token: string }>> {
    const response = await this.makeRequest<{ user: UserProfile; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.token) {
      this.authToken = response.data.token;
      localStorage.setItem('authToken', this.authToken);
      
      // Join user room for real-time updates
      realTimeService.joinUserRoom(response.data.user.id);
    }

    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: UserProfile; token: string }>> {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    this.authToken = null;
    localStorage.removeItem('authToken');
    realTimeService.disconnect();
  }

  // User Profile
  async getUserProfile(): Promise<UserProfile> {
    const response = await this.makeRequest<UserProfile>('/users/profile');
    
    if (response.success && response.data) {
      return response.data;
    }

    // Fallback to mock data
    return {
      id: 'user_123',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0123',
      role: 'USER',
      createdAt: new Date().toISOString(),
    };
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Bookings
  async createBooking(bookingData: {
    serviceType: string;
    fromAddress: string;
    toAddress: string;
    scheduledDate: string;
    estimatedPrice: number;
    items?: any[];
    specialInstructions?: string;
  }): Promise<ApiResponse<LiveBooking>> {
    const response = await this.makeRequest<LiveBooking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });

    if (response.success && response.data) {
      // Start tracking this booking in real-time
      realTimeService.trackOrder(response.data.id);
    }

    return response;
  }

  async getUserBookings(): Promise<LiveBooking[]> {
    const response = await this.makeRequest<LiveBooking[]>('/bookings/user');
    
    if (response.success && response.data) {
      return response.data;
    }

    // Fallback to mock data
    return [
      {
        id: 'booking_123',
        userId: 'user_123',
        serviceType: 'Home Move',
        fromAddress: '123 Main St, City A, State 12345',
        toAddress: '456 Oak Ave, City B, State 67890',
        scheduledDate: '2025-01-15T10:00:00Z',
        status: 'in_progress',
        estimatedPrice: 1200,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        trackingEvents: [
          {
            id: '1',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'confirmed',
            description: 'Booking confirmed and assigned to driver',
            location: 'RELOConnect Hub',
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            status: 'pickup_started',
            description: 'Driver en route to pickup location',
            location: 'Main St, City A',
          },
        ],
      },
    ];
  }

  async getBookingById(id: string): Promise<LiveBooking | null> {
    const response = await this.makeRequest<LiveBooking>(`/bookings/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }

    return null;
  }

  // Pricing
  async calculatePrice(request: {
    serviceType: string;
    fromLocation: { latitude: number; longitude: number };
    toLocation: { latitude: number; longitude: number };
    scheduledDate: string;
    extraServices?: any;
  }): Promise<ApiResponse<{ basePrice: number; totalPrice: number; breakdown: any }>> {
    const response = await this.makeRequest('/pricing/calculate', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (response.success) {
      return response;
    }

    // Fallback to mock calculation
    const basePrice = request.serviceType === 'International Move' ? 2500 : 
                     request.serviceType === 'Office Move' ? 1800 :
                     request.serviceType === 'Specialty Items' ? 1200 : 1000;
    
    const distance = Math.random() * 500 + 50; // Mock distance
    const totalPrice = basePrice + (distance * 2);

    return {
      success: true,
      data: {
        basePrice,
        totalPrice: Math.round(totalPrice),
        breakdown: {
          baseService: basePrice,
          distance: distance * 2,
          extraServices: 0,
        },
      },
    };
  }

  // Real-time features
  subscribeToBookingUpdates(bookingId: string, callback: (update: any) => void) {
    realTimeService.on('bookingStatusUpdate', (data) => {
      if (data.bookingId === bookingId) {
        callback(data);
      }
    });

    // Start tracking
    realTimeService.trackOrder(bookingId);
  }

  subscribeToDriverLocation(driverId: string, callback: (location: any) => void) {
    realTimeService.on('driverLocationUpdate', (data) => {
      if (data.driverId === driverId) {
        callback(data);
      }
    });
  }

  // Chat
  async sendMessage(conversationId: string, message: string): Promise<ApiResponse> {
    const response = await this.makeRequest('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ conversationId, message }),
    });

    if (response.success) {
      // Also send via Socket.IO for real-time
      realTimeService.sendMessage(conversationId, message);
    }

    return response;
  }

  subscribeToMessages(conversationId: string, callback: (message: any) => void) {
    realTimeService.on('newMessage', (data) => {
      if (data.conversationId === conversationId) {
        callback(data);
      }
    });
  }

  // Utility
  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  getConnectionStatus(): string {
    return realTimeService.getConnectionStatus();
  }
}

// Singleton instance
const liveDataService = new LiveDataService();

export default liveDataService;
export type { UserProfile, LiveBooking, ApiResponse };
