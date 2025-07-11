// Remove React module declarations to avoid conflicts with actual React types
// React and React Native types are now provided by their respective packages

declare module 'expo-status-bar' {
  export const StatusBar: any;
}

declare module 'expo-linear-gradient' {
  export const LinearGradient: any;
}

declare module '@expo/vector-icons' {
  export const Feather: any;
  export const MaterialIcons: any;
  export const Ionicons: any;
}

declare module '@react-navigation/native-stack' {
  export type NativeStackScreenProps<T, K> = any;
}

declare module 'react/jsx-runtime' {
  export * from 'react/jsx-runtime';
}

declare module 'react/jsx-dev-runtime' {
  export * from 'react/jsx-dev-runtime';
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  OTPVerification: {
    email?: string;
    phone?: string;
  };
  ForgotPassword: undefined;
  MainTabs: undefined;
  BookingFlow: undefined;
  Home: undefined;
  Booking: undefined;
  Tracking: undefined;
  Profile: undefined;
};

// User types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

// Booking types
export interface BookingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  weight?: number;
  volume?: number;
  fragile: boolean;
  valuable: boolean;
}

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

export interface Booking {
  id: string;
  userId: string;
  fromAddress: Address;
  toAddress: Address;
  items: BookingItem[];
  moveType: 'residential' | 'commercial' | 'office';
  truckSize: 'small' | 'medium' | 'large' | 'xl';
  extraServices: string[];
  preferredDate: string;
  timeSlot: string;
  totalCost: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  driver?: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    vehicle: string;
  };
  createdAt: string;
  updatedAt: string;
}
