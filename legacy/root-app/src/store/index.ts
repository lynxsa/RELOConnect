import { create } from 'zustand';
import { User, BookingRequest, Location, Vehicle, Driver } from '../types';

// Re-export our pricing store
export { usePricingStore } from './pricingStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  })),
}));

interface BookingState {
  currentBooking: Partial<BookingRequest> | null;
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  selectedVehicle: Vehicle | null;
  extraServices: BookingRequest['extraServices'];
  estimatedPrice: number;
  bookingHistory: BookingRequest[];
  setPickupLocation: (location: Location) => void;
  setDropoffLocation: (location: Location) => void;
  setSelectedVehicle: (vehicle: Vehicle) => void;
  updateExtraServices: (services: Partial<BookingRequest['extraServices']>) => void;
  setEstimatedPrice: (price: number) => void;
  clearBooking: () => void;
  addToHistory: (booking: BookingRequest) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  currentBooking: null,
  pickupLocation: null,
  dropoffLocation: null,
  selectedVehicle: null,
  extraServices: {
    loading: false,
    stairs: 0,
    packing: false,
    cleaning: false,
    express: false,
    insurance: false,
  },
  estimatedPrice: 0,
  bookingHistory: [],
  setPickupLocation: (location) => set({ pickupLocation: location }),
  setDropoffLocation: (location) => set({ dropoffLocation: location }),
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  updateExtraServices: (services) => set((state) => ({
    extraServices: { ...state.extraServices, ...services }
  })),
  setEstimatedPrice: (price) => set({ estimatedPrice: price }),
  clearBooking: () => set({
    currentBooking: null,
    pickupLocation: null,
    dropoffLocation: null,
    selectedVehicle: null,
    extraServices: {
      loading: false,
      stairs: 0,
      packing: false,
      cleaning: false,
      express: false,
      insurance: false,
    },
    estimatedPrice: 0,
  }),
  addToHistory: (booking) => set((state) => ({
    bookingHistory: [booking, ...state.bookingHistory]
  })),
}));

interface DriverState {
  driver: Driver | null;
  isOnline: boolean;
  currentLocation: Location | null;
  activeBooking: BookingRequest | null;
  earnings: {
    today: number;
    week: number;
    month: number;
  };
  setDriver: (driver: Driver) => void;
  toggleOnline: () => void;
  updateLocation: (location: Location) => void;
  setActiveBooking: (booking: BookingRequest | null) => void;
  updateEarnings: (earnings: Partial<DriverState['earnings']>) => void;
}

export const useDriverStore = create<DriverState>((set) => ({
  driver: null,
  isOnline: false,
  currentLocation: null,
  activeBooking: null,
  earnings: {
    today: 0,
    week: 0,
    month: 0,
  },
  setDriver: (driver) => set({ driver }),
  toggleOnline: () => set((state) => ({ isOnline: !state.isOnline })),
  updateLocation: (location) => set({ currentLocation: location }),
  setActiveBooking: (booking) => set({ activeBooking: booking }),
  updateEarnings: (earnings) => set((state) => ({
    earnings: { ...state.earnings, ...earnings }
  })),
}));

interface AppState {
  theme: 'light' | 'dark';
  isLoading: boolean;
  error: string | null;
  notifications: any[];
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  isLoading: false,
  error: null,
  notifications: [],
  setTheme: (theme) => set({ theme }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, notification]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
}));
