import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token management
let authToken: string | null = null;

const getAuthToken = async (): Promise<string | null> => {
  if (!authToken) {
    authToken = await AsyncStorage.getItem('authToken');
  }
  return authToken;
};

const setAuthToken = async (token: string): Promise<void> => {
  authToken = token;
  await AsyncStorage.setItem('authToken', token);
};

const clearAuthToken = async (): Promise<void> => {
  authToken = null;
  await AsyncStorage.removeItem('authToken');
};

// Request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearAuthToken();
      // TODO: Redirect to login
      console.log('Unauthorized access - token cleared');
    }
    return Promise.reject(error);
  }
);

// Enhanced Types
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  placeId?: string;
}

export interface ItemInventory {
  itemId: string;
  quantity: number;
  size?: string;
  customName?: string;
  notes?: string;
  images?: string[];
  estimatedVolume: number;
  estimatedWeight: number;
}

export interface BookingRequest {
  pickupLocation: Location;
  dropoffLocation: Location;
  vehicleClassId: string;
  scheduledDateTime: string;
  extraServices: ExtraServiceRequest[];
  items: ItemInventory[];
  notes?: string;
  customerInfo?: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface ExtraServiceRequest {
  serviceId: string;
  quantity: number;
  customValue?: number;
  priority?: 'low' | 'normal' | 'high';
}

export interface AdvancedPriceRequest {
  origin: Location;
  destination: Location;
  vehicleClassId: string;
  extraServices: ExtraServiceRequest[];
  scheduledDateTime: string;
  items?: ItemInventory[];
  customerProfile?: {
    tier: 'new' | 'regular' | 'premium' | 'vip';
    loyaltyScore: number;
    creditRating: 'poor' | 'fair' | 'good' | 'excellent';
    pastBookings: number;
  };
  routePreferences?: {
    avoidTolls: boolean;
    avoidHighways: boolean;
    preferScenicRoute: boolean;
    maximumDetour: number;
  };
}

export interface PriceBreakdown {
  baseFare: number;
  distanceMultiplier: number;
  timeFactors: number;
  demandSurcharge: number;
  fuelSurcharge: number;
  weatherSurcharge: number;
  extraServices: Array<{
    serviceId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  serviceFee: number;
  subtotal: number;
  taxes: number;
  discounts: number;
  total: number;
  confidence: number;
  validUntil: string;
}

export interface VehicleClass {
  id: string;
  name: string;
  description: string;
  capacity: number;
  maxWeight: number;
  basePrice: number;
  pricePerKm: number;
  icon: string;
  isActive: boolean;
}

export interface Booking {
  id: string;
  status: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  pickupLocation: Location;
  dropoffLocation: Location;
  scheduledDateTime: string;
  estimatedDuration: number;
  vehicle: VehicleClass;
  driver?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    avatar?: string;
  };
  priceBreakdown: PriceBreakdown;
  items: ItemInventory[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Enhanced API Service
export class RELOConnectAPI {
  // Authentication
  static async register(userData: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await api.post('/auth/register', userData);
    const { token } = response.data;
    await setAuthToken(token);
    return response.data;
  }

  static async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    const { token } = response.data;
    await setAuthToken(token);
    return response.data;
  }

  static async verifyOTP(data: {
    phone: string;
    code: string;
  }): Promise<AuthResponse> {
    const response = await api.post('/auth/verify-otp', data);
    const { token } = response.data;
    await setAuthToken(token);
    return response.data;
  }

  static async logout(): Promise<void> {
    await clearAuthToken();
    await api.post('/auth/logout');
  }

  // Pricing
  static async calculateAdvancedPrice(request: AdvancedPriceRequest): Promise<PriceBreakdown> {
    const response = await api.post('/pricing/calculate-advanced', request);
    return response.data;
  }

  static async getVehicleClasses(): Promise<VehicleClass[]> {
    const response = await api.get('/pricing/vehicle-classes');
    return response.data;
  }

  static async getExtraServices(): Promise<any[]> {
    const response = await api.get('/pricing/extra-services');
    return response.data;
  }

  // Bookings
  static async createBooking(bookingData: BookingRequest): Promise<Booking> {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  }

  static async getBookings(userId: string): Promise<Booking[]> {
    const response = await api.get(`/bookings/user/${userId}`);
    return response.data;
  }

  static async getBookingById(bookingId: string): Promise<Booking> {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  }

  static async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<Booking> {
    const response = await api.patch(`/bookings/${bookingId}`, updates);
    return response.data;
  }

  static async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    await api.post(`/bookings/${bookingId}/cancel`, { reason });
  }

  // Real-time tracking
  static async getDriverLocation(driverId: string): Promise<{
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
    timestamp: string;
  }> {
    const response = await api.get(`/tracking/driver/${driverId}/location`);
    return response.data;
  }

  // User profile
  static async getUserProfile(): Promise<User> {
    const response = await api.get('/users/profile');
    return response.data;
  }

  static async updateUserProfile(updates: Partial<User>): Promise<User> {
    const response = await api.patch('/users/profile', updates);
    return response.data;
  }

  // Payment
  static async createPaymentIntent(bookingId: string): Promise<{
    clientSecret: string;
    amount: number;
    currency: string;
  }> {
    const response = await api.post('/payments/create-intent', { bookingId });
    return response.data;
  }

  static async confirmPayment(paymentIntentId: string): Promise<{
    status: 'succeeded' | 'failed' | 'processing';
    bookingId: string;
  }> {
    const response = await api.post('/payments/confirm', { paymentIntentId });
    return response.data;
  }

  // Utility methods
  static async uploadImage(imageUri: string, type: 'item' | 'document' | 'avatar'): Promise<{
    url: string;
    filename: string;
  }> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: `${type}_${Date.now()}.jpg`,
    } as any);
    formData.append('type', type);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async getServiceAreas(): Promise<{
    id: string;
    name: string;
    boundaries: Array<{ lat: number; lng: number }>;
    isActive: boolean;
  }[]> {
    const response = await api.get('/service-areas');
    return response.data;
  }
}

// Error handling utility
export class APIError extends Error {
  public statusCode: number;
  public errorCode: string;

  constructor(message: string, statusCode: number, errorCode: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.name = 'APIError';
  }
}

// Export the enhanced API service
export default RELOConnectAPI;
