// Core application types for RELOConnect
export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'user' | 'driver' | 'admin';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Updated Vehicle interface to reference VehicleClass
export interface Vehicle {
  id: string;
  type: 'van' | 'truck' | 'pickup' | 'motorcycle';
  vehicleClass?: VehicleClass;
  vehicleClassId?: string;
  capacity: number; // in cubic meters
  maxWeight: number; // in kg
  name: string;
  description: string;
  basePrice: number;
  pricePerKm: number;
  icon: string;
}

// New pricing related interfaces
export interface VehicleClass {
  id: string;
  name: string;
  capacity: string;
  maxWeight: number; // in kg
  icon: string;
  description: string;
  order: number;
}

export interface DistanceBand {
  id: string;
  minKm: number;
  maxKm: number | null; // null for "1000+" band
  label: string;
}

export interface PricingRate {
  id: string;
  vehicleClassId: string;
  distanceBandId: string;
  baseFare: number; // in ZAR
}

export interface ExtraService {
  id: string;
  name: string;
  code: string;
  description: string;
  priceType: 'flat' | 'per_unit' | 'percentage';
  price: number;
  unit?: string; // e.g., 'person', 'flight', '15min'
  icon: string;
}

export interface ExtraServices {
  loading: boolean;
  loadingPeople?: number;
  stairs: number;
  packing: boolean;
  cleaning: boolean;
  express: boolean;
  insurance: boolean;
  insuranceValue?: number;
  waitingTime?: number; // in 15-min blocks
}

export interface PriceBreakdown {
  baseFare: number;
  extras: {
    loading: number;
    stairs: number;
    packing: number;
    cleaning: number;
    express: number;
    insurance: number;
    waitingTime: number;
  };
  total: number;
}

export interface PriceEstimateRequest {
  distance?: number;
  vehicleClassId: string;
  extraServices: ExtraServices;
  pickupLocation?: Location;
  dropoffLocation?: Location;
}

export interface PriceEstimateResponse {
  distance: number;
  priceBreakdown: PriceBreakdown;
}

export interface BookingRequest {
  id?: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  scheduledDateTime: Date;
  vehicleClassId: string; // Updated to use vehicle class instead of type
  estimatedDistance: number;
  estimatedDuration: number;
  packageDetails: {
    description: string;
    weight?: number;
    volume?: number;
    fragile: boolean;
    valuable: boolean;
  };
  extraServices: ExtraServices; // Updated to use the new ExtraServices type
  totalPrice: number;
  priceBreakdown?: PriceBreakdown; // Added price breakdown
  paymentMethod: 'card' | 'yoco' | 'apple_pay' | 'google_pay';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  userId: string;
  driverId?: string;
}

export interface Driver {
  id: string;
  userId: string;
  licenseNumber: string;
  vehicleId: string;
  rating: number;
  totalTrips: number;
  isOnline: boolean;
  currentLocation?: Location;
  documents: {
    license: string;
    id: string;
    vehicleRegistration: string;
    insurance: string;
  };
  bankDetails: {
    accountNumber: string;
    bankName: string;
    accountHolder: string;
  };
}

export interface DonationItem {
  id: string;
  title: string;
  description: string;
  category: 'furniture' | 'electronics' | 'clothing' | 'books' | 'appliances' | 'other';
  condition: 'new' | 'like_new' | 'good' | 'fair';
  images: string[];
  location: Location;
  donorId: string;
  requesterId?: string;
  status: 'available' | 'requested' | 'collected' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl?: string;
  source: string;
  author?: string;
  publishedAt: Date;
  category: 'logistics' | 'relocation' | 'industry' | 'technology';
  tags: string[];
}

export interface Port {
  id: string;
  name: string;
  code: string;
  country: string;
  location: Location;
  timezone: string;
  facilities: string[];
}

export interface Vessel {
  id: string;
  name: string;
  imo: string;
  type: string;
  flag: string;
  size: {
    length: number;
    width: number;
    draft: number;
  };
}

export interface PortSchedule {
  id: string;
  portId: string;
  vesselId: string;
  eta: Date;
  etd: Date;
  status: 'scheduled' | 'arrived' | 'departed' | 'delayed' | 'cancelled';
  berth?: string;
  cargo: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'image' | 'location' | 'system';
  bookingId?: string;
  read: boolean;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: 'card' | 'yoco' | 'apple_pay' | 'google_pay';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  ServiceExtras: undefined;
  BookingSummary: {
    bookingRequest: BookingRequest;
    priceBreakdown: PriceBreakdown;
  };
  PaymentScreen: undefined;
  BookingConfirmation: undefined;
  OrderTracking: undefined;
  Chat: undefined;
  BookingHistory: undefined;
  PriceCalculator: undefined; // New screen for price calculator
};

export type MainTabParamList = {
  Home: undefined;
  RELOCare: undefined;
  RELONews: undefined;
  RELOPorts: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  BookingDetails: undefined;
  ServiceExtras: {
    bookingRequest: BookingRequest;
  };
  Payment: {
    bookingRequest: BookingRequest;
    priceBreakdown: PriceBreakdown;
  };
  Tracking: undefined;
  BookingConfirmation: { bookingId: string };
  BookingHistory: undefined;
  PriceCalculator: undefined; // Added price calculator screen
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  OTPVerification: { phone: string };
};
