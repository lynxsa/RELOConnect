import { pricingApi, bookingApi, PriceEstimateRequest, ExtraServices, Location } from './api';
import { AdvancedPricingEngine, PricingParameters, AdvancedPriceBreakdown } from './advancedPricingEngine';

// Enhanced booking service that combines frontend and backend pricing
export class IntegratedBookingService {
  private pricingEngine: AdvancedPricingEngine;
  
  constructor() {
    this.pricingEngine = new AdvancedPricingEngine();
  }

  /**
   * Calculate comprehensive price estimate using both frontend and backend pricing
   */
  async calculatePriceEstimate(
    pickupLocation: Location,
    dropoffLocation: Location,
    vehicleClassId: string,
    extraServices: ExtraServices,
    scheduledDate?: Date
  ): Promise<{
    frontendEstimate: AdvancedPriceBreakdown;
    backendEstimate?: any;
    recommendedPrice: number;
    confidence: number;
    breakdown: any[];
    warnings: string[];
  }> {
    const warnings: string[] = [];
    
    try {
      // 1. Calculate frontend estimate using advanced pricing engine
      const distance = this.calculateDistance(pickupLocation, dropoffLocation);
      
      const params: PricingParameters = {
        origin: {
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude,
          address: pickupLocation.address,
          city: pickupLocation.city,
          state: pickupLocation.state,
          postalCode: pickupLocation.postalCode,
          country: pickupLocation.country,
        },
        destination: {
          latitude: dropoffLocation.latitude,
          longitude: dropoffLocation.longitude,
          address: dropoffLocation.address,
          city: dropoffLocation.city,
          state: dropoffLocation.state,
          postalCode: dropoffLocation.postalCode,
          country: dropoffLocation.country,
        },
        vehicleClassId,
        extraServices: [
          ...(extraServices.loading ? [{
            serviceId: 'loading',
            quantity: extraServices.loadingPeople || 1,
            priority: 'normal' as const,
          }] : []),
          ...(extraServices.stairs && extraServices.stairs > 0 ? [{
            serviceId: 'stairs',
            quantity: extraServices.stairs,
            priority: 'normal' as const,
          }] : []),
          ...(extraServices.packing ? [{
            serviceId: 'packing',
            quantity: 1,
            priority: 'normal' as const,
          }] : []),
          ...(extraServices.cleaning ? [{
            serviceId: 'cleaning',
            quantity: 1,
            priority: 'normal' as const,
          }] : []),
          ...(extraServices.express ? [{
            serviceId: 'express',
            quantity: 1,
            priority: 'high' as const,
          }] : []),
          ...(extraServices.insurance ? [{
            serviceId: 'insurance',
            quantity: 1,
            priority: 'normal' as const,
          }] : []),
          ...(extraServices.waitingTime && extraServices.waitingTime > 0 ? [{
            serviceId: 'waitingTime',
            quantity: extraServices.waitingTime,
            priority: 'normal' as const,
          }] : []),
        ],
        scheduledDateTime: scheduledDate || new Date(),
        routePreferences: {
          avoidTolls: false,
          avoidHighways: false,
          preferScenicRoute: false,
          maximumDetour: 10,
        },
        marketConditions: {
          demandLevel: 'normal',
          urgencyFactor: 1.0,
        },
        customerProfile: {
          tier: 'regular' as const,
          loyaltyScore: 5.0,
          creditRating: 'good' as const,
          pastBookings: 0,
        },
      };

      const frontendEstimate = await this.pricingEngine.calculateAdvancedPricing(params);

      // 2. Try to get backend estimate for comparison
      let backendEstimate;
      try {
        const backendRequest: PriceEstimateRequest = {
          distance,
          vehicleClassId,
          extraServices,
          pickupLocation,
          dropoffLocation,
        };
        
        const backendResponse = await pricingApi.calculateEstimate(backendRequest);
        backendEstimate = backendResponse.priceBreakdown;
      } catch (error) {
        console.warn('Backend pricing not available, using frontend estimate only:', error);
        warnings.push('Live pricing temporarily unavailable, using cached rates');
      }

      // 3. Determine recommended price and confidence
      let recommendedPrice = frontendEstimate.total;
      let confidence = frontendEstimate.confidence;

      if (backendEstimate) {
        // If both estimates are available, use a weighted average
        const backendPrice = backendEstimate.total;
        const priceDifference = Math.abs(frontendEstimate.total - backendPrice);
        const percentageDifference = (priceDifference / frontendEstimate.total) * 100;

        if (percentageDifference < 10) {
          // Prices are close, use backend price as it's more up-to-date
          recommendedPrice = backendPrice;
          confidence = Math.max(confidence, 90);
        } else if (percentageDifference < 25) {
          // Moderate difference, use weighted average favoring backend
          recommendedPrice = (frontendEstimate.total * 0.3) + (backendPrice * 0.7);
          confidence = Math.max(confidence - 10, 70);
          warnings.push(`Price estimates vary by ${percentageDifference.toFixed(1)}%`);
        } else {
          // Large difference, use frontend but reduce confidence
          confidence = Math.max(confidence - 20, 50);
          warnings.push('Significant price variation detected, contact for quote');
        }
      }

      // 4. Create comprehensive breakdown
      const breakdown = [
        {
          category: 'Base Fare',
          amount: frontendEstimate.baseFare,
          description: `${distance.toFixed(1)}km journey`,
        },
        ...frontendEstimate.extraServices.map((service) => ({
          category: `Extra Service: ${service.name}`,
          amount: service.totalPrice,
          description: this.getServiceDescription(service.serviceId, extraServices),
        })),
        ...frontendEstimate.priceBreakdown.filter(item => !item.isDiscount).map((item) => ({
          category: item.category,
          amount: item.amount,
          description: item.description,
        })),
        {
          category: 'VAT (15%)',
          amount: frontendEstimate.taxes,
          description: 'Value Added Tax',
        },
      ];

      return {
        frontendEstimate,
        backendEstimate,
        recommendedPrice,
        confidence,
        breakdown,
        warnings,
      };
    } catch (error) {
      console.error('Error calculating price estimate:', error);
      throw new Error('Failed to calculate price estimate');
    }
  }

  /**
   * Create a booking with the calculated price
   */
  async createBooking(
    pickupLocation: Location,
    dropoffLocation: Location,
    vehicleClassId: string,
    extraServices: ExtraServices,
    scheduledDate: Date,
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    },
    notes?: string
  ) {
    try {
      // Calculate final price estimate
      const priceEstimate = await this.calculatePriceEstimate(
        pickupLocation,
        dropoffLocation,
        vehicleClassId,
        extraServices,
        scheduledDate
      );

      // Create booking with backend API
      const booking = await bookingApi.createBooking({
        pickupLocation,
        dropoffLocation,
        vehicleClassId,
        extraServices,
        scheduledDate: scheduledDate.toISOString(),
        customerInfo,
        notes,
      });

      return {
        booking,
        priceEstimate,
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      throw new Error('Failed to create booking');
    }
  }

  /**
   * Get real-time vehicle tracking and pricing updates
   */
  async getBookingUpdates(bookingId: string) {
    try {
      const booking = await bookingApi.getBookingById(bookingId);
      
      // If booking is in progress, calculate live pricing updates
      if (['assigned', 'picked_up', 'in_transit'].includes(booking.status)) {
        const liveEstimate = await this.calculatePriceEstimate(
          booking.pickupLocation,
          booking.dropoffLocation,
          booking.vehicleClass.id,
          booking.extraServices
        );

        return {
          booking,
          liveEstimate,
        };
      }

      return { booking };
    } catch (error) {
      console.error('Error getting booking updates:', error);
      throw new Error('Failed to get booking updates');
    }
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(point1: Location, point2: Location): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(point2.latitude - point1.latitude);
    const dLon = this.toRad(point2.longitude - point1.longitude);
    const lat1 = this.toRad(point1.latitude);
    const lat2 = this.toRad(point2.latitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  /**
   * Get human-readable description for extra services
   */
  private getServiceDescription(service: string, extraServices: ExtraServices): string {
    switch (service) {
      case 'loading':
        return extraServices.loadingPeople 
          ? `Loading assistance (${extraServices.loadingPeople} people)`
          : 'Loading assistance';
      case 'stairs':
        return `Stairs (${extraServices.stairs} flights)`;
      case 'packing':
        return 'Professional packing service';
      case 'cleaning':
        return 'Post-move cleaning';
      case 'express':
        return 'Express delivery (same day)';
      case 'insurance':
        return extraServices.insuranceValue
          ? `Insurance coverage (R${extraServices.insuranceValue})`
          : 'Insurance coverage';
      case 'waitingTime':
        return extraServices.waitingTime
          ? `Waiting time (${extraServices.waitingTime} minutes)`
          : 'Additional waiting time';
      default:
        return service;
    }
  }

  /**
   * Get cached vehicle classes and extra services
   */
  async getServiceOptions() {
    try {
      const [vehicleClasses, extraServicesList] = await Promise.all([
        pricingApi.getVehicleClasses(),
        pricingApi.getExtraServices(),
      ]);

      return {
        vehicleClasses,
        extraServices: extraServicesList,
      };
    } catch (error) {
      console.error('Error fetching service options:', error);
      throw new Error('Failed to fetch service options');
    }
  }

  /**
   * Get user's booking history
   */
  async getUserBookings() {
    try {
      return await bookingApi.getUserBookings();
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw new Error('Failed to fetch booking history');
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string) {
    try {
      return await bookingApi.cancelBooking(bookingId);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw new Error('Failed to cancel booking');
    }
  }
}

// Singleton instance
export const integratedBookingService = new IntegratedBookingService();
