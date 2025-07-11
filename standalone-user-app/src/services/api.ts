import axios, { AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = null; // TODO: Get from storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      console.log('Unauthorized access - redirecting to login');
    }
    return Promise.reject(error);
  }
);

// Types
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ExtraServices {
  loading?: boolean;
  loadingPeople?: number;
  stairs?: number;
  packing?: boolean;
  cleaning?: boolean;
  express?: boolean;
  insurance?: boolean;
  insuranceValue?: number;
  waitingTime?: number;
}

export interface PriceEstimateRequest {
  distance?: number;
  vehicleClassId: string;
  extraServices: ExtraServices;
  pickupLocation?: Location;
  dropoffLocation?: Location;
}

export interface PriceBreakdown {
  baseFare: number;
  extraServicesFees: Record<string, number>;
  subtotal: number;
  vat: number;
  total: number;
  breakdown: {
    service: string;
    amount: number;
  }[];
}

export interface PriceEstimateResponse {
  distance: number;
  priceBreakdown: PriceBreakdown;
}

export interface VehicleClass {
  id: string;
  name: string;
  description: string;
  baseCapacity: number;
  order: number;
  isActive: boolean;
}

export interface DistanceBand {
  id: string;
  label: string;
  minKm: number;
  maxKm: number | null;
}

export interface ExtraService {
  id: string;
  name: string;
  description: string;
  type: 'flat' | 'per_unit' | 'percentage';
  price: number;
  unit?: string;
  isActive: boolean;
}

export interface PriceTableRow {
  id: string;
  distanceBand: string;
  [vehicleClassName: string]: any;
}

// API Functions
export const pricingApi = {
  // Get all vehicle classes
  getVehicleClasses: async (): Promise<VehicleClass[]> => {
    try {
      const response: AxiosResponse<VehicleClass[]> = await api.get('/pricing/vehicle-classes');
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle classes:', error);
      throw new Error('Failed to fetch vehicle classes');
    }
  },

  // Get all distance bands
  getDistanceBands: async (): Promise<DistanceBand[]> => {
    try {
      const response: AxiosResponse<DistanceBand[]> = await api.get('/pricing/distance-bands');
      return response.data;
    } catch (error) {
      console.error('Error fetching distance bands:', error);
      throw new Error('Failed to fetch distance bands');
    }
  },

  // Get all extra services
  getExtraServices: async (): Promise<ExtraService[]> => {
    try {
      const response: AxiosResponse<ExtraService[]> = await api.get('/pricing/extra-services');
      return response.data;
    } catch (error) {
      console.error('Error fetching extra services:', error);
      throw new Error('Failed to fetch extra services');
    }
  },

  // Get complete price table
  getPriceTable: async (): Promise<PriceTableRow[]> => {
    try {
      const response: AxiosResponse<PriceTableRow[]> = await api.get('/pricing/price-table');
      return response.data;
    } catch (error) {
      console.error('Error fetching price table:', error);
      throw new Error('Failed to fetch price table');
    }
  },

  // Calculate price estimate
  calculateEstimate: async (request: PriceEstimateRequest): Promise<PriceEstimateResponse> => {
    try {
      const response: AxiosResponse<PriceEstimateResponse> = await api.post('/pricing/estimate', request);
      return response.data;
    } catch (error: any) {
      console.error('Error calculating price estimate:', error);
      
      if (error.response?.data?.requiresCustomQuote) {
        throw new Error('This distance requires a custom quote. Please contact us for pricing.');
      }
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error('Failed to calculate price estimate');
    }
  },
};

// Booking API
export interface BookingRequest {
  pickupLocation: Location;
  dropoffLocation: Location;
  vehicleClassId: string;
  extraServices: ExtraServices;
  scheduledDate: string;
  notes?: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface Booking {
  id: string;
  status: 'pending' | 'confirmed' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  pickupLocation: Location;
  dropoffLocation: Location;
  scheduledDate: string;
  estimatedPrice: number;
  finalPrice?: number;
  vehicleClass: VehicleClass;
  extraServices: ExtraServices;
  driverId?: string;
  trackingId: string;
  createdAt: string;
  updatedAt: string;
}

export const bookingApi = {
  // Create a new booking
  createBooking: async (request: BookingRequest): Promise<Booking> => {
    try {
      const response: AxiosResponse<Booking> = await api.post('/bookings', request);
      return response.data;
    } catch (error: any) {
      console.error('Error creating booking:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error('Failed to create booking');
    }
  },

  // Get user's bookings
  getUserBookings: async (): Promise<Booking[]> => {
    try {
      const response: AxiosResponse<Booking[]> = await api.get('/bookings/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw new Error('Failed to fetch bookings');
    }
  },

  // Get booking by ID
  getBookingById: async (id: string): Promise<Booking> => {
    try {
      const response: AxiosResponse<Booking> = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw new Error('Failed to fetch booking');
    }
  },

  // Cancel booking
  cancelBooking: async (id: string): Promise<Booking> => {
    try {
      const response: AxiosResponse<Booking> = await api.post(`/bookings/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw new Error('Failed to cancel booking');
    }
  },
};

// Authentication API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  token: string;
}

export const authApi = {
  // Login
  login: async (request: LoginRequest): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', request);
      return response.data;
    } catch (error: any) {
      console.error('Error during login:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error('Failed to login');
    }
  },

  // Register
  register: async (request: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', request);
      return response.data;
    } catch (error: any) {
      console.error('Error during registration:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error('Failed to register');
    }
  },

  // Verify OTP
  verifyOTP: async (email: string, otp: string): Promise<AuthResponse> => {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/auth/verify-otp', { email, otp });
      return response.data;
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error('Failed to verify OTP');
    }
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    try {
      const response: AxiosResponse<{ message: string }> = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw new Error('Failed to send password reset');
    }
  },
};

// Google Maps API for address geocoding and route calculation
export interface GeocodeResult {
  address: string;
  latitude: number;
  longitude: number;
  placeId: string;
  components: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface RouteResult {
  distance: number; // in kilometers
  duration: number; // in minutes
  polyline: string;
  steps: {
    instruction: string;
    distance: number;
    duration: number;
  }[];
}

export const mapsApi = {
  // Geocode address to coordinates
  geocodeAddress: async (address: string): Promise<GeocodeResult[]> => {
    try {
      // This would typically use Google Maps Geocoding API
      // For now, return mock data
      return [
        {
          address: address,
          latitude: -33.9249,
          longitude: 18.4241,
          placeId: 'mock-place-id',
          components: {
            street: 'Main Street',
            city: 'Cape Town',
            state: 'Western Cape',
            postalCode: '8001',
            country: 'South Africa',
          },
        },
      ];
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw new Error('Failed to geocode address');
    }
  },

  // Calculate route between two points
  calculateRoute: async (
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number }
  ): Promise<RouteResult> => {
    try {
      // This would typically use Google Maps Directions API
      // For now, return mock data
      const distance = Math.sqrt(
        Math.pow(destination.latitude - origin.latitude, 2) +
        Math.pow(destination.longitude - origin.longitude, 2)
      ) * 111; // Rough conversion to km
      
      return {
        distance,
        duration: distance * 1.5, // Rough estimate
        polyline: 'mock-polyline-data',
        steps: [
          {
            instruction: 'Head towards destination',
            distance: distance,
            duration: distance * 1.5,
          },
        ],
      };
    } catch (error) {
      console.error('Error calculating route:', error);
      throw new Error('Failed to calculate route');
    }
  },
};

export default api;
