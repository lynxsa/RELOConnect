// Screen types for navigation
export type RootTabParamList = {
  Home: undefined;
  Book: undefined;
  Track: undefined;
  Profile: {
    userRole?: UserRole;
    isDriverMode?: boolean;
    toggleDriverMode?: () => void;
  };
};

export type UserScreens = 'Home' | 'Book' | 'Track' | 'Profile';
export type DriverScreens = 'Dashboard' | 'Jobs' | 'Earnings' | 'Profile';

export type UserRole = 'user' | 'driver' | 'both';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  primaryRole: 'user' | 'driver';
  driverStatus?: 'online' | 'offline' | 'busy';
  vehicleInfo?: {
    type: string;
    licensePlate: string;
    model: string;
  };
}

export interface BookingData {
  origin: string;
  destination: string;
  moveDate: string;
  moveSize: 'studio' | '1-bedroom' | '2-bedroom' | '3-bedroom' | '4+bedroom';
  services: string[];
  estimatedPrice?: number;
}

export interface JobRequest {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  distance: string;
  fare: number;
  estimatedTime: string;
  vehicleType: string;
  customerName: string;
  customerRating: number;
  packageDetails: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  requestTime: Date;
}
