// User Types
export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  isVerified: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'user' | 'driver' | 'admin';

export interface CreateUserRequest {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

// Vehicle Types
export interface VehicleClass {
  id: string;
  name: string;
  type: VehicleType;
  capacity: string;
  basePrice: number;
  pricePerKm: number;
  description: string;
  image: string;
}

export type VehicleType = 'van' | 'truck' | 'pickup' | 'motorcycle';

// Booking Types
export interface BookingRequest {
  id: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  scheduledDateTime: Date;
  vehicleType: VehicleType;
  vehicleClassId: string;
  estimatedDistance: number;
  estimatedDuration: number;
  packageDetails: PackageDetails;
  extraServices: ExtraServices;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  userId: string;
  driverId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PackageDetails {
  description: string;
  weight?: number;
  volume?: number;
  fragile: boolean;
  valuable: boolean;
}

export interface ExtraServices {
  loading: boolean;
  stairs: number;
  packing: boolean;
  cleaning: boolean;
  express: boolean;
  insurance: boolean;
}

export type PaymentMethod = 'card' | 'yoco' | 'apple_pay' | 'google_pay';
export type BookingStatus = 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

// Pricing Types
export interface PricingRequest {
  distanceKm: number;
  vehicleClassId: string;
  extraServices: ExtraServices;
  scheduledDateTime: Date;
}

export interface PricingResponse {
  baseFare: number;
  distanceFare: number;
  extrasFees: number;
  insurance: number;
  tax: number;
  total: number;
  breakdown: PricingBreakdown[];
}

export interface PricingBreakdown {
  item: string;
  amount: number;
  description: string;
}

// Driver Types
export interface Driver {
  id: string;
  userId: string;
  licenseNumber: string;
  vehicleInfo: VehicleInfo;
  isOnline: boolean;
  currentLocation?: Location;
  rating: number;
  totalTrips: number;
  documents: DriverDocument[];
  earnings: DriverEarnings;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  vehicleClassId: string;
}

export interface DriverDocument {
  id: string;
  type: DocumentType;
  url: string;
  status: DocumentStatus;
  uploadedAt: Date;
  reviewedAt?: Date;
}

export type DocumentType = 'license' | 'registration' | 'insurance' | 'vehicle_photo' | 'profile_photo';
export type DocumentStatus = 'pending' | 'approved' | 'rejected';

export interface DriverEarnings {
  totalEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  lastPayment?: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: any;
}

// Socket Event Types
export interface SocketEvents {
  // Client to Server
  'booking:create': BookingRequest;
  'booking:update': { bookingId: string; updates: Partial<BookingRequest> };
  'driver:location': { driverId: string; location: Location };
  'driver:status': { driverId: string; isOnline: boolean };
  
  // Server to Client
  'booking:created': BookingRequest;
  'booking:updated': BookingRequest;
  'booking:assigned': { bookingId: string; driver: Driver };
  'driver:location_updated': { driverId: string; location: Location };
  'notification': { type: string; message: string; data?: any };
}

// News Types
export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: NewsCategory;
  tags: string[];
  imageUrl?: string;
  publishedAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}

export type NewsCategory = 'industry' | 'regulation' | 'technology' | 'market' | 'company';

// Port Types
export interface PortInfo {
  id: string;
  name: string;
  code: string;
  country: string;
  location: Location;
  services: PortService[];
  schedules: ShippingSchedule[];
  contact: PortContact;
}

export interface PortService {
  type: string;
  available: boolean;
  operatingHours: string;
}

export interface ShippingSchedule {
  id: string;
  vesselName: string;
  origin: string;
  destination: string;
  departureTime: Date;
  arrivalTime: Date;
  status: ScheduleStatus;
}

export type ScheduleStatus = 'scheduled' | 'delayed' | 'departed' | 'arrived' | 'cancelled';

export interface PortContact {
  phone: string;
  email: string;
  website?: string;
  address: string;
}

// Donation Types (RELOCare)
export interface DonationItem {
  id: string;
  title: string;
  description: string;
  category: DonationCategory;
  condition: ItemCondition;
  images: string[];
  location: Location;
  donorId: string;
  recipientId?: string;
  status: DonationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type DonationCategory = 'furniture' | 'electronics' | 'clothing' | 'books' | 'kitchenware' | 'other';
export type ItemCondition = 'new' | 'excellent' | 'good' | 'fair' | 'poor';
export type DonationStatus = 'available' | 'reserved' | 'collected' | 'cancelled';

export default {};
