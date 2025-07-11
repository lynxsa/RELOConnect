/**
 * Advanced Pricing Engine for RELOConnect
 * 
 * This service implements sophisticated pricing algorithms while maintaining
 * compatibility with the current pricing structure. It includes:
 * - Dynamic surge pricing based on demand and real-time factors
 * - Machine learning-inspired confidence scoring
 * - Advanced route optimization and cost calculation
 * - Real-time market adjustments
 * - Comprehensive extra services handling
 */

import { VEHICLE_CLASSES, DISTANCE_BANDS, EXTRA_SERVICES, generateCompletePricingMatrix } from '../data/pricing';

// Advanced pricing interfaces
export interface AdvancedLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  placeId?: string;
  types?: string[];
}

export interface RouteOptimization {
  distance: number; // in km
  duration: number; // in minutes
  traffic: 'light' | 'moderate' | 'heavy' | 'severe';
  tollRoads: boolean;
  tollCost: number;
  fuelEfficiency: number; // km per liter
  roadConditions: 'excellent' | 'good' | 'fair' | 'poor';
  weatherImpact: number; // 0-1 multiplier
  constructionDelays: number; // in minutes
  alternativeRoutes: number;
  confidence: number; // 0-100%
}

export interface MarketConditions {
  demandLevel: 'very_low' | 'low' | 'normal' | 'high' | 'very_high';
  supplierAvailability: number; // 0-100%
  seasonalFactor: number; // 0.8-1.5 multiplier
  economicIndex: number; // 0.9-1.2 multiplier
  competitorPricing: number; // average market price
  customerSegment: 'budget' | 'standard' | 'premium' | 'enterprise';
  loyaltyDiscount: number; // 0-20%
  urgencyFactor: number; // 1.0-2.0 multiplier
}

export interface ExtraServiceRequest {
  serviceId: string;
  quantity: number;
  customValue?: number; // for percentage-based services
  scheduledTime?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
}

export interface PricingParameters {
  origin: AdvancedLocation;
  destination: AdvancedLocation;
  vehicleClassId: string;
  extraServices: ExtraServiceRequest[];
  scheduledDateTime: Date;
  marketConditions?: Partial<MarketConditions>;
  customerProfile?: {
    tier: 'new' | 'regular' | 'premium' | 'enterprise';
    loyaltyScore: number; // 0-100
    creditRating: 'excellent' | 'good' | 'fair' | 'poor';
    pastBookings: number;
  };
  routePreferences?: {
    avoidTolls: boolean;
    avoidHighways: boolean;
    preferScenicRoute: boolean;
    maximumDetour: number; // in km
  };
}

export interface AdvancedPriceBreakdown {
  // Base pricing
  baseFare: number;
  distanceCharge: number;
  durationCharge: number;
  
  // Dynamic adjustments
  surgeMultiplier: number;
  demandSurcharge: number;
  trafficSurcharge: number;
  weatherSurcharge: number;
  fuelSurcharge: number;
  seasonalAdjustment: number;
  
  // Service charges
  extraServices: Array<{
    serviceId: string;
    name: string;
    description: string;
    priceType: 'flat' | 'per_unit' | 'percentage';
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discountApplied: number;
  }>;
  
  // Fees and taxes
  serviceFee: number;
  taxes: number;
  discounts: number;
  
  // Totals
  subtotal: number;
  total: number;
  
  // Metadata
  priceBreakdown: Array<{
    category: string;
    description: string;
    amount: number;
    percentage?: number;
    isDiscount?: boolean;
  }>;
  confidence: number; // 0-100%
  validUntil: Date;
  quoteId: string;
  alternatives?: AdvancedPriceBreakdown[];
}

export class AdvancedPricingEngine {
  private pricingMatrix: any[];
  private fuelPriceIndex: number = 1.0;
  private marketDemandIndex: number = 1.0;
  private seasonalFactors: { [month: number]: number } = {
    0: 1.2,  // January (peak moving season)
    1: 1.1,  // February
    2: 1.0,  // March
    3: 0.9,  // April
    4: 0.9,  // May
    5: 0.8,  // June (winter)
    6: 0.8,  // July (winter)
    7: 0.9,  // August
    8: 1.1,  // September
    9: 1.2,  // October
    10: 1.3, // November (peak)
    11: 1.4  // December (peak holiday)
  };

  constructor() {
    this.pricingMatrix = generateCompletePricingMatrix();
    this.initializeMarketData();
  }

  private initializeMarketData() {
    // Initialize with current market conditions
    // In production, this would fetch from external APIs
    this.fuelPriceIndex = this.calculateFuelPriceIndex();
    this.marketDemandIndex = this.calculateDemandIndex();
  }

  /**
   * Calculate comprehensive price estimate with advanced algorithms
   */
  async calculateAdvancedPricing(params: PricingParameters): Promise<AdvancedPriceBreakdown> {
    try {
      // 1. Calculate route optimization
      const routeOptimization = await this.calculateRouteOptimization(params.origin, params.destination, params.routePreferences);
      
      // 2. Determine market conditions
      const marketConditions = this.calculateMarketConditions(params.scheduledDateTime, params.marketConditions);
      
      // 3. Get base fare from pricing matrix
      const baseFare = this.getBaseFareFromMatrix(params.vehicleClassId, routeOptimization.distance);
      
      // 4. Calculate dynamic adjustments
      const adjustments = this.calculateDynamicAdjustments(routeOptimization, marketConditions, params.scheduledDateTime);
      
      // 5. Calculate extra services with advanced pricing
      const extraServicesTotal = this.calculateExtraServices(params.extraServices, baseFare, params.customerProfile);
      
      // 6. Apply customer-specific adjustments
      const customerAdjustments = this.calculateCustomerAdjustments(params.customerProfile, baseFare);
      
      // 7. Calculate taxes and fees
      const feesAndTaxes = this.calculateFeesAndTaxes(baseFare, adjustments, extraServicesTotal);
      
      // 8. Compile final pricing
      return this.compileFinalPricing(
        baseFare,
        adjustments,
        extraServicesTotal,
        customerAdjustments,
        feesAndTaxes,
        routeOptimization,
        marketConditions,
        params
      );
    } catch (error) {
      console.error('Error calculating advanced pricing:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Pricing calculation failed: ${errorMessage}`);
    }
  }

  /**
   * Calculate route optimization with multiple factors
   */
  private async calculateRouteOptimization(
    origin: AdvancedLocation,
    destination: AdvancedLocation,
    preferences?: PricingParameters['routePreferences']
  ): Promise<RouteOptimization> {
    // Calculate base distance using Haversine formula
    const baseDistance = this.calculateHaversineDistance(origin, destination);
    
    // Apply route preference adjustments
    let adjustedDistance = baseDistance;
    let tollCost = 0;
    
    if (preferences?.avoidTolls) {
      adjustedDistance *= 1.15; // Detour factor for avoiding tolls
    } else {
      // Estimate toll costs based on distance and route
      tollCost = this.estimateTollCosts(baseDistance, origin, destination);
    }
    
    if (preferences?.avoidHighways) {
      adjustedDistance *= 1.25; // Longer route on secondary roads
    }
    
    // Calculate traffic conditions based on time and route
    const traffic = this.estimateTrafficConditions(origin, destination, new Date());
    
    // Estimate duration with traffic
    const baseDuration = adjustedDistance / 60; // Assume 60 km/h average
    const trafficMultiplier = this.getTrafficMultiplier(traffic);
    const duration = baseDuration * trafficMultiplier;
    
    return {
      distance: adjustedDistance,
      duration,
      traffic,
      tollRoads: !preferences?.avoidTolls && tollCost > 0,
      tollCost,
      fuelEfficiency: this.estimateFuelEfficiency(adjustedDistance),
      roadConditions: this.estimateRoadConditions(origin, destination),
      weatherImpact: this.getWeatherImpact(),
      constructionDelays: this.estimateConstructionDelays(origin, destination),
      alternativeRoutes: this.countAlternativeRoutes(origin, destination),
      confidence: this.calculateRouteConfidence(adjustedDistance, traffic)
    };
  }

  /**
   * Calculate current market conditions
   */
  private calculateMarketConditions(
    scheduledDateTime: Date,
    provided?: Partial<MarketConditions>
  ): MarketConditions {
    const hour = scheduledDateTime.getHours();
    const dayOfWeek = scheduledDateTime.getDay();
    const month = scheduledDateTime.getMonth();
    
    // Calculate demand level based on time patterns
    let demandLevel: MarketConditions['demandLevel'] = 'normal';
    
    // Peak hours (7-9 AM, 5-7 PM)
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      demandLevel = 'high';
    }
    
    // Weekend premium
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      demandLevel = demandLevel === 'high' ? 'very_high' : 'high';
    }
    
    // Seasonal adjustments
    const seasonalFactor = this.seasonalFactors[month] || 1.0;
    
    return {
      demandLevel: provided?.demandLevel || demandLevel,
      supplierAvailability: provided?.supplierAvailability || this.calculateSupplierAvailability(scheduledDateTime),
      seasonalFactor,
      economicIndex: provided?.economicIndex || 1.0,
      competitorPricing: provided?.competitorPricing || 0,
      customerSegment: provided?.customerSegment || 'standard',
      loyaltyDiscount: provided?.loyaltyDiscount || 0,
      urgencyFactor: provided?.urgencyFactor || this.calculateUrgencyFactor(scheduledDateTime)
    };
  }

  /**
   * Get base fare from pricing matrix with intelligent band selection
   */
  private getBaseFareFromMatrix(vehicleClassId: string, distance: number): number {
    // Find the appropriate distance band
    const distanceBand = DISTANCE_BANDS.find(band => {
      if (band.maxKm === null) {
        return distance >= band.minKm; // For 1000+ km band
      }
      return distance >= band.minKm && distance <= band.maxKm;
    });
    
    if (!distanceBand) {
      throw new Error(`No distance band found for ${distance} km`);
    }
    
    // Get pricing rate from matrix
    const rate = this.pricingMatrix.find(r => 
      r.vehicleClassId === vehicleClassId && r.distanceBandId === distanceBand.id
    );
    
    if (!rate) {
      throw new Error(`No pricing rate found for ${vehicleClassId} at ${distance} km`);
    }
    
    // For 1000+ km, return custom quote indicator
    if (distance > 1000 && rate.baseFare === 0) {
      throw new Error('Distance exceeds 1000 km, custom quote required');
    }
    
    return rate.baseFare;
  }

  /**
   * Calculate dynamic pricing adjustments
   */
  private calculateDynamicAdjustments(
    route: RouteOptimization,
    market: MarketConditions,
    scheduledDateTime: Date
  ) {
    // Surge multiplier based on demand and supply
    const surgeMultiplier = this.calculateSurgeMultiplier(market);
    
    // Traffic surcharge
    const trafficSurcharge = this.calculateTrafficSurcharge(route.traffic, route.duration);
    
    // Weather surcharge
    const weatherSurcharge = route.weatherImpact > 0.1 ? route.weatherImpact * 100 : 0;
    
    // Fuel surcharge based on current index
    const fuelSurcharge = (this.fuelPriceIndex - 1) * 50; // R50 per 0.1 index point
    
    // Demand surcharge
    const demandSurcharge = this.calculateDemandSurcharge(market.demandLevel);
    
    // Seasonal adjustment
    const seasonalAdjustment = (market.seasonalFactor - 1) * 100;
    
    return {
      surgeMultiplier,
      demandSurcharge,
      trafficSurcharge,
      weatherSurcharge,
      fuelSurcharge,
      seasonalAdjustment
    };
  }

  /**
   * Calculate extra services with advanced pricing logic
   */
  private calculateExtraServices(
    services: ExtraServiceRequest[],
    baseFare: number,
    customerProfile?: PricingParameters['customerProfile']
  ) {
    return services.map(service => {
      const serviceConfig = EXTRA_SERVICES.find(s => s.id === service.serviceId);
      if (!serviceConfig) {
        throw new Error(`Extra service ${service.serviceId} not found`);
      }
      
      let unitPrice = serviceConfig.price;
      let totalPrice = 0;
      
      // Apply pricing logic based on service type
      switch (serviceConfig.priceType) {
        case 'flat':
          totalPrice = unitPrice;
          break;
        case 'per_unit':
          totalPrice = unitPrice * service.quantity;
          break;
        case 'percentage':
          const baseValue = service.customValue || baseFare;
          totalPrice = (unitPrice / 100) * baseValue;
          break;
      }
      
      // Apply priority surcharge
      if (service.priority === 'urgent') {
        totalPrice *= 1.5;
      } else if (service.priority === 'high') {
        totalPrice *= 1.25;
      }
      
      // Apply customer discounts
      let discountApplied = 0;
      if (customerProfile?.tier === 'premium') {
        discountApplied = totalPrice * 0.1; // 10% discount
        totalPrice *= 0.9;
      } else if (customerProfile?.tier === 'enterprise') {
        discountApplied = totalPrice * 0.15; // 15% discount
        totalPrice *= 0.85;
      }
      
      return {
        serviceId: service.serviceId,
        name: serviceConfig.name,
        description: serviceConfig.description,
        priceType: serviceConfig.priceType,
        quantity: service.quantity,
        unitPrice,
        totalPrice,
        discountApplied
      };
    });
  }

  /**
   * Calculate customer-specific adjustments
   */
  private calculateCustomerAdjustments(
    customerProfile?: PricingParameters['customerProfile'],
    baseFare: number = 0
  ) {
    if (!customerProfile) {
      return { loyaltyDiscount: 0, creditAdjustment: 0, volumeDiscount: 0 };
    }
    
    // Loyalty discount based on score
    const loyaltyDiscount = (customerProfile.loyaltyScore / 100) * 0.1 * baseFare;
    
    // Credit rating adjustment
    let creditAdjustment = 0;
    if (customerProfile.creditRating === 'poor') {
      creditAdjustment = baseFare * 0.05; // 5% surcharge
    }
    
    // Volume discount for frequent customers
    let volumeDiscount = 0;
    if (customerProfile.pastBookings > 50) {
      volumeDiscount = baseFare * 0.05; // 5% volume discount
    } else if (customerProfile.pastBookings > 20) {
      volumeDiscount = baseFare * 0.03; // 3% volume discount
    }
    
    return { loyaltyDiscount, creditAdjustment, volumeDiscount };
  }

  /**
   * Calculate fees and taxes
   */
  private calculateFeesAndTaxes(baseFare: number, adjustments: any, extraServices: any[]) {
    const subtotal = baseFare + 
      Object.values(adjustments).reduce((sum: number, adj: any) => sum + (typeof adj === 'number' ? adj : 0), 0) +
      extraServices.reduce((sum, service) => sum + service.totalPrice, 0);
    
    // Service fee (fixed)
    const serviceFee = 50; // R50 service fee
    
    // VAT calculation (15% in South Africa)
    const taxes = subtotal * 0.15;
    
    return { serviceFee, taxes };
  }

  /**
   * Compile final pricing breakdown
   */
  private compileFinalPricing(
    baseFare: number,
    adjustments: any,
    extraServices: any[],
    customerAdjustments: any,
    feesAndTaxes: any,
    route: RouteOptimization,
    market: MarketConditions,
    params: PricingParameters
  ): AdvancedPriceBreakdown {
    // Calculate subtotal
    const subtotal = baseFare + 
      Object.values(adjustments).reduce((sum: number, adj: any) => sum + (typeof adj === 'number' ? adj : 0), 0) +
      extraServices.reduce((sum, service) => sum + service.totalPrice, 0);
    
    // Apply discounts
    const totalDiscounts = customerAdjustments.loyaltyDiscount + customerAdjustments.volumeDiscount;
    
    // Calculate final total
    const total = subtotal - totalDiscounts + customerAdjustments.creditAdjustment + feesAndTaxes.serviceFee + feesAndTaxes.taxes;
    
    // Generate price breakdown
    const priceBreakdown = this.generatePriceBreakdown(baseFare, adjustments, extraServices, customerAdjustments, feesAndTaxes);
    
    // Calculate confidence score
    const confidence = this.calculatePricingConfidence(route, market, params);
    
    return {
      baseFare,
      distanceCharge: route.distance * 2, // R2 per km
      durationCharge: route.duration * 1.5, // R1.50 per minute
      surgeMultiplier: adjustments.surgeMultiplier,
      demandSurcharge: adjustments.demandSurcharge,
      trafficSurcharge: adjustments.trafficSurcharge,
      weatherSurcharge: adjustments.weatherSurcharge,
      fuelSurcharge: adjustments.fuelSurcharge,
      seasonalAdjustment: adjustments.seasonalAdjustment,
      extraServices,
      serviceFee: feesAndTaxes.serviceFee,
      taxes: feesAndTaxes.taxes,
      discounts: totalDiscounts,
      subtotal,
      total,
      priceBreakdown,
      confidence,
      validUntil: new Date(Date.now() + 30 * 60 * 1000), // Valid for 30 minutes
      quoteId: this.generateQuoteId()
    };
  }

  // Helper methods for calculations
  private calculateHaversineDistance(origin: AdvancedLocation, destination: AdvancedLocation): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(destination.latitude - origin.latitude);
    const dLon = this.deg2rad(destination.longitude - origin.longitude);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(origin.latitude)) * Math.cos(this.deg2rad(destination.latitude)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private calculateFuelPriceIndex(): number {
    // In production, this would fetch from fuel price APIs
    return 1.0 + Math.random() * 0.2; // Simulate 0-20% variance
  }

  private calculateDemandIndex(): number {
    // In production, this would analyze booking patterns
    return 0.8 + Math.random() * 0.4; // Simulate 80-120% demand
  }

  private estimateTrafficConditions(origin: AdvancedLocation, destination: AdvancedLocation, time: Date): RouteOptimization['traffic'] {
    const hour = time.getHours();
    const dayOfWeek = time.getDay();
    
    // Simple traffic estimation based on time
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return dayOfWeek >= 1 && dayOfWeek <= 5 ? 'heavy' : 'moderate';
    } else if (hour >= 22 || hour <= 5) {
      return 'light';
    }
    return 'moderate';
  }

  private getTrafficMultiplier(traffic: RouteOptimization['traffic']): number {
    switch (traffic) {
      case 'light': return 1.0;
      case 'moderate': return 1.2;
      case 'heavy': return 1.5;
      case 'severe': return 2.0;
      default: return 1.2;
    }
  }

  private calculateSurgeMultiplier(market: MarketConditions): number {
    const demandMultipliers = {
      'very_low': 0.9,
      'low': 0.95,
      'normal': 1.0,
      'high': 1.15,
      'very_high': 1.3
    };
    
    const supplyFactor = (100 - market.supplierAvailability) / 100;
    return demandMultipliers[market.demandLevel] + (supplyFactor * 0.2);
  }

  private calculateTrafficSurcharge(traffic: RouteOptimization['traffic'], duration: number): number {
    const baseSurcharge = {
      'light': 0,
      'moderate': 50,
      'heavy': 100,
      'severe': 200
    };
    
    return baseSurcharge[traffic] + (duration > 120 ? (duration - 120) * 0.5 : 0);
  }

  private calculateDemandSurcharge(demandLevel: MarketConditions['demandLevel']): number {
    const surcharges = {
      'very_low': -50,
      'low': -25,
      'normal': 0,
      'high': 50,
      'very_high': 100
    };
    
    return surcharges[demandLevel];
  }

  private calculateSupplierAvailability(scheduledDateTime: Date): number {
    // Simulate supplier availability based on time
    const hour = scheduledDateTime.getHours();
    if (hour >= 22 || hour <= 5) return 30; // Low availability at night
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) return 60; // Peak hours
    return 85; // Normal hours
  }

  private calculateUrgencyFactor(scheduledDateTime: Date): number {
    const now = new Date();
    const timeDiff = scheduledDateTime.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff < 2) return 2.0; // Very urgent
    if (hoursDiff < 6) return 1.5; // Urgent
    if (hoursDiff < 24) return 1.2; // Same day
    return 1.0; // Normal
  }

  private estimateTollCosts(distance: number, origin: AdvancedLocation, destination: AdvancedLocation): number {
    // Estimate toll costs based on major routes in South Africa
    if (distance > 100) return distance * 0.8; // Approximate R0.80 per km for long distance
    if (distance > 50) return distance * 0.5; // R0.50 per km for medium distance
    return 0; // No tolls for short distances
  }

  private estimateFuelEfficiency(distance: number): number {
    // Vehicle-specific fuel efficiency (km per liter)
    return 8 + Math.random() * 4; // 8-12 km/l range
  }

  private estimateRoadConditions(origin: AdvancedLocation, destination: AdvancedLocation): RouteOptimization['roadConditions'] {
    // Simplified road condition estimation
    return 'good'; // Default to good conditions
  }

  private getWeatherImpact(): number {
    // Simulate weather impact (0-1 multiplier)
    return Math.random() * 0.3; // 0-30% impact
  }

  private estimateConstructionDelays(origin: AdvancedLocation, destination: AdvancedLocation): number {
    // Simulate construction delays in minutes
    return Math.random() < 0.2 ? Math.random() * 30 : 0; // 20% chance of 0-30 min delay
  }

  private countAlternativeRoutes(origin: AdvancedLocation, destination: AdvancedLocation): number {
    // Simulate number of alternative routes
    return Math.floor(Math.random() * 3) + 1; // 1-3 alternatives
  }

  private calculateRouteConfidence(distance: number, traffic: RouteOptimization['traffic']): number {
    let confidence = 90; // Base confidence
    
    if (distance > 500) confidence -= 10; // Long distance reduces confidence
    if (traffic === 'heavy' || traffic === 'severe') confidence -= 15;
    
    return Math.max(confidence, 60); // Minimum 60% confidence
  }

  private calculatePricingConfidence(route: RouteOptimization, market: MarketConditions, params: PricingParameters): number {
    let confidence = route.confidence;
    
    // Adjust based on market volatility
    if (market.demandLevel === 'very_high' || market.demandLevel === 'very_low') {
      confidence -= 10;
    }
    
    // Adjust based on scheduling
    const timeDiff = params.scheduledDateTime.getTime() - Date.now();
    if (timeDiff > 7 * 24 * 60 * 60 * 1000) { // More than a week
      confidence -= 15;
    }
    
    return Math.max(confidence, 50); // Minimum 50% confidence
  }

  private generatePriceBreakdown(baseFare: number, adjustments: any, extraServices: any[], customerAdjustments: any, feesAndTaxes: any): Array<{
    category: string;
    description: string;
    amount: number;
    percentage?: number;
    isDiscount?: boolean;
  }> {
    const breakdown: Array<{
      category: string;
      description: string;
      amount: number;
      percentage?: number;
      isDiscount?: boolean;
    }> = [
      { category: 'Base Fare', description: 'Vehicle and distance charge', amount: baseFare },
      { category: 'Fuel Surcharge', description: 'Current fuel price adjustment', amount: adjustments.fuelSurcharge },
      { category: 'Demand Adjustment', description: 'Market demand adjustment', amount: adjustments.demandSurcharge },
      { category: 'Traffic Surcharge', description: 'Traffic condition surcharge', amount: adjustments.trafficSurcharge },
      { category: 'Weather Surcharge', description: 'Weather impact adjustment', amount: adjustments.weatherSurcharge },
      { category: 'Seasonal Adjustment', description: 'Seasonal pricing adjustment', amount: adjustments.seasonalAdjustment }
    ];
    
    // Add extra services
    extraServices.forEach(service => {
      breakdown.push({
        category: 'Extra Service',
        description: service.name,
        amount: service.totalPrice
      });
    });
    
    // Add discounts
    if (customerAdjustments.loyaltyDiscount > 0) {
      breakdown.push({
        category: 'Loyalty Discount',
        description: 'Customer loyalty discount',
        amount: -customerAdjustments.loyaltyDiscount,
        isDiscount: true
      });
    }
    
    if (customerAdjustments.volumeDiscount > 0) {
      breakdown.push({
        category: 'Volume Discount',
        description: 'Frequent customer discount',
        amount: -customerAdjustments.volumeDiscount,
        isDiscount: true
      });
    }
    
    // Add fees
    breakdown.push(
      { category: 'Service Fee', description: 'Platform service fee', amount: feesAndTaxes.serviceFee },
      { category: 'VAT', description: 'Value Added Tax (15%)', amount: feesAndTaxes.taxes }
    );
    
    return breakdown;
  }

  private generateQuoteId(): string {
    return `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
}

// Export singleton instance
export const advancedPricingEngine = new AdvancedPricingEngine();
