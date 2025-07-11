import { apiClient } from './apiClient';

// Booking Types
export interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface BookingItem {
  id?: string;
  name: string;
  category: string;
  quantity: number;
  weight?: number;
  volume?: number;
  fragile: boolean;
  valuable: boolean;
  description?: string;
}

export interface BookingRequest {
  fromAddress: Address;
  toAddress: Address;
  items?: BookingItem[];
  moveType: 'residential' | 'commercial' | 'office' | 'storage';
  truckSize: 'small' | 'medium' | 'large' | 'xl';
  extraServices: string[];
  preferredDate: string;
  timeSlot: string;
  notes?: string;
  urgency?: 'standard' | 'priority' | 'urgent';
}

export interface Booking {
  id: string;
  userId: string;
  bookingNumber: string;
  fromAddress: Address;
  toAddress: Address;
  items: BookingItem[];
  moveType: string;
  truckSize: string;
  extraServices: string[];
  preferredDate: string;
  timeSlot: string;
  totalCost: number;
  status: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  driver?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    vehicle: string;
    plateNumber: string;
    photo?: string;
  };
  estimatedDuration: number;
  estimatedDistance: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PricingQuote {
  truckSize: string;
  basePrice: number;
  distancePrice: number;
  servicesPrices: { [service: string]: number };
  totalPrice: number;
  estimatedDuration: number;
  estimatedDistance: number;
  breakdown: {
    baseFee: number;
    distanceFee: number;
    servicesFee: number;
    tax: number;
    total: number;
  };
}

export interface TrackingEvent {
  id: string;
  bookingId: string;
  status: string;
  message: string;
  timestamp: string;
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

class BookingService {
  // Get pricing quote
  async getPricingQuote(quoteRequest: {
    fromAddress: Address;
    toAddress: Address;
    truckSize: string;
    extraServices: string[];
    moveType: string;
  }): Promise<PricingQuote> {
    return apiClient.post('/bookings/quote', quoteRequest);
  }

  // Create a new booking
  async createBooking(bookingData: BookingRequest): Promise<Booking> {
    return apiClient.post('/bookings', bookingData);
  }

  // Get user's bookings
  async getUserBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `/bookings/user${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.getPaginated<Booking>(url);
  }

  // Get booking by ID
  async getBookingById(bookingId: string): Promise<Booking> {
    return apiClient.get(`/bookings/${bookingId}`);
  }

  // Update booking
  async updateBooking(bookingId: string, updates: Partial<BookingRequest>): Promise<Booking> {
    return apiClient.put(`/bookings/${bookingId}`, updates);
  }

  // Cancel booking
  async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    return apiClient.post(`/bookings/${bookingId}/cancel`, { reason });
  }

  // Get booking tracking events
  async getBookingTracking(bookingId: string): Promise<TrackingEvent[]> {
    return apiClient.get(`/bookings/${bookingId}/tracking`);
  }

  // Rate booking/driver
  async rateBooking(bookingId: string, rating: {
    driverRating: number;
    serviceRating: number;
    comment?: string;
  }): Promise<void> {
    return apiClient.post(`/bookings/${bookingId}/rating`, rating);
  }

  // Get available time slots
  async getAvailableTimeSlots(date: string, truckSize: string): Promise<{
    date: string;
    availableSlots: Array<{
      time: string;
      available: boolean;
      price?: number;
    }>;
  }> {
    return apiClient.get(`/bookings/availability?date=${date}&truckSize=${truckSize}`);
  }

  // Search addresses
  async searchAddresses(query: string): Promise<Address[]> {
    return apiClient.get(`/bookings/addresses/search?q=${encodeURIComponent(query)}`);
  }

  // Validate address
  async validateAddress(address: Omit<Address, 'id'>): Promise<{
    valid: boolean;
    suggestions?: Address[];
    coordinates?: { latitude: number; longitude: number };
  }> {
    return apiClient.post('/bookings/addresses/validate', address);
  }

  // Get service areas
  async getServiceAreas(): Promise<{
    areas: Array<{
      name: string;
      bounds: {
        northeast: { lat: number; lng: number };
        southwest: { lat: number; lng: number };
      };
      active: boolean;
    }>;
  }> {
    return apiClient.get('/bookings/service-areas');
  }

  // Upload booking documents/images
  async uploadBookingDocument(bookingId: string, file: FormData): Promise<{
    url: string;
    filename: string;
    type: string;
  }> {
    return apiClient.post(`/bookings/${bookingId}/documents`, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get booking documents
  async getBookingDocuments(bookingId: string): Promise<Array<{
    id: string;
    filename: string;
    url: string;
    type: string;
    uploadedAt: string;
  }>> {
    return apiClient.get(`/bookings/${bookingId}/documents`);
  }

  // Report issue with booking
  async reportIssue(bookingId: string, issue: {
    type: 'driver_late' | 'damaged_items' | 'missing_items' | 'other';
    description: string;
    images?: string[];
  }): Promise<void> {
    return apiClient.post(`/bookings/${bookingId}/issues`, issue);
  }

  // Get booking receipt
  async getBookingReceipt(bookingId: string): Promise<{
    bookingId: string;
    receiptNumber: string;
    items: Array<{
      description: string;
      quantity: number;
      price: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: string;
    paidAt: string;
  }> {
    return apiClient.get(`/bookings/${bookingId}/receipt`);
  }

  // Get nearby drivers (for emergency bookings)
  async getNearbyDrivers(coordinates: { latitude: number; longitude: number }): Promise<Array<{
    id: string;
    name: string;
    rating: number;
    estimatedArrival: number;
    vehicle: string;
    currentLocation: { latitude: number; longitude: number };
  }>> {
    return apiClient.get(`/bookings/drivers/nearby?lat=${coordinates.latitude}&lng=${coordinates.longitude}`);
  }
}

export const bookingService = new BookingService();
export default bookingService;
