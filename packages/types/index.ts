// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Booking types
export interface BookingRequest {
  serviceType: 'parcel' | 'furniture' | 'vehicle' | 'household';
  pickupAddress: Address;
  deliveryAddress: Address;
  scheduledDate: Date;
  items: BookingItem[];
  specialInstructions?: string;
}

export interface BookingItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  dimensions?: Dimensions;
  weight?: number;
  value?: number;
  fragile?: boolean;
}

export interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

// Driver types
export interface Driver {
  id: string;
  user: User;
  licenseNumber: string;
  vehicleType: VehicleType;
  rating: number;
  totalDeliveries: number;
  status: 'available' | 'busy' | 'offline';
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface VehicleType {
  id: string;
  name: string;
  maxWeight: number;
  maxDimensions: Dimensions;
  pricePerKm: number;
}

// Booking status
export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  driverId?: string;
  status: BookingStatus;
  request: BookingRequest;
  pricing: BookingPricing;
  timeline: BookingTimeline[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingPricing {
  basePrice: number;
  distancePrice: number;
  additionalFees: {
    name: string;
    amount: number;
  }[];
  totalPrice: number;
  currency: string;
}

export interface BookingTimeline {
  status: BookingStatus;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Chat types
export interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  senderType: 'user' | 'driver';
  message: string;
  timestamp: Date;
  read: boolean;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'booking_update' | 'message' | 'promotion' | 'system';
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
}
