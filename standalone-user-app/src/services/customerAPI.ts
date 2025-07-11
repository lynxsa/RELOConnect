// For now, let's use a fetch-based approach instead of axios to avoid dependency issues
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// API Configuration
const API_BASE_URL = __DEV__ ? 'http://localhost:5000' : 'https://api.reloconnect.com';
const API_TIMEOUT = 10000;

// Simple fetch wrapper with auth
class APIClient {
  public async getAuthHeaders(): Promise<HeadersInit> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
    } catch (error) {
      console.error('Error getting auth token:', error);
      return { 'Content-Type': 'application/json' };
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 401) {
      await AsyncStorage.removeItem('authToken');
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please log in again.',
        [{ text: 'OK' }]
      );
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const headers = await this.getAuthHeaders();
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    return this.handleResponse<T>(response);
  }
}

// Create API client instance
const apiClient = new APIClient();

// Types
export interface BookingDetails {
  id: string;
  status: 'confirmed' | 'assigned' | 'pickup' | 'in_transit' | 'delivered' | 'cancelled';
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverRating: number;
  vehicleType: string;
  vehicleNumber: string;
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  deliveryLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  scheduledDateTime: string;
  estimatedArrival?: string;
  eta?: number;
  distance?: number;
  totalPrice: number;
  items: any[];
  services: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  bookingId: string;
  senderType: 'customer' | 'driver';
  isRead: boolean;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  totalRides: number;
  profileImage?: string;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  experience: string;
  isOnline: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
}

export interface BookingRating {
  rating: number;
  feedback?: string;
  categories?: {
    punctuality: number;
    communication: number;
    carefulness: number;
    professionalism: number;
  };
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  totalBookings: number;
  memberSince: string;
  preferences: {
    notifications: boolean;
    smsUpdates: boolean;
    emailUpdates: boolean;
    preferredLanguage: string;
  };
}

// Customer API Service
class CustomerAPIService {
  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: CustomerProfile }> {
    try {
      const response = await apiClient.post<{ token: string; user: CustomerProfile }>('/auth/login', {
        email,
        password,
        userType: 'customer'
      });
      
      const { token, user } = response;
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userProfile', JSON.stringify(user));
      
      return { token, user };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  async register(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ token: string; user: CustomerProfile }> {
    try {
      const response = await apiClient.post<{ token: string; user: CustomerProfile }>('/auth/register', {
        ...userData,
        userType: 'customer'
      });
      
      const { token, user } = response;
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userProfile', JSON.stringify(user));
      
      return { token, user };
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(['authToken', 'userProfile']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Booking Management
  async getBookingDetails(bookingId: string): Promise<BookingDetails> {
    try {
      const response = await apiClient.get<BookingDetails>(`/bookings/${bookingId}`);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch booking details');
    }
  }

  async createBooking(bookingData: any): Promise<BookingDetails> {
    try {
      const response = await apiClient.post<BookingDetails>('/bookings', bookingData);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create booking');
    }
  }

  async updateBooking(bookingId: string, updates: Partial<BookingDetails>): Promise<BookingDetails> {
    try {
      const response = await apiClient.patch<BookingDetails>(`/bookings/${bookingId}`, updates);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update booking');
    }
  }

  async cancelBooking(bookingId: string, reason: string): Promise<void> {
    try {
      await apiClient.post('/bookings/' + bookingId + '/cancel', { reason });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to cancel booking');
    }
  }

  async getCustomerBookings(page: number = 1, limit: number = 10): Promise<{
    bookings: BookingDetails[];
    totalPages: number;
    currentPage: number;
    totalBookings: number;
  }> {
    try {
      const response = await apiClient.get<{
        bookings: BookingDetails[];
        totalPages: number;
        currentPage: number;
        totalBookings: number;
      }>('/bookings/customer', { page, limit });
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch bookings');
    }
  }

  // Driver Information
  async getDriverProfile(driverId: string): Promise<DriverProfile> {
    try {
      const response = await apiClient.get<DriverProfile>(`/drivers/${driverId}`);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch driver profile');
    }
  }

  async getDriverLocation(driverId: string): Promise<{
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    timestamp: string;
  }> {
    try {
      const response = await apiClient.get<{
        latitude: number;
        longitude: number;
        heading?: number;
        speed?: number;
        timestamp: string;
      }>(`/drivers/${driverId}/location`);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch driver location');
    }
  }

  // Chat and Communication
  async getChatMessages(bookingId: string, page: number = 1, limit: number = 50): Promise<{
    messages: ChatMessage[];
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const response = await apiClient.get<{
        messages: ChatMessage[];
        totalPages: number;
        currentPage: number;
      }>(`/chat/booking/${bookingId}`, { page, limit });
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch chat messages');
    }
  }

  async sendChatMessage(bookingId: string, driverId: string, message: string): Promise<ChatMessage> {
    try {
      const response = await apiClient.post<ChatMessage>('/chat/message', {
        bookingId,
        receiverId: driverId,
        message,
        senderType: 'customer'
      });
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send message');
    }
  }

  async markMessagesAsRead(bookingId: string): Promise<void> {
    try {
      await apiClient.patch(`/chat/booking/${bookingId}/read`);
    } catch (error: any) {
      console.error('Failed to mark messages as read:', error);
    }
  }

  // Ratings and Reviews
  async rateDriver(bookingId: string, driverId: string, rating: BookingRating): Promise<void> {
    try {
      await apiClient.post(`/bookings/${bookingId}/rate`, {
        driverId,
        ...rating
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to rate driver');
    }
  }

  async getDriverRatings(driverId: string): Promise<{
    averageRating: number;
    totalRatings: number;
    ratings: any[];
  }> {
    try {
      const response = await apiClient.get<{
        averageRating: number;
        totalRatings: number;
        ratings: any[];
      }>(`/drivers/${driverId}/ratings`);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch driver ratings');
    }
  }

  // Customer Profile
  async getCustomerProfile(): Promise<CustomerProfile> {
    try {
      const response = await apiClient.get<CustomerProfile>('/users/profile');
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch profile');
    }
  }

  async updateCustomerProfile(updates: Partial<CustomerProfile>): Promise<CustomerProfile> {
    try {
      const response = await apiClient.patch<CustomerProfile>('/users/profile', updates);
      await AsyncStorage.setItem('userProfile', JSON.stringify(response));
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  // Pricing and Quotes
  async getPriceQuote(bookingData: any): Promise<{
    basePrice: number;
    extraServices: any[];
    totalPrice: number;
    distance: number;
    estimatedDuration: number;
  }> {
    try {
      const response = await apiClient.post<{
        basePrice: number;
        extraServices: any[];
        totalPrice: number;
        distance: number;
        estimatedDuration: number;
      }>('/pricing/quote', bookingData);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get price quote');
    }
  }

  // ETA and Route Information
  async getETA(bookingId: string): Promise<{
    eta: number;
    distance: number;
    estimatedArrival: string;
    route?: any;
  }> {
    try {
      const response = await apiClient.get<{
        eta: number;
        distance: number;
        estimatedArrival: string;
        route?: any;
      }>(`/bookings/${bookingId}/eta`);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get ETA');
    }
  }

  async getRouteToCustomer(bookingId: string): Promise<{
    route: any;
    distance: number;
    duration: number;
  }> {
    try {
      const response = await apiClient.get<{
        route: any;
        distance: number;
        duration: number;
      }>(`/bookings/${bookingId}/route`);
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get route');
    }
  }

  // Support and Help
  async reportIssue(bookingId: string, issueType: string, description: string): Promise<void> {
    try {
      await apiClient.post('/support/report', {
        bookingId,
        issueType,
        description,
        userType: 'customer'
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to report issue');
    }
  }

  async getHelpArticles(): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>('/support/articles');
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch help articles');
    }
  }

  // Notifications
  async getNotifications(page: number = 1, limit: number = 20): Promise<{
    notifications: any[];
    totalPages: number;
    currentPage: number;
    unreadCount: number;
  }> {
    try {
      const response = await apiClient.get<{
        notifications: any[];
        totalPages: number;
        currentPage: number;
        unreadCount: number;
      }>('/notifications', { page, limit });
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch notifications');
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // Payments
  async getPaymentMethods(): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>('/payments/methods');
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch payment methods');
    }
  }

  async processPayment(bookingId: string, paymentMethodId: string): Promise<{
    paymentId: string;
    status: string;
    amount: number;
  }> {
    try {
      const response = await apiClient.post<{
        paymentId: string;
        status: string;
        amount: number;
      }>('/payments/process', {
        bookingId,
        paymentMethodId
      });
      return response;
    } catch (error: any) {
      throw new Error(error.message || 'Payment processing failed');
    }
  }

  // Utility methods
  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await apiClient.get<{ status: string }>('/health');
      return response.status === 'ok';
    } catch (error) {
      return false;
    }
  }

  async uploadFile(file: any, type: 'profile' | 'document' | 'issue'): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: await new APIClient().getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      return result.fileUrl;
    } catch (error: any) {
      throw new Error(error.message || 'File upload failed');
    }
  }
}

// Export singleton instance
export const customerAPI = new CustomerAPIService();
export default customerAPI;
