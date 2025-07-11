import * as Location from 'expo-location';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: Location.PermissionStatus;
}

export interface RouteOptimization {
  distance: number;
  duration: number;
  steps: Array<{
    instruction: string;
    distance: number;
    duration: number;
    coordinates: [number, number];
  }>;
  waypoints: Array<{
    latitude: number;
    longitude: number;
    address?: string;
  }>;
}

class MobileLocationService {
  private watchId: Location.LocationSubscription | null = null;
  private socket: Socket | null = null;
  private backgroundLocationTask: Location.LocationTaskName = 'background-location-task';
  private isTracking = false;

  /**
   * Request location permissions
   */
  async requestLocationPermissions(): Promise<LocationPermissionStatus> {
    try {
      // Request foreground permissions first
      const { status: foregroundStatus, canAskAgain: foregroundCanAsk } = 
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== 'granted') {
        return {
          granted: false,
          canAskAgain: foregroundCanAsk,
          status: foregroundStatus,
        };
      }

      // Request background permissions if foreground is granted
      const { status: backgroundStatus, canAskAgain: backgroundCanAsk } = 
        await Location.requestBackgroundPermissionsAsync();

      return {
        granted: backgroundStatus === 'granted',
        canAskAgain: backgroundCanAsk,
        status: backgroundStatus,
      };

    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: Location.PermissionStatus.DENIED,
      };
    }
  }

  /**
   * Get current location
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000, // 10 seconds
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        altitudeAccuracy: location.coords.altitudeAccuracy,
        heading: location.coords.heading,
        speed: location.coords.speed,
        timestamp: location.timestamp,
      };

    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Start real-time location tracking
   */
  async startLocationTracking(
    onLocationUpdate: (location: LocationData) => void,
    options: {
      accuracy?: Location.Accuracy;
      timeInterval?: number;
      distanceInterval?: number;
    } = {}
  ): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return false;
      }

      if (this.watchId) {
        await this.stopLocationTracking();
      }

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: options.accuracy || Location.Accuracy.High,
          timeInterval: options.timeInterval || 5000, // 5 seconds
          distanceInterval: options.distanceInterval || 10, // 10 meters
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            altitude: location.coords.altitude,
            altitudeAccuracy: location.coords.altitudeAccuracy,
            heading: location.coords.heading,
            speed: location.coords.speed,
            timestamp: location.timestamp,
          };

          onLocationUpdate(locationData);
        }
      );

      this.isTracking = true;
      return true;

    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  /**
   * Stop location tracking
   */
  async stopLocationTracking(): Promise<void> {
    try {
      if (this.watchId) {
        this.watchId.remove();
        this.watchId = null;
      }
      this.isTracking = false;
    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  }

  /**
   * Start background location tracking for drivers
   */
  async startBackgroundLocationTracking(): Promise<boolean> {
    try {
      const { status } = await Location.getBackgroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Background location permission not granted');
        return false;
      }

      // Check if task is already defined
      const isTaskDefined = await Location.hasStartedLocationUpdatesAsync(this.backgroundLocationTask);
      
      if (isTaskDefined) {
        await Location.stopLocationUpdatesAsync(this.backgroundLocationTask);
      }

      // Define the background task
      await Location.defineTask(this.backgroundLocationTask, ({ data, error }) => {
        if (error) {
          console.error('Background location error:', error);
          return;
        }

        if (data) {
          const { locations } = data as { locations: Location.LocationObject[] };
          
          // Send location updates to server
          locations.forEach(location => {
            this.sendLocationToServer({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy,
              altitude: location.coords.altitude,
              altitudeAccuracy: location.coords.altitudeAccuracy,
              heading: location.coords.heading,
              speed: location.coords.speed,
              timestamp: location.timestamp,
            });
          });
        }
      });

      // Start background location updates
      await Location.startLocationUpdatesAsync(this.backgroundLocationTask, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 30000, // 30 seconds
        distanceInterval: 50, // 50 meters
        foregroundService: {
          notificationTitle: 'RELOConnect is tracking your location',
          notificationBody: 'This helps customers track their delivery',
        },
      });

      return true;

    } catch (error) {
      console.error('Error starting background location tracking:', error);
      return false;
    }
  }

  /**
   * Stop background location tracking
   */
  async stopBackgroundLocationTracking(): Promise<void> {
    try {
      const isTaskDefined = await Location.hasStartedLocationUpdatesAsync(this.backgroundLocationTask);
      
      if (isTaskDefined) {
        await Location.stopLocationUpdatesAsync(this.backgroundLocationTask);
      }
    } catch (error) {
      console.error('Error stopping background location tracking:', error);
    }
  }

  /**
   * Connect to Socket.IO for real-time updates
   */
  connectToSocket(serverUrl: string, userId: string): void {
    try {
      if (this.socket) {
        this.socket.disconnect();
      }

      this.socket = io(serverUrl, {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to tracking socket');
        this.socket?.emit('join-user-room', userId);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from tracking socket');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

    } catch (error) {
      console.error('Error connecting to socket:', error);
    }
  }

  /**
   * Send location update to server via Socket.IO
   */
  private sendLocationToServer(location: LocationData): void {
    try {
      if (!this.socket || !this.socket.connected) {
        console.warn('Socket not connected, cannot send location update');
        return;
      }

      this.socket.emit('location-update', location);
    } catch (error) {
      console.error('Error sending location to server:', error);
    }
  }

  /**
   * Get optimized route between points
   */
  async getOptimizedRoute(
    start: { latitude: number; longitude: number },
    end: { latitude: number; longitude: number },
    waypoints?: Array<{ latitude: number; longitude: number }>
  ): Promise<RouteOptimization | null> {
    try {
      // This would integrate with Google Maps Directions API or similar
      // For now, return a mock response
      const mockRoute: RouteOptimization = {
        distance: 15.5, // km
        duration: 25, // minutes
        steps: [
          {
            instruction: 'Head north on Main St',
            distance: 0.5,
            duration: 2,
            coordinates: [start.longitude, start.latitude],
          },
          {
            instruction: 'Turn right on Highway 1',
            distance: 10.0,
            duration: 15,
            coordinates: [(start.longitude + end.longitude) / 2, (start.latitude + end.latitude) / 2],
          },
          {
            instruction: 'Arrive at destination',
            distance: 5.0,
            duration: 8,
            coordinates: [end.longitude, end.latitude],
          },
        ],
        waypoints: waypoints || [],
      };

      return mockRoute;

    } catch (error) {
      console.error('Error getting optimized route:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Check if location services are enabled
   */
  async isLocationEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  /**
   * Save last known location to storage
   */
  async saveLastKnownLocation(location: LocationData): Promise<void> {
    try {
      await AsyncStorage.setItem('lastKnownLocation', JSON.stringify(location));
    } catch (error) {
      console.error('Error saving last known location:', error);
    }
  }

  /**
   * Get last known location from storage
   */
  async getLastKnownLocation(): Promise<LocationData | null> {
    try {
      const locationString = await AsyncStorage.getItem('lastKnownLocation');
      return locationString ? JSON.parse(locationString) : null;
    } catch (error) {
      console.error('Error getting last known location:', error);
      return null;
    }
  }

  /**
   * Get tracking status
   */
  getTrackingStatus(): boolean {
    return this.isTracking;
  }

  /**
   * Disconnect socket
   */
  disconnectSocket(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Cleanup all location services
   */
  async cleanup(): Promise<void> {
    await this.stopLocationTracking();
    await this.stopBackgroundLocationTracking();
    this.disconnectSocket();
  }
}

export default new MobileLocationService();
