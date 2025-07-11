import '../types/google-maps';
import { VEHICLE_CLASSES, DISTANCE_BANDS, EXTRA_SERVICES, generateCompletePricingMatrix } from '../data/pricing';

// Google Maps integration types
export interface GoogleMapsConfig {
  apiKey: string;
  libraries: string[];
}

export interface RouteDetails {
  distance: number; // in kilometers
  duration: number; // in minutes
  traffic: 'light' | 'moderate' | 'heavy';
  tollRoads: boolean;
  route: Array<{lat: number; lng: number}>;
}

export interface PricingFactors {
  baseDistance: number;
  actualDistance: number;
  timeOfDay: 'peak' | 'off-peak' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  season: 'peak' | 'normal' | 'low';
  weather: 'clear' | 'rain' | 'severe';
  trafficMultiplier: number;
  demandMultiplier: number;
  fuelPriceIndex: number;
}

export interface EnhancedPriceEstimate {
  baseFare: number;
  distanceCharge: number;
  timeMultiplier: number;
  demandSurcharge: number;
  weatherSurcharge: number;
  fuelSurcharge: number;
  extraServices: ExtraServiceCharge[];
  subtotal: number;
  taxes: number;
  total: number;
  priceBreakdown: PriceBreakdownItem[];
  validUntil: Date;
  confidence: number; // 0-100%
}

export interface ExtraServiceCharge {
  serviceId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PriceBreakdownItem {
  category: string;
  description: string;
  amount: number;
  percentage?: number;
}

export class EnhancedPricingCalculator {
  private pricingMatrix: any[];
  private googleMaps: any;
  
  constructor(googleMapsConfig?: GoogleMapsConfig) {
    this.pricingMatrix = generateCompletePricingMatrix();
    if (googleMapsConfig && typeof window !== 'undefined') {
      this.initializeGoogleMaps(googleMapsConfig);
    }
  }

  private async initializeGoogleMaps(config: GoogleMapsConfig) {
    if (typeof window !== 'undefined' && window.google) {
      this.googleMaps = window.google.maps;
      return;
    }
    
    // Load Google Maps script dynamically
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=${config.libraries.join(',')}`;
    script.async = true;
    script.defer = true;
    
    return new Promise((resolve, reject) => {
      script.onload = () => {
        this.googleMaps = window.google.maps;
        resolve(window.google.maps);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Calculate distance using Google Maps Distance Matrix API
   */
  async calculateRouteDetails(
    origin: string | google.maps.LatLng,
    destination: string | google.maps.LatLng,
    options?: {
      travelMode?: google.maps.TravelMode;
      avoidTolls?: boolean;
      avoidHighways?: boolean;
      departureTime?: Date;
    }
  ): Promise<RouteDetails> {
    if (!this.googleMaps) {
      throw new Error('Google Maps not initialized');
    }

    const directionsService = new this.googleMaps.DirectionsService();
    
    const request: google.maps.DirectionsRequest = {
      origin,
      destination,
      travelMode: options?.travelMode || this.googleMaps.TravelMode.DRIVING,
      avoidTolls: options?.avoidTolls || false,
      avoidHighways: options?.avoidHighways || false,
      drivingOptions: options?.departureTime ? {
        departureTime: options.departureTime,
        trafficModel: this.googleMaps.TrafficModel.BEST_GUESS
      } : undefined
    };

    return new Promise((resolve, reject) => {
      directionsService.route(request, (result, status) => {
        if (status === this.googleMaps.DirectionsStatus.OK && result) {
          const route = result.routes[0];
          const leg = route.legs[0];
          
          // Calculate traffic condition based on duration vs duration_in_traffic
          const normalDuration = leg.duration?.value || 0;
          const trafficDuration = leg.duration_in_traffic?.value || normalDuration;
          const trafficRatio = trafficDuration / normalDuration;
          
          let traffic: 'light' | 'moderate' | 'heavy' = 'light';
          if (trafficRatio > 1.3) traffic = 'heavy';
          else if (trafficRatio > 1.15) traffic = 'moderate';
          
          resolve({
            distance: leg.distance?.value ? leg.distance.value / 1000 : 0, // Convert to km
            duration: Math.round(trafficDuration / 60), // Convert to minutes
            traffic,
            tollRoads: route.legs.some(leg => 
              leg.steps?.some(step => step.maneuver?.includes('toll')) || false
            ),
            route: route.overview_path || []
          });
        } else {
          reject(new Error(`Failed to calculate route: ${status}`));
        }
      });
    });
  }

  /**
   * Get current pricing factors based on real-time data
   */
  private getCurrentPricingFactors(routeDetails: RouteDetails): PricingFactors {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const month = now.getMonth();
    
    // Time of day analysis
    let timeOfDay: 'peak' | 'off-peak' | 'night' = 'off-peak';
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      timeOfDay = 'peak';
    } else if (hour >= 22 || hour <= 5) {
      timeOfDay = 'night';
    }
    
    // Day of week
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Season analysis (Southern Hemisphere)
    let season: 'peak' | 'normal' | 'low' = 'normal';
    if (month >= 11 || month <= 1) season = 'peak'; // Summer holidays
    else if (month >= 5 && month <= 7) season = 'low'; // Winter
    
    // Traffic multiplier based on Google Maps data
    const trafficMultipliers = {
      light: 1.0,
      moderate: 1.1,
      heavy: 1.25
    };
    
    // Demand multiplier based on time and season
    let demandMultiplier = 1.0;
    if (timeOfDay === 'peak') demandMultiplier += 0.15;
    if (isWeekend) demandMultiplier += 0.1;
    if (season === 'peak') demandMultiplier += 0.2;
    
    // Fuel price index (can be updated via API)
    const fuelPriceIndex = 1.0; // Base index, can be dynamic
    
    return {
      baseDistance: Math.round(routeDetails.distance),
      actualDistance: routeDetails.distance,
      timeOfDay,
      dayOfWeek: isWeekend ? 'weekend' : 'weekday',
      season,
      weather: 'clear', // Can be integrated with weather API
      trafficMultiplier: trafficMultipliers[routeDetails.traffic],
      demandMultiplier,
      fuelPriceIndex
    };
  }

  /**
   * Find the appropriate distance band for given distance
   */
  private findDistanceBand(distance: number): string {
    const band = DISTANCE_BANDS.find(band => {
      if (band.maxKm === null) {
        return distance >= band.minKm;
      }
      return distance >= band.minKm && distance < band.maxKm;
    });
    
    return band?.id || 'band-1000-plus';
  }

  /**
   * Get base fare from pricing matrix
   */
  private getBaseFare(vehicleClassId: string, distanceBandId: string): number {
    const rate = this.pricingMatrix.find(rate => 
      rate.vehicleClassId === vehicleClassId && 
      rate.distanceBandId === distanceBandId
    );
    
    if (!rate || rate.baseFare === 0) {
      throw new Error('Distance requires custom quote. Please contact support.');
    }
    
    return rate.baseFare;
  }

  /**
   * Calculate extra services charges
   */
  private calculateExtraServices(selectedServices: {
    serviceId: string;
    quantity?: number;
    baseAmount?: number;
  }[], subtotal: number): ExtraServiceCharge[] {
    return selectedServices.map(selected => {
      const service = EXTRA_SERVICES.find(s => s.id === selected.serviceId);
      if (!service) {
        throw new Error(`Extra service not found: ${selected.serviceId}`);
      }
      
      let totalPrice = 0;
      const quantity = selected.quantity || 1;
      
      switch (service.priceType) {
        case 'flat':
          totalPrice = service.price * quantity;
          break;
        case 'per_unit':
          totalPrice = service.price * quantity;
          break;
        case 'percentage':
          totalPrice = (selected.baseAmount || subtotal) * (service.price / 100);
          break;
      }
      
      return {
        serviceId: service.id,
        name: service.name,
        quantity,
        unitPrice: service.price,
        totalPrice: Math.round(totalPrice)
      };
    });
  }

  /**
   * Enhanced price calculation with all factors
   */
  async calculateEnhancedPrice(request: {
    origin: string | google.maps.LatLng;
    destination: string | google.maps.LatLng;
    vehicleClassId: string;
    extraServices?: {
      serviceId: string;
      quantity?: number;
    }[];
    options?: {
      departureTime?: Date;
      avoidTolls?: boolean;
    };
  }): Promise<EnhancedPriceEstimate> {
    try {
      // Get route details from Google Maps
      const routeDetails = await this.calculateRouteDetails(
        request.origin,
        request.destination,
        {
          departureTime: request.options?.departureTime,
          avoidTolls: request.options?.avoidTolls
        }
      );
      
      // Get current pricing factors
      const factors = this.getCurrentPricingFactors(routeDetails);
      
      // Find distance band and base fare
      const distanceBandId = this.findDistanceBand(factors.actualDistance);
      const baseFare = this.getBaseFare(request.vehicleClassId, distanceBandId);
      
      // Calculate dynamic adjustments
      const distanceCharge = baseFare;
      const timeMultiplier = factors.trafficMultiplier * factors.demandMultiplier;
      const demandSurcharge = baseFare * (factors.demandMultiplier - 1);
      const weatherSurcharge = 0; // Can be added based on weather conditions
      const fuelSurcharge = baseFare * (factors.fuelPriceIndex - 1) * 0.1;
      
      // Calculate subtotal before extra services
      const baseSubtotal = Math.round(
        (baseFare * timeMultiplier) + demandSurcharge + weatherSurcharge + fuelSurcharge
      );
      
      // Calculate extra services
      const extraServiceCharges = request.extraServices 
        ? this.calculateExtraServices(request.extraServices, baseSubtotal)
        : [];
      
      const extraServicesTotal = extraServiceCharges.reduce(
        (sum, charge) => sum + charge.totalPrice, 0
      );
      
      // Calculate totals
      const subtotal = baseSubtotal + extraServicesTotal;
      const taxes = Math.round(subtotal * 0.15); // 15% VAT
      const total = subtotal + taxes;
      
      // Create price breakdown
      const priceBreakdown: PriceBreakdownItem[] = [
        {
          category: 'Base Fare',
          description: `${VEHICLE_CLASSES.find(v => v.id === request.vehicleClassId)?.name} - ${factors.baseDistance}km`,
          amount: baseFare
        },
        {
          category: 'Time & Traffic',
          description: `${factors.traffic} traffic, ${factors.timeOfDay} hours`,
          amount: Math.round(baseFare * (timeMultiplier - 1)),
          percentage: Math.round((timeMultiplier - 1) * 100)
        }
      ];
      
      if (demandSurcharge > 0) {
        priceBreakdown.push({
          category: 'Demand Surcharge',
          description: `${factors.season} season, ${factors.dayOfWeek}`,
          amount: Math.round(demandSurcharge),
          percentage: Math.round((factors.demandMultiplier - 1) * 100)
        });
      }
      
      if (fuelSurcharge > 0) {
        priceBreakdown.push({
          category: 'Fuel Adjustment',
          description: 'Current fuel price index',
          amount: Math.round(fuelSurcharge)
        });
      }
      
      extraServiceCharges.forEach(charge => {
        priceBreakdown.push({
          category: 'Extra Service',
          description: charge.name,
          amount: charge.totalPrice
        });
      });
      
      priceBreakdown.push({
        category: 'VAT',
        description: '15% Value Added Tax',
        amount: taxes,
        percentage: 15
      });
      
      // Calculate confidence based on data quality
      let confidence = 90;
      if (!this.googleMaps) confidence -= 20; // No real-time traffic data
      if (factors.actualDistance > 500) confidence -= 10; // Long distance less predictable
      if (factors.traffic === 'heavy') confidence -= 5; // Heavy traffic adds uncertainty
      
      // Price valid for 30 minutes
      const validUntil = new Date();
      validUntil.setMinutes(validUntil.getMinutes() + 30);
      
      return {
        baseFare,
        distanceCharge,
        timeMultiplier,
        demandSurcharge,
        weatherSurcharge,
        fuelSurcharge,
        extraServices: extraServiceCharges,
        subtotal,
        taxes,
        total,
        priceBreakdown,
        validUntil,
        confidence
      };
      
    } catch (error) {
      throw new Error(`Price calculation failed: ${error.message}`);
    }
  }

  /**
   * Get live price update (for real-time pricing during booking)
   */
  async getLivePriceUpdate(
    baseEstimate: EnhancedPriceEstimate,
    request: {
      origin: string | google.maps.LatLng;
      destination: string | google.maps.LatLng;
      vehicleClassId: string;
    }
  ): Promise<{ newTotal: number; changePercent: number; factors: string[] }> {
    try {
      const newEstimate = await this.calculateEnhancedPrice(request);
      const changePercent = ((newEstimate.total - baseEstimate.total) / baseEstimate.total) * 100;
      
      const factors: string[] = [];
      if (Math.abs(changePercent) > 5) {
        if (newEstimate.demandSurcharge > baseEstimate.demandSurcharge) {
          factors.push('Increased demand');
        }
        if (newEstimate.timeMultiplier > baseEstimate.timeMultiplier) {
          factors.push('Traffic conditions worsened');
        }
      }
      
      return {
        newTotal: newEstimate.total,
        changePercent: Math.round(changePercent * 100) / 100,
        factors
      };
    } catch (error) {
      return {
        newTotal: baseEstimate.total,
        changePercent: 0,
        factors: ['Unable to update price']
      };
    }
  }
}

// Export singleton instance
export const pricingCalculator = new EnhancedPricingCalculator();
