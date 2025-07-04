import axios, { AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base configuration
const BASE_URL = __DEV__ ? 'http://localhost:3001' : 'https://your-production-api.com';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'USER' | 'DRIVER' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface BookingData {
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  scheduledDateTime: string;
  vehicleType: 'van' | 'truck' | 'pickup' | 'motorcycle';
  estimatedDistance: number;
  estimatedDuration: number;
  packageDetails: {
    description: string;
    weight?: number;
    volume?: number;
    fragile: boolean;
    valuable: boolean;
  };
  extraServices: {
    loading: boolean;
    stairs: number;
    packing: boolean;
    cleaning: boolean;
    express: boolean;
    insurance: boolean;
  };
  totalPrice: number;
  paymentMethod: 'card' | 'yoco' | 'apple_pay' | 'google_pay';
}

export interface Booking extends BookingData {
  id: string;
  userId: string;
  driverId?: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

// Token management
const TOKEN_KEY = 'auth_token';

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await removeToken();
      // You might want to redirect to login screen here
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  signup: async (data: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    password: string;
    role?: 'USER' | 'DRIVER';
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/signup', data);
    if (response.data.token) {
      await setToken(response.data.token);
    }
    return response.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    if (response.data.token) {
      await setToken(response.data.token);
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      await removeToken();
    }
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/api/auth/me');
    return response.data;
  },

  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
  }): Promise<{ user: User; message: string }> => {
    const response = await api.put<{ user: User; message: string }>('/api/auth/profile', data);
    return response.data;
  },

  refreshToken: async (): Promise<{ token: string }> => {
    const response = await api.post<{ token: string }>('/api/auth/refresh');
    if (response.data.token) {
      await setToken(response.data.token);
    }
    return response.data;
  },
};

// Booking API
export const bookingApi = {
  create: async (data: BookingData): Promise<{ booking: Booking; message: string }> => {
    const response = await api.post<{ booking: Booking; message: string }>('/api/bookings', data);
    return response.data;
  },

  getAll: async (): Promise<{ bookings: Booking[] }> => {
    const response = await api.get<{ bookings: Booking[] }>('/api/bookings');
    return response.data;
  },

  getById: async (id: string): Promise<{ booking: Booking }> => {
    const response = await api.get<{ booking: Booking }>(`/api/bookings/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: Booking['status']): Promise<{ booking: Booking; message: string }> => {
    const response = await api.patch<{ booking: Booking; message: string }>(`/api/bookings/${id}/status`, { status });
    return response.data;
  },

  cancel: async (id: string): Promise<{ booking: Booking; message: string }> => {
    const response = await api.delete<{ booking: Booking; message: string }>(`/api/bookings/${id}`);
    return response.data;
  },

  getEstimate: async (data: {
    distance: number;
    vehicleType: string;
    extraServices?: any;
  }): Promise<{
    basePrice: number;
    extraServicesPrice: number;
    totalPrice: number;
    currency: string;
  }> => {
    const response = await api.post<{
      basePrice: number;
      extraServicesPrice: number;
      totalPrice: number;
      currency: string;
    }>('/api/bookings/estimate', data);
    return response.data;
  },
};

// Vehicle API
export const vehicleApi = {
  getAll: async (): Promise<{ vehicles: any[] }> => {
    const response = await api.get<{ vehicles: any[] }>('/api/vehicles');
    return response.data;
  },

  getByType: async (type: string): Promise<{ vehicle: any }> => {
    const response = await api.get<{ vehicle: any }>(`/api/vehicles/type/${type}`);
    return response.data;
  },
};

// Driver API (for driver app)
export const driverApi = {
  getJobs: async (): Promise<{ jobs: any[] }> => {
    const response = await api.get<{ jobs: any[] }>('/api/driver/jobs');
    return response.data;
  },

  acceptJob: async (jobId: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/api/driver/jobs/${jobId}/accept`);
    return response.data;
  },

  updateLocation: async (data: {
    latitude: number;
    longitude: number;
    address?: string;
  }): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/api/driver/location', data);
    return response.data;
  },

  updateStatus: async (isOnline: boolean): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/api/driver/status', { isOnline });
    return response.data;
  },

  getEarnings: async (): Promise<{
    today: number;
    week: number;
    month: number;
  }> => {
    const response = await api.get<{
      today: number;
      week: number;
      month: number;
    }>('/api/driver/earnings');
    return response.data;
  },
};

// Donation API (for RELOCare)
export const donationApi = {
  getAll: async (): Promise<{ donations: any[] }> => {
    const response = await api.get<{ donations: any[] }>('/api/donations');
    return response.data;
  },

  getById: async (id: string): Promise<{ donation: any }> => {
    const response = await api.get<{ donation: any }>(`/api/donations/${id}`);
    return response.data;
  },

  create: async (data: any): Promise<{ donation: any; message: string }> => {
    const response = await api.post<{ donation: any; message: string }>('/api/donations', data);
    return response.data;
  },

  request: async (id: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(`/api/donations/${id}/request`);
    return response.data;
  },

  updateStatus: async (id: string, status: string): Promise<{ donation: any; message: string }> => {
    const response = await api.patch<{ donation: any; message: string }>(`/api/donations/${id}/status`, { status });
    return response.data;
  },
};

// News API (for RELONews)
export const newsApi = {
  getAll: async (): Promise<{ articles: any[] }> => {
    const response = await api.get<{ articles: any[] }>('/api/news');
    return response.data;
  },

  getById: async (id: string): Promise<{ article: any }> => {
    const response = await api.get<{ article: any }>(`/api/news/${id}`);
    return response.data;
  },
};

// Ports API (for RELOPorts)
export const portsApi = {
  getAll: async (): Promise<{ ports: any[] }> => {
    const response = await api.get<{ ports: any[] }>('/api/ports');
    return response.data;
  },

  getSchedules: async (portId: string): Promise<{ schedules: any[] }> => {
    const response = await api.get<{ schedules: any[] }>(`/api/ports/${portId}/schedules`);
    return response.data;
  },
};

// File upload utility
export const uploadFile = async (file: any, type: 'avatar' | 'document' | 'donation'): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await api.post<{ url: string }>('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Error handler utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default api;
