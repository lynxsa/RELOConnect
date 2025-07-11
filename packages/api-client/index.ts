import { User, Booking, BookingRequest, ApiResponse, PaginatedResponse } from '@reloconnect/types';

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'An error occurred',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // User methods
  async getProfile(): Promise<ApiResponse<User>> {
    return this.request('/users/profile');
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Booking methods
  async createBooking(bookingData: BookingRequest): Promise<ApiResponse<Booking>> {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getBookings(page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<Booking>>> {
    return this.request(`/bookings?page=${page}&limit=${limit}`);
  }

  async getBooking(id: string): Promise<ApiResponse<Booking>> {
    return this.request(`/bookings/${id}`);
  }

  async cancelBooking(id: string): Promise<ApiResponse<Booking>> {
    return this.request(`/bookings/${id}/cancel`, {
      method: 'POST',
    });
  }

  // Pricing methods
  async calculatePrice(bookingData: BookingRequest): Promise<ApiResponse<{ estimatedPrice: number }>> {
    return this.request('/pricing/calculate', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }
}

export default ApiClient;
