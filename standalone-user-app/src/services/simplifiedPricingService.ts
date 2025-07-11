// Simplified Enhanced Pricing Service for v1.0.0
// This replaces the complex Google Maps integration with basic pricing

export interface SimpleRouteDetails {
  distance: number; // in kilometers
  duration: number; // in minutes
  traffic: 'light' | 'moderate' | 'heavy';
  tollRoads: boolean;
}

export interface SimplePricingFactors {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  demand: 'low' | 'normal' | 'high';
  weather: 'clear' | 'rain' | 'storm';
  distance: number;
  traffic: 'light' | 'moderate' | 'heavy';
}

export class SimplifiedEnhancedPricingService {
  async calculatePricing(
    origin: {lat: number; lng: number; address: string},
    destination: {lat: number; lng: number; address: string},
    vehicleType: string,
    scheduledTime?: Date
  ) {
    // Simple distance calculation (Haversine formula)
    const distance = this.calculateDistance(origin, destination);
    
    // Basic pricing factors
    const factors: SimplePricingFactors = {
      timeOfDay: this.getTimeOfDay(scheduledTime || new Date()),
      dayOfWeek: this.getDayOfWeek(scheduledTime || new Date()),
      demand: 'normal',
      weather: 'clear',
      distance,
      traffic: distance > 20 ? 'moderate' : 'light'
    };

    // Base fare calculation
    const baseFare = Math.max(100, distance * 12); // R12 per km, minimum R100
    
    // Apply multipliers
    let multiplier = 1.0;
    if (factors.timeOfDay === 'evening') multiplier += 0.1;
    if (factors.dayOfWeek === 'weekend') multiplier += 0.15;
    if (factors.traffic === 'heavy') multiplier += 0.2;
    if (factors.demand === 'high') multiplier += 0.25;

    const totalFare = Math.round(baseFare * multiplier);

    return {
      baseFare,
      totalFare,
      factors,
      route: {
        distance,
        duration: Math.round(distance * 2), // Assume 30km/h average
        traffic: factors.traffic,
        tollRoads: distance > 15
      },
      confidence: 85 // High confidence for simple calculation
    };
  }

  private calculateDistance(point1: {lat: number; lng: number}, point2: {lat: number; lng: number}): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(point2.lat - point1.lat);
    const dLng = this.deg2rad(point2.lng - point1.lng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(point1.lat)) * Math.cos(this.deg2rad(point2.lat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private getTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = date.getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  private getDayOfWeek(date: Date): 'weekday' | 'weekend' {
    const day = date.getDay();
    return (day === 0 || day === 6) ? 'weekend' : 'weekday';
  }
}

export const simplifiedPricingService = new SimplifiedEnhancedPricingService();
