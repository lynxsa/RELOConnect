import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface DriverProfile {
  id: string;
  userId: string;
  vehicleId: string;
  licenseNumber: string;
  phoneNumber: string;
  isOnline: boolean;
  isAvailable: boolean;
  currentLatitude?: number;
  currentLongitude?: number;
  rating: number;
  totalRides: number;
  totalEarnings: number;
  vehicle: {
    id: string;
    type: string;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    capacity: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profileImageUrl?: string;
  };
}

export interface DriverOrder {
  id: string;
  customerId: string;
  driverId: string;
  status: 'assigned' | 'pickup' | 'in_transit' | 'delivered' | 'cancelled';
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
  estimatedPrice: number;
  actualPrice?: number;
  estimatedDuration: string;
  actualDuration?: string;
  distance: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    volume: number;
    weight: number;
    notes?: string;
  }>;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  driverNotes?: string;
}

export interface DriverEarnings {
  totalEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  completedOrders: number;
  averageRating: number;
  earnings: Array<{
    date: string;
    amount: number;
    orderId: string;
    customerName: string;
  }>;
}

export interface DriverStats {
  totalRides: number;
  totalEarnings: number;
  rating: number;
  completionRate: number;
  averageRating: number;
  hoursWorked: number;
  distanceTraveled: number;
}

class DriverAPIService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
    
    this.api = axios.create({
      baseURL: `${this.baseURL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('authToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting auth token:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          await AsyncStorage.removeItem('authToken');
          Alert.alert('Session Expired', 'Please log in again.');
          // Navigate to login screen
        } else if (error.response?.status >= 500) {
          Alert.alert('Server Error', 'Something went wrong. Please try again.');
        } else if (error.code === 'ECONNABORTED') {
          Alert.alert('Network Error', 'Request timeout. Please check your connection.');
        }
        return Promise.reject(error);
      }
    );
  }

  // Driver Profile Management
  async getDriverProfile(): Promise<DriverProfile> {
    try {
      const response: AxiosResponse<DriverProfile> = await this.api.get('/drivers/profile');
      return response.data;
    } catch (error) {
      console.error('Get driver profile error:', error);
      throw error;
    }
  }

  async updateDriverProfile(profileData: Partial<DriverProfile>): Promise<DriverProfile> {
    try {
      const response: AxiosResponse<DriverProfile> = await this.api.put('/drivers/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update driver profile error:', error);
      throw error;
    }
  }

  async updateDriverStatus(isOnline: boolean, isAvailable: boolean): Promise<void> {
    try {
      await this.api.put('/drivers/status', { isOnline, isAvailable });
    } catch (error) {
      console.error('Update driver status error:', error);
      throw error;
    }
  }

  async updateDriverLocation(latitude: number, longitude: number): Promise<void> {
    try {
      await this.api.put('/drivers/location', { latitude, longitude });
    } catch (error) {
      console.error('Update driver location error:', error);
      throw error;
    }
  }

  // Order Management
  async getAssignedOrders(): Promise<DriverOrder[]> {
    try {
      const response: AxiosResponse<DriverOrder[]> = await this.api.get('/drivers/orders/assigned');
      return response.data;
    } catch (error) {
      console.error('Get assigned orders error:', error);
      throw error;
    }
  }

  async getActiveOrder(): Promise<DriverOrder | null> {
    try {
      const response: AxiosResponse<DriverOrder> = await this.api.get('/drivers/orders/active');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No active order
      }
      console.error('Get active order error:', error);
      throw error;
    }
  }

  async getOrderHistory(page: number = 1, limit: number = 20): Promise<{
    orders: DriverOrder[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const response = await this.api.get(`/drivers/orders/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get order history error:', error);
      throw error;
    }
  }

  async acceptOrder(orderId: string): Promise<void> {
    try {
      await this.api.post(`/drivers/orders/${orderId}/accept`);
    } catch (error) {
      console.error('Accept order error:', error);
      throw error;
    }
  }

  async declineOrder(orderId: string, reason?: string): Promise<void> {
    try {
      await this.api.post(`/drivers/orders/${orderId}/decline`, { reason });
    } catch (error) {
      console.error('Decline order error:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: DriverOrder['status'], notes?: string): Promise<void> {
    try {
      await this.api.put(`/drivers/orders/${orderId}/status`, { status, notes });
    } catch (error) {
      console.error('Update order status error:', error);
      throw error;
    }
  }

  async completeOrder(orderId: string, completionData: {
    actualPrice?: number;
    actualDuration?: string;
    driverNotes?: string;
    customerSignature?: string;
  }): Promise<void> {
    try {
      await this.api.post(`/drivers/orders/${orderId}/complete`, completionData);
    } catch (error) {
      console.error('Complete order error:', error);
      throw error;
    }
  }

  // Earnings and Statistics
  async getDriverEarnings(period: 'today' | 'week' | 'month' | 'all' = 'all'): Promise<DriverEarnings> {
    try {
      const response: AxiosResponse<DriverEarnings> = await this.api.get(`/drivers/earnings?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Get driver earnings error:', error);
      throw error;
    }
  }

  async getDriverStats(): Promise<DriverStats> {
    try {
      const response: AxiosResponse<DriverStats> = await this.api.get('/drivers/stats');
      return response.data;
    } catch (error) {
      console.error('Get driver stats error:', error);
      throw error;
    }
  }

  // Chat and Communication
  async getOrderMessages(orderId: string): Promise<any[]> {
    try {
      const response = await this.api.get(`/chat/orders/${orderId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Get order messages error:', error);
      throw error;
    }
  }

  async sendOrderMessage(orderId: string, message: string): Promise<void> {
    try {
      await this.api.post(`/chat/orders/${orderId}/messages`, { message });
    } catch (error) {
      console.error('Send order message error:', error);
      throw error;
    }
  }

  // Vehicle Management
  async getDriverVehicles(): Promise<any[]> {
    try {
      const response = await this.api.get('/drivers/vehicles');
      return response.data;
    } catch (error) {
      console.error('Get driver vehicles error:', error);
      throw error;
    }
  }

  async updateActiveVehicle(vehicleId: string): Promise<void> {
    try {
      await this.api.put('/drivers/vehicle', { vehicleId });
    } catch (error) {
      console.error('Update active vehicle error:', error);
      throw error;
    }
  }

  // Documents and Verification
  async uploadDocument(documentType: string, fileUri: string): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('document', {
        uri: fileUri,
        type: 'image/jpeg',
        name: `${documentType}_${Date.now()}.jpg`,
      } as any);
      formData.append('documentType', documentType);

      await this.api.post('/drivers/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  }

  async getVerificationStatus(): Promise<{
    isVerified: boolean;
    pendingDocuments: string[];
    verificationStatus: 'pending' | 'verified' | 'rejected';
  }> {
    try {
      const response = await this.api.get('/drivers/verification');
      return response.data;
    } catch (error) {
      console.error('Get verification status error:', error);
      throw error;
    }
  }

  // Notifications
  async getNotifications(): Promise<any[]> {
    try {
      const response = await this.api.get('/drivers/notifications');
      return response.data;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    try {
      await this.api.put(`/drivers/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Mark notification read error:', error);
      throw error;
    }
  }

  // Route optimization
  async getOptimizedRoute(pickupLocation: { latitude: number; longitude: number }, deliveryLocation: { latitude: number; longitude: number }): Promise<{
    route: Array<{ latitude: number; longitude: number }>;
    distance: number;
    duration: string;
    estimatedFuel: number;
  }> {
    try {
      const response = await this.api.post('/drivers/route/optimize', {
        pickupLocation,
        deliveryLocation,
      });
      return response.data;
    } catch (error) {
      console.error('Get optimized route error:', error);
      throw error;
    }
  }

  // Incident reporting
  async reportIncident(orderId: string, incidentData: {
    type: string;
    description: string;
    location?: { latitude: number; longitude: number };
    images?: string[];
  }): Promise<void> {
    try {
      await this.api.post(`/drivers/orders/${orderId}/incidents`, incidentData);
    } catch (error) {
      console.error('Report incident error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const driverAPI = new DriverAPIService();
export default driverAPI;
