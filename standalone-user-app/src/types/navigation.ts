import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Auth Stack Parameter List
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OTPVerification: {
    phoneNumber: string;
    verificationId: string;
  };
};

// Main Tab Parameter List
export type MainTabParamList = {
  Home: undefined;
  Booking: undefined;
  Tracking: undefined;
  Profile: undefined;
};

// Booking Stack Parameter List
export type BookingStackParamList = {
  EnhancedHome: undefined;
  EnhancedHomeMap: undefined;
  PropertySelection: undefined;
  VehicleSelection: {
    inventory?: any[];
    totalVolume?: number;
    totalWeight?: number;
    propertyType?: string;
  };
  ItemsInventory: {
    propertyType?: string;
  };
  BookingSummary: {
    selectedVehicle: string;
    inventory: any[];
    totalVolume: number;
    totalWeight: number;
    estimatedFare: number;
  };
  PaymentScreen: {
    bookingDetails: any;
    totalAmount: number;
  };
};

// Root Stack Parameter List
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Booking: NavigatorScreenParams<BookingStackParamList>;
};

// Screen Props Types
export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>;

export type BookingScreenProps<T extends keyof BookingStackParamList> = NativeStackScreenProps<
  BookingStackParamList,
  T
>;

// Navigation Props
export type NavigationProps = {
  navigation: any;
  route: any;
};

// Common Location Type
export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

// Booking Flow Data Types
export interface BookingFlowData {
  pickup: LocationData;
  dropoff: LocationData;
  propertyType: string;
  selectedVehicle: string;
  inventory: any[];
  totalVolume: number;
  totalWeight: number;
  estimatedFare: number;
  scheduledDate: string;
  scheduledTime: string;
  additionalServices: string[];
  specialInstructions?: string;
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
