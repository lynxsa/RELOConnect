/**
 * Complete Pricing Data Structure for RELOConnect
 * 
 * This file contains the complete pricing matrix and extra services
 * that are used by the frontend pricing engine.
 */

// RELOConnect Pricing Data Structure
export interface VehicleClass {
  id: string;
  name: string;
  capacity: string;
  maxWeight: number; // in kg
  icon: string;
  description: string;
  order: number;
}

export interface DistanceBand {
  id: string;
  minKm: number;
  maxKm: number | null; // null for "1000+" band
  label: string;
}

export interface PricingRate {
  id: string;
  vehicleClassId: string;
  distanceBandId: string;
  baseFare: number; // in ZAR
}

export interface ExtraService {
  id: string;
  name: string;
  code: string;
  description: string;
  priceType: 'flat' | 'per_unit' | 'percentage';
  price: number;
  unit?: string;
  icon: string;
}

// Import for local use in this file
// Import types are already defined above - removing backend dependency

// Vehicle Classes (8 classes)
export const VEHICLE_CLASSES: VehicleClass[] = [
  {
    id: 'mini-van',
    name: 'Mini-Van',
    capacity: '<1 ton',
    maxWeight: 1000,
    icon: '🚐',
    description: 'Perfect for small moves and deliveries',
    order: 1
  },
  {
    id: '1-ton-truck',
    name: '1 Ton Truck',
    capacity: '1 ton',
    maxWeight: 1000,
    icon: '🚚',
    description: 'Ideal for small furniture and appliances',
    order: 2
  },
  {
    id: '1.5-ton-truck',
    name: '1.5 Ton Truck',
    capacity: '1.5 ton',
    maxWeight: 1500,
    icon: '🚛',
    description: 'Great for studio apartments',
    order: 3
  },
  {
    id: '2-ton-truck',
    name: '2 Ton Truck',
    capacity: '2 ton',
    maxWeight: 2000,
    icon: '🚚',
    description: 'Perfect for 1-2 bedroom moves',
    order: 4
  },
  {
    id: '4-ton-truck',
    name: '4 Ton Truck',
    capacity: '4 ton',
    maxWeight: 4000,
    icon: '🚛',
    description: 'Suitable for 2-3 bedroom homes',
    order: 5
  },
  {
    id: '5-ton-truck',
    name: '5 Ton Truck',
    capacity: '5 ton',
    maxWeight: 5000,
    icon: '🚚',
    description: 'Great for larger homes',
    order: 6
  },
  {
    id: '8-ton-truck',
    name: '8 Ton Truck',
    capacity: '8 ton',
    maxWeight: 8000,
    icon: '🚛',
    description: 'For commercial and large moves',
    order: 7
  },
  {
    id: '10-ton-truck',
    name: '10 Ton Truck',
    capacity: '10 ton',
    maxWeight: 10000,
    icon: '🚚',
    description: 'Heavy-duty commercial transport',
    order: 8
  }
];

// Distance Bands
export const DISTANCE_BANDS: DistanceBand[] = [
  { id: 'band-0-5', minKm: 0, maxKm: 5, label: '0 – 5 km' },
  { id: 'band-5-10', minKm: 5, maxKm: 10, label: '5 – 10 km' },
  { id: 'band-10-15', minKm: 10, maxKm: 15, label: '10 – 15 km' },
  { id: 'band-15-20', minKm: 15, maxKm: 20, label: '15 – 20 km' },
  { id: 'band-20-25', minKm: 20, maxKm: 25, label: '20 – 25 km' },
  { id: 'band-25-30', minKm: 25, maxKm: 30, label: '25 – 30 km' },
  { id: 'band-30-40', minKm: 30, maxKm: 40, label: '30 – 40 km' },
  { id: 'band-40-50', minKm: 40, maxKm: 50, label: '40 – 50 km' },
  { id: 'band-50-60', minKm: 50, maxKm: 60, label: '50 – 60 km' },
  { id: 'band-60-70', minKm: 60, maxKm: 70, label: '60 – 70 km' },
  { id: 'band-70-80', minKm: 70, maxKm: 80, label: '70 – 80 km' },
  { id: 'band-80-90', minKm: 80, maxKm: 90, label: '80 – 90 km' },
  { id: 'band-90-100', minKm: 90, maxKm: 100, label: '90 – 100 km' },
  { id: 'band-100-125', minKm: 100, maxKm: 125, label: '100 – 125 km' },
  { id: 'band-125-150', minKm: 125, maxKm: 150, label: '125 – 150 km' },
  { id: 'band-150-175', minKm: 150, maxKm: 175, label: '150 – 175 km' },
  { id: 'band-175-200', minKm: 175, maxKm: 200, label: '175 – 200 km' },
  { id: 'band-200-250', minKm: 200, maxKm: 250, label: '200 – 250 km' },
  { id: 'band-250-300', minKm: 250, maxKm: 300, label: '250 – 300 km' },
  { id: 'band-300-400', minKm: 300, maxKm: 400, label: '300 – 400 km' },
  { id: 'band-400-500', minKm: 400, maxKm: 500, label: '400 – 500 km' },
  { id: 'band-500-600', minKm: 500, maxKm: 600, label: '500 – 600 km' },
  { id: 'band-600-800', minKm: 600, maxKm: 800, label: '600 – 800 km' },
  { id: 'band-800-1000', minKm: 800, maxKm: 1000, label: '800 – 1 000 km' },
  { id: 'band-1000-plus', minKm: 1000, maxKm: null, label: '1 000+ km' }
];

// Extra Services
export const EXTRA_SERVICES: ExtraService[] = [
  {
    id: 'loading-service',
    name: 'Loading / Unloading',
    code: 'LOADING',
    description: 'Professional loading and unloading service',
    priceType: 'flat',
    price: 350,
    unit: 'person',
    icon: '👷'
  },
  {
    id: 'stairs',
    name: 'Stair Flights',
    code: 'STAIRS',
    description: 'Additional charge per flight of stairs',
    priceType: 'flat',
    price: 150,
    unit: 'flight',
    icon: '🪜'
  },
  {
    id: 'packing',
    name: 'Boxes & Bubble-Wrap',
    code: 'PACKING',
    description: '10 boxes + bubble wrap package',
    priceType: 'flat',
    price: 200,
    icon: '📦'
  },
  {
    id: 'cleaning',
    name: 'Cleaning Service',
    code: 'CLEANING',
    description: 'Professional cleaning service',
    priceType: 'flat',
    price: 500,
    icon: '🧽'
  },
  {
    id: 'express',
    name: 'Express Delivery',
    code: 'EXPRESS',
    description: 'Same-day delivery service',
    priceType: 'flat',
    price: 500,
    icon: '⚡'
  },
  {
    id: 'insurance',
    name: 'Insurance',
    code: 'INSURANCE',
    description: 'Comprehensive item insurance',
    priceType: 'percentage',
    price: 5, // 5%
    icon: '🛡️'
  },
  {
    id: 'waiting-time',
    name: 'Waiting Time',
    code: 'WAITING',
    description: 'Additional waiting time charge',
    priceType: 'flat',
    price: 100,
    unit: '15min',
    icon: '⏰'
  }
];

// Additional frontend-specific pricing utilities
export interface PricingConfiguration {
  currency: string;
  taxRate: number; // VAT rate in South Africa
  serviceFee: number; // Fixed service fee
  minimumOrder: number; // Minimum order value
  fuelSurchargeEnabled: boolean;
  dynamicPricingEnabled: boolean;
  loyaltyDiscountEnabled: boolean;
}

export const PRICING_CONFIG: PricingConfiguration = {
  currency: 'ZAR',
  taxRate: 0.15, // 15% VAT
  serviceFee: 50, // R50 service fee
  minimumOrder: 500, // R500 minimum order
  fuelSurchargeEnabled: true,
  dynamicPricingEnabled: true,
  loyaltyDiscountEnabled: true,
};

// Time-based pricing multipliers
export interface TimeMultipliers {
  peakHours: number; // 7-9 AM, 5-7 PM
  offPeakHours: number; // Normal business hours
  nightHours: number; // 10 PM - 6 AM
  weekendMultiplier: number; // Saturday-Sunday
  holidayMultiplier: number; // Public holidays
}

export const TIME_MULTIPLIERS: TimeMultipliers = {
  peakHours: 1.15, // 15% surcharge
  offPeakHours: 1.0, // Base rate
  nightHours: 1.25, // 25% surcharge
  weekendMultiplier: 1.1, // 10% surcharge
  holidayMultiplier: 1.3, // 30% surcharge
};

// Distance-based adjustments for precise pricing
export interface DistanceAdjustments {
  shortDistanceMinimum: number; // Minimum charge for very short distances
  longDistanceDiscount: number; // Discount for distances > 500km
  crossProvinceMultiplier: number; // Inter-provincial moves
  ruralAreaMultiplier: number; // Rural delivery surcharge
}

export const DISTANCE_ADJUSTMENTS: DistanceAdjustments = {
  shortDistanceMinimum: 650, // Minimum R650 for any move
  longDistanceDiscount: 0.95, // 5% discount for 500+ km
  crossProvinceMultiplier: 1.1, // 10% surcharge
  ruralAreaMultiplier: 1.15, // 15% surcharge
};

// Vehicle capacity and weight limits for validation
export interface VehicleCapacity {
  [vehicleId: string]: {
    maxWeight: number; // in kg
    maxVolume: number; // in cubic meters
    loadingHeight: number; // in meters
    crewSize: number; // number of crew members
    fuelConsumption: number; // liters per 100km
  };
}

export const VEHICLE_CAPACITIES: VehicleCapacity = {
  'mini-van': {
    maxWeight: 1000,
    maxVolume: 8,
    loadingHeight: 1.8,
    crewSize: 1,
    fuelConsumption: 12,
  },
  '1-ton-truck': {
    maxWeight: 1000,
    maxVolume: 12,
    loadingHeight: 2.0,
    crewSize: 2,
    fuelConsumption: 15,
  },
  '1.5-ton-truck': {
    maxWeight: 1500,
    maxVolume: 18,
    loadingHeight: 2.2,
    crewSize: 2,
    fuelConsumption: 18,
  },
  '2-ton-truck': {
    maxWeight: 2000,
    maxVolume: 24,
    loadingHeight: 2.4,
    crewSize: 2,
    fuelConsumption: 20,
  },
  '4-ton-truck': {
    maxWeight: 4000,
    maxVolume: 36,
    loadingHeight: 2.6,
    crewSize: 3,
    fuelConsumption: 25,
  },
  '5-ton-truck': {
    maxWeight: 5000,
    maxVolume: 45,
    loadingHeight: 2.8,
    crewSize: 3,
    fuelConsumption: 28,
  },
  '8-ton-truck': {
    maxWeight: 8000,
    maxVolume: 60,
    loadingHeight: 3.0,
    crewSize: 4,
    fuelConsumption: 35,
  },
  '10-ton-truck': {
    maxWeight: 10000,
    maxVolume: 80,
    loadingHeight: 3.2,
    crewSize: 4,
    fuelConsumption: 40,
  },
};

// Regional pricing adjustments
export interface RegionalPricing {
  [region: string]: {
    baseFareMultiplier: number;
    fuelCostMultiplier: number;
    laborCostMultiplier: number;
    demandMultiplier: number;
  };
}

export const REGIONAL_PRICING: RegionalPricing = {
  'gauteng': {
    baseFareMultiplier: 1.0, // Base region (Johannesburg/Pretoria)
    fuelCostMultiplier: 1.0,
    laborCostMultiplier: 1.0,
    demandMultiplier: 1.1, // High demand
  },
  'western-cape': {
    baseFareMultiplier: 1.05, // Slightly higher
    fuelCostMultiplier: 1.02,
    laborCostMultiplier: 1.08,
    demandMultiplier: 1.15, // Very high demand (Cape Town)
  },
  'kwazulu-natal': {
    baseFareMultiplier: 0.95,
    fuelCostMultiplier: 1.0,
    laborCostMultiplier: 0.92,
    demandMultiplier: 1.0,
  },
  'eastern-cape': {
    baseFareMultiplier: 0.9,
    fuelCostMultiplier: 1.05,
    laborCostMultiplier: 0.85,
    demandMultiplier: 0.9,
  },
  'free-state': {
    baseFareMultiplier: 0.88,
    fuelCostMultiplier: 1.03,
    laborCostMultiplier: 0.82,
    demandMultiplier: 0.85,
  },
  'limpopo': {
    baseFareMultiplier: 0.85,
    fuelCostMultiplier: 1.08,
    laborCostMultiplier: 0.78,
    demandMultiplier: 0.8,
  },
  'mpumalanga': {
    baseFareMultiplier: 0.87,
    fuelCostMultiplier: 1.06,
    laborCostMultiplier: 0.8,
    demandMultiplier: 0.82,
  },
  'north-west': {
    baseFareMultiplier: 0.86,
    fuelCostMultiplier: 1.07,
    laborCostMultiplier: 0.79,
    demandMultiplier: 0.81,
  },
  'northern-cape': {
    baseFareMultiplier: 0.83,
    fuelCostMultiplier: 1.12,
    laborCostMultiplier: 0.75,
    demandMultiplier: 0.75,
  },
};

// Seasonal pricing factors (Southern Hemisphere)
export interface SeasonalFactors {
  [month: number]: {
    demandMultiplier: number;
    weatherImpact: number;
    holidayPeriod: boolean;
    description: string;
  };
}

export const SEASONAL_FACTORS: SeasonalFactors = {
  0: { // January
    demandMultiplier: 1.3,
    weatherImpact: 0.05,
    holidayPeriod: true,
    description: 'Peak summer holiday season'
  },
  1: { // February
    demandMultiplier: 1.2,
    weatherImpact: 0.05,
    holidayPeriod: false,
    description: 'End of holiday season'
  },
  2: { // March
    demandMultiplier: 1.1,
    weatherImpact: 0.02,
    holidayPeriod: false,
    description: 'Back to school/work'
  },
  3: { // April
    demandMultiplier: 0.95,
    weatherImpact: 0.02,
    holidayPeriod: false,
    description: 'Autumn season'
  },
  4: { // May
    demandMultiplier: 0.9,
    weatherImpact: 0.03,
    holidayPeriod: false,
    description: 'Autumn season'
  },
  5: { // June
    demandMultiplier: 0.85,
    weatherImpact: 0.08,
    holidayPeriod: false,
    description: 'Winter season'
  },
  6: { // July
    demandMultiplier: 0.8,
    weatherImpact: 0.1,
    holidayPeriod: true,
    description: 'Winter school holidays'
  },
  7: { // August
    demandMultiplier: 0.9,
    weatherImpact: 0.08,
    holidayPeriod: false,
    description: 'Late winter'
  },
  8: { // September
    demandMultiplier: 1.05,
    weatherImpact: 0.05,
    holidayPeriod: false,
    description: 'Spring season'
  },
  9: { // October
    demandMultiplier: 1.15,
    weatherImpact: 0.03,
    holidayPeriod: false,
    description: 'Spring moving season'
  },
  10: { // November
    demandMultiplier: 1.25,
    weatherImpact: 0.05,
    holidayPeriod: false,
    description: 'Pre-holiday rush'
  },
  11: { // December
    demandMultiplier: 1.4,
    weatherImpact: 0.08,
    holidayPeriod: true,
    description: 'Peak holiday season'
  },
};

// Market demand indicators
export interface DemandIndicators {
  veryLow: { multiplier: number; threshold: number };
  low: { multiplier: number; threshold: number };
  normal: { multiplier: number; threshold: number };
  high: { multiplier: number; threshold: number };
  veryHigh: { multiplier: number; threshold: number };
}

export const DEMAND_INDICATORS: DemandIndicators = {
  veryLow: { multiplier: 0.9, threshold: 0.3 },
  low: { multiplier: 0.95, threshold: 0.6 },
  normal: { multiplier: 1.0, threshold: 1.0 },
  high: { multiplier: 1.15, threshold: 1.4 },
  veryHigh: { multiplier: 1.3, threshold: 2.0 },
};

// Fuel price tracking
export interface FuelPriceData {
  basePrice: number; // Base fuel price per liter
  currentPrice: number; // Current fuel price per liter
  lastUpdated: Date;
  region: string;
  priceIndex: number; // Current price / base price
}

export const BASE_FUEL_PRICE: FuelPriceData = {
  basePrice: 20.0, // R20 per liter base price
  currentPrice: 21.5, // Current price (would be updated via API)
  lastUpdated: new Date(),
  region: 'national-average',
  priceIndex: 1.075, // 7.5% above base
};

// Insurance coverage options
export interface InsuranceTier {
  id: string;
  name: string;
  description: string;
  coverageLimit: number; // Maximum coverage amount
  rate: number; // Percentage of item value
  deductible: number; // Fixed deductible amount
  features: string[];
}

export const INSURANCE_TIERS: InsuranceTier[] = [
  {
    id: 'basic',
    name: 'Basic Coverage',
    description: 'Essential protection for your move',
    coverageLimit: 50000,
    rate: 3, // 3% of item value
    deductible: 500,
    features: ['Damage protection', 'Loss protection', 'Basic liability'],
  },
  {
    id: 'standard',
    name: 'Standard Coverage',
    description: 'Comprehensive protection',
    coverageLimit: 150000,
    rate: 5, // 5% of item value
    deductible: 250,
    features: ['Full replacement value', 'Weather damage', 'Theft protection', 'Extended liability'],
  },
  {
    id: 'premium',
    name: 'Premium Coverage',
    description: 'Maximum protection and peace of mind',
    coverageLimit: 500000,
    rate: 7, // 7% of item value
    deductible: 100,
    features: ['Full replacement value', 'All-risk coverage', 'International protection', 'Expedited claims'],
  },
];

// Pricing validation rules
export interface PricingValidation {
  minimumBaseFare: number;
  maximumBaseFare: number;
  minimumTotalOrder: number;
  maximumSurchargePercentage: number;
  maximumDiscountPercentage: number;
}

export const PRICING_VALIDATION: PricingValidation = {
  minimumBaseFare: 500, // R500 minimum
  maximumBaseFare: 50000, // R50,000 maximum (triggers custom quote)
  minimumTotalOrder: 500, // R500 minimum order
  maximumSurchargePercentage: 100, // 100% maximum surcharge
  maximumDiscountPercentage: 30, // 30% maximum discount
};

export class PricingUtils {
  /**
   * Get the appropriate distance band for a given distance
   */
  static getDistanceBand(distance: number): DistanceBand | undefined {
    return DISTANCE_BANDS.find((band: DistanceBand) => {
      if (band.maxKm === null) {
        return distance >= band.minKm; // For 1000+ km band
      }
      return distance >= band.minKm && distance <= band.maxKm;
    });
  }

  /**
   * Determine the time multiplier based on current time
   */
  static getTimeMultiplier(date: Date = new Date()): number {
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    
    let multiplier = TIME_MULTIPLIERS.offPeakHours;
    
    // Check for peak hours
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      multiplier = TIME_MULTIPLIERS.peakHours;
    }
    // Check for night hours
    else if (hour >= 22 || hour <= 6) {
      multiplier = TIME_MULTIPLIERS.nightHours;
    }
    
    // Apply weekend multiplier
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      multiplier *= TIME_MULTIPLIERS.weekendMultiplier;
    }
    
    return multiplier;
  }

  /**
   * Get seasonal factor for a given date
   */
  static getSeasonalFactor(date: Date = new Date()) {
    const month = date.getMonth();
    return SEASONAL_FACTORS[month] || SEASONAL_FACTORS[0];
  }

  /**
   * Calculate fuel surcharge based on current fuel prices
   */
  static calculateFuelSurcharge(baseFare: number, distance: number): number {
    const fuelImpact = (BASE_FUEL_PRICE.priceIndex - 1) * 0.5; // 50% of price increase
    const distanceImpact = Math.min(distance / 100, 5); // Max 5x impact for very long distances
    return baseFare * fuelImpact * distanceImpact;
  }

  /**
   * Validate pricing inputs
   */
  static validatePricingInputs(vehicleClassId: string, distance: number, extraServices: any[]) {
    const errors: string[] = [];
    
    // Validate vehicle class
    const vehicleClass = VEHICLE_CLASSES.find((v: VehicleClass) => v.id === vehicleClassId);
    if (!vehicleClass) {
      errors.push('Invalid vehicle class');
    }
    
    // Validate distance
    if (distance <= 0) {
      errors.push('Distance must be greater than 0');
    }
    
    if (distance > 2000) {
      errors.push('Distance exceeds maximum supported range (2000km)');
    }
    
    // Validate extra services
    extraServices.forEach((service: any, index: number) => {
      if (!service.serviceId) {
        errors.push(`Extra service ${index + 1} missing service ID`);
      }
      if (service.quantity && service.quantity <= 0) {
        errors.push(`Extra service ${index + 1} quantity must be greater than 0`);
      }
    });
    
    return errors;
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number, currency: string = PRICING_CONFIG.currency): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Calculate confidence score for pricing
   */
  static calculateConfidenceScore(
    distance: number,
    scheduledDate: Date,
    marketConditions: any
  ): number {
    let confidence = 95; // Start with high confidence
    
    // Reduce confidence for long distances
    if (distance > 500) confidence -= 10;
    if (distance > 1000) confidence -= 15;
    
    // Reduce confidence for future bookings
    const daysInFuture = Math.floor((scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysInFuture > 7) confidence -= 5;
    if (daysInFuture > 30) confidence -= 10;
    
    // Reduce confidence for volatile market conditions
    if (marketConditions?.demandLevel === 'very_high' || marketConditions?.demandLevel === 'very_low') {
      confidence -= 10;
    }
    
    return Math.max(confidence, 50); // Minimum 50% confidence
  }
}

// Add the missing generateCompletePricingMatrix function
export function generateCompletePricingMatrix(): PricingRate[] {
  const rates: PricingRate[] = [];
  
  for (const vehicleClass of VEHICLE_CLASSES) {
    for (const distanceBand of DISTANCE_BANDS) {
      rates.push({
        id: `${vehicleClass.id}-${distanceBand.id}`,
        vehicleClassId: vehicleClass.id,
        distanceBandId: distanceBand.id,
        baseFare: 500 + (vehicleClass.order * 200),
      });
    }
  }
  
  return rates;
}
