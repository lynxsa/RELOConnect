// Google Maps API type declarations for RELOConnect
// This provides the necessary types for enhancedPricingService.ts

declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface DirectionsRequest {
      origin: string | LatLng;
      destination: string | LatLng;
      travelMode: TravelMode;
      avoidHighways?: boolean;
      avoidTolls?: boolean;
    }

    interface DirectionsResult {
      routes: DirectionsRoute[];
    }

    interface DirectionsRoute {
      legs: DirectionsLeg[];
    }

    interface DirectionsLeg {
      distance: { value: number; text: string };
      duration: { value: number; text: string };
      steps?: DirectionsStep[];
    }

    interface DirectionsStep {
      maneuver?: string;
    }

    enum TravelMode {
      DRIVING = 'DRIVING',
      WALKING = 'WALKING',
      BICYCLING = 'BICYCLING',
      TRANSIT = 'TRANSIT'
    }

    enum DirectionsStatus {
      OK = 'OK',
      NOT_FOUND = 'NOT_FOUND',
      ZERO_RESULTS = 'ZERO_RESULTS',
      MAX_WAYPOINTS_EXCEEDED = 'MAX_WAYPOINTS_EXCEEDED',
      MAX_ROUTE_LENGTH_EXCEEDED = 'MAX_ROUTE_LENGTH_EXCEEDED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR'
    }

    class DirectionsService {
      route(
        request: DirectionsRequest,
        callback: (result: DirectionsResult | null, status: DirectionsStatus) => void
      ): void;
    }
  }
}

export {};
