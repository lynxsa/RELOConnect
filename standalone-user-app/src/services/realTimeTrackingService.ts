import * as Location from 'expo-location';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

export interface TrackingUpdate {
  driverId: string;
  bookingId: string;
  location: LocationData;
  status: 'en_route' | 'arrived' | 'loading' | 'in_transit' | 'unloading' | 'completed';
  estimatedArrival?: Date;
}

export class RealTimeTrackingService {
  private socket: Socket | null = null;
  private locationSubscription: Location.LocationSubscription | null = null;
  private trackingInterval: NodeJS.Timeout | null = null;
  private isTracking = false;
  private currentBookingId: string | null = null;
  private onLocationUpdate?: (location: LocationData) => void;

  // Initialize real-time tracking connection
  async initialize(): Promise<void> {
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
      const token = await AsyncStorage.getItem('authToken');

      this.socket = io(`${baseURL}`, {
        auth: {
          token,
        },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('✅ Real-time tracking connected');
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Real-time tracking disconnected');
      });

      this.socket.on('tracking_update', (data: TrackingUpdate) => {
        console.log('📍 Received tracking update:', data);
        // Handle incoming tracking updates from other drivers/bookings
      });

      this.socket.on('eta_update', (data: { bookingId: string; eta: Date }) => {
        console.log('⏰ ETA updated:', data);
        // Handle ETA updates
      });

    } catch (error) {
      console.error('Failed to initialize real-time tracking:', error);
      throw error;
    }
  }

  // Request location permissions
  async requestLocationPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        console.log('Foreground location permission denied');
        return false;
      }

      // For background tracking (drivers)
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        console.log('Background location permission denied');
        // Still allow foreground tracking
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  // Start tracking for a booking (driver side)
  async startTracking(
    bookingId: string,
    onLocationUpdate?: (location: LocationData) => void
  ): Promise<void> {
    try {
      if (this.isTracking) {
        await this.stopTracking();
      }

      const hasPermission = await this.requestLocationPermissions();
      if (!hasPermission) {
        throw new Error('Location permission required for tracking');
      }

      this.currentBookingId = bookingId;
      this.onLocationUpdate = onLocationUpdate;
      this.isTracking = true;

      // Start location tracking with high accuracy
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          this.handleLocationUpdate(location);
        }
      );

      // Join tracking room for this booking
      if (this.socket) {
        this.socket.emit('join_tracking', { bookingId });
      }

      console.log(`✅ Started tracking for booking: ${bookingId}`);
    } catch (error) {
      console.error('Failed to start tracking:', error);
      throw error;
    }
  }

  // Stop tracking
  async stopTracking(): Promise<void> {
    try {
      this.isTracking = false;

      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }

      if (this.trackingInterval) {
        clearInterval(this.trackingInterval);
        this.trackingInterval = null;
      }

      if (this.socket && this.currentBookingId) {
        this.socket.emit('leave_tracking', { bookingId: this.currentBookingId });
      }

      this.currentBookingId = null;
      this.onLocationUpdate = undefined;

      console.log('✅ Stopped tracking');
    } catch (error) {
      console.error('Failed to stop tracking:', error);
    }
  }

  // Handle location updates
  private handleLocationUpdate(location: Location.LocationObject): void {
    const locationData: LocationData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude || undefined,
      accuracy: location.coords.accuracy || undefined,
      speed: location.coords.speed || undefined,
      heading: location.coords.heading || undefined,
      timestamp: location.timestamp,
    };

    // Call local update handler
    if (this.onLocationUpdate) {
      this.onLocationUpdate(locationData);
    }

    // Send to backend via socket
    if (this.socket && this.currentBookingId) {
      const trackingUpdate: TrackingUpdate = {
        driverId: 'current_driver_id', // Get from auth context
        bookingId: this.currentBookingId,
        location: locationData,
        status: 'in_transit', // Update based on current status
      };

      this.socket.emit('location_update', trackingUpdate);
    }
  }

  // Subscribe to tracking updates for a booking (customer side)
  subscribeToBookingUpdates(
    bookingId: string,
    onUpdate: (update: TrackingUpdate) => void
  ): void {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    // Join tracking room as observer
    this.socket.emit('join_tracking', { bookingId, role: 'customer' });

    // Listen for updates
    this.socket.on(`tracking_update_${bookingId}`, onUpdate);

    console.log(`✅ Subscribed to tracking updates for booking: ${bookingId}`);
  }

  // Unsubscribe from tracking updates
  unsubscribeFromBookingUpdates(bookingId: string): void {
    if (!this.socket) return;

    this.socket.emit('leave_tracking', { bookingId });
    this.socket.off(`tracking_update_${bookingId}`);

    console.log(`✅ Unsubscribed from tracking updates for booking: ${bookingId}`);
  }

  // Update booking status (driver side)
  async updateBookingStatus(
    bookingId: string,
    status: 'en_route' | 'arrived' | 'loading' | 'in_transit' | 'unloading' | 'completed',
    location?: LocationData
  ): Promise<void> {
    try {
      if (!this.socket) {
        throw new Error('Socket not connected');
      }

      const update = {
        bookingId,
        status,
        location: location || await this.getCurrentLocation(),
        timestamp: Date.now(),
      };

      this.socket.emit('status_update', update);
      console.log(`✅ Updated booking status: ${status}`);
    } catch (error) {
      console.error('Failed to update booking status:', error);
      throw error;
    }
  }

  // Get current location once
  async getCurrentLocation(): Promise<LocationData> {
    try {
      const hasPermission = await this.requestLocationPermissions();
      if (!hasPermission) {
        throw new Error('Location permission required');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude || undefined,
        accuracy: location.coords.accuracy || undefined,
        speed: location.coords.speed || undefined,
        heading: location.coords.heading || undefined,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Failed to get current location:', error);
      throw error;
    }
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degreesToRadians(point2.latitude - point1.latitude);
    const dLon = this.degreesToRadians(point2.longitude - point1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(point1.latitude)) *
        Math.cos(this.degreesToRadians(point2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Convert degrees to radians
  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Calculate ETA based on current location and destination
  async calculateETA(
    destination: { latitude: number; longitude: number },
    averageSpeed: number = 60 // km/h
  ): Promise<Date> {
    try {
      const currentLocation = await this.getCurrentLocation();
      const distance = this.calculateDistance(currentLocation, destination);
      const timeInHours = distance / averageSpeed;
      const etaTimestamp = Date.now() + (timeInHours * 60 * 60 * 1000);
      return new Date(etaTimestamp);
    } catch (error) {
      console.error('Failed to calculate ETA:', error);
      // Return current time + 1 hour as fallback
      return new Date(Date.now() + 60 * 60 * 1000);
    }
  }

  // Send emergency alert
  async sendEmergencyAlert(
    bookingId: string,
    message: string = 'Emergency assistance required'
  ): Promise<void> {
    try {
      if (!this.socket) {
        throw new Error('Socket not connected');
      }

      const location = await this.getCurrentLocation();
      
      this.socket.emit('emergency_alert', {
        bookingId,
        message,
        location,
        timestamp: Date.now(),
      });

      console.log('🚨 Emergency alert sent');
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      throw error;
    }
  }

  // Cleanup and disconnect
  disconnect(): void {
    this.stopTracking();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    console.log('✅ Real-time tracking service disconnected');
  }

  // Check if tracking is active
  isTrackingActive(): boolean {
    return this.isTracking;
  }

  // Get current booking being tracked
  getCurrentBookingId(): string | null {
    return this.currentBookingId;
  }
}

export const realTimeTrackingService = new RealTimeTrackingService();
