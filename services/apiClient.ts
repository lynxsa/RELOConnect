import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// Storage Keys
const STORAGE_KEYS = {
  AUTH_TOKEN: '@reloconnect:auth_token',
  REFRESH_TOKEN: '@reloconnect:refresh_token',
  USER_DATA: '@reloconnect:user_data',
};

// Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Client Class
class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadStoredToken();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await this.refreshToken();
            return this.client(originalRequest);
          } catch (refreshError) {
            await this.logout();
            throw new ApiError('Session expired. Please login again.', 401);
          }
        }

        throw this.handleError(error);
      }
    );
  }

  private async loadStoredToken() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        this.authToken = token;
      }
    } catch (error) {
      console.error('Failed to load stored token:', error);
    }
  }

  private async saveToken(token: string) {
    try {
      this.authToken = token;
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  }

  private async removeToken() {
    try {
      this.authToken = null;
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data?.message || data?.error || 'An error occurred';
      return new ApiError(message, status, data);
    } else if (error.request) {
      // Network error
      return new ApiError('Network error. Please check your connection.');
    } else {
      // Other error
      return new ApiError(error.message || 'An unexpected error occurred');
    }
  }

  private async refreshToken(): Promise<void> {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.client.post('/auth/refresh', {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      await this.saveToken(accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }

  // Generic HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    if (!response.data.success) {
      throw new ApiError(response.data.message || 'Request failed');
    }
    return response.data.data as T;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    if (!response.data.success) {
      throw new ApiError(response.data.message || 'Request failed');
    }
    return response.data.data as T;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    if (!response.data.success) {
      throw new ApiError(response.data.message || 'Request failed');
    }
    return response.data.data as T;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    if (!response.data.success) {
      throw new ApiError(response.data.message || 'Request failed');
    }
    return response.data.data as T;
  }

  async getPaginated<T = any>(url: string, config?: AxiosRequestConfig): Promise<PaginatedResponse<T>> {
    const response = await this.client.get<PaginatedResponse<T>>(url, config);
    if (!response.data.success) {
      throw new ApiError(response.data.message || 'Request failed');
    }
    return response.data;
  }

  // Authentication methods
  async login(credentials: { email: string; password: string }) {
    const response = await this.post('/auth/login', credentials);
    const { user, accessToken, refreshToken } = response;
    
    await this.saveToken(accessToken);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    
    return { user, accessToken };
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) {
    return this.post('/auth/register', userData);
  }

  async verifyOTP(data: { email: string; otp: string }) {
    const response = await this.post('/auth/verify-otp', data);
    const { user, accessToken, refreshToken } = response;
    
    await this.saveToken(accessToken);
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    
    return { user, accessToken };
  }

  async logout() {
    try {
      if (this.authToken) {
        await this.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await this.removeToken();
    }
  }

  async forgotPassword(email: string) {
    return this.post('/auth/forgot-password', { email });
  }

  async resetPassword(data: { token: string; password: string }) {
    return this.post('/auth/reset-password', data);
  }

  // User methods
  async getCurrentUser() {
    return this.get('/users/me');
  }

  async updateProfile(userData: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    avatar: string;
  }>) {
    return this.put('/users/me', userData);
  }

  // Check authentication status
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) return false;
      
      // Validate token with server
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get stored user data
  async getStoredUser() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
export default apiClient;
