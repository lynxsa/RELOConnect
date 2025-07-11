/**
 * RELOConnect Complete Pricing Service
 * Implements full South African pricing matrix (0-2255km) with all vehicle classes
 * Based on comprehensive specification from July 2025
 */

export interface VehicleClass {
  id: string;
  name: string;
  capacity: string;
  description: string;
  commissionRate: number; // Platform commission percentage
}

export interface PricingBracket {
  minDistance: number;
  maxDistance: number;
  motorbike: number;
  bakkie: number;
  small_truck: number;  // 1-1.5t
  medium_truck_2t: number;
  medium_truck_4t: number;
  large_truck_5t: number;
  large_truck_8t: number;
  heavy_truck_10t: number;
  heavy_truck_14t: number;
}

export interface AddOnServices {
  stairs: boolean;
  stairsCount: number;
  helpers: boolean;
  helpersCount: number;
  packing: boolean;
  cleaning: boolean;
  insurance: boolean;
  insuranceValue: number;
  express: boolean;
}

export interface FareCalculation {
  baseRate: number;
  stairsFee: number;
  helpersFee: number;
  packingFee: number;
  cleaningFee: number;
  insuranceFee: number;
  expressFee: number;
  subtotal: number;
  platformCommission: number;
  driverEarnings: number;
  total: number;
  breakdown: FareBreakdownItem[];
}

export interface FareBreakdownItem {
  description: string;
  amount: number;
  type: 'base' | 'addon' | 'fee' | 'commission';
}

// Vehicle Classes with Commission Rates
export const VEHICLE_CLASSES: VehicleClass[] = [
  {
    id: 'motorbike',
    name: 'Motorbike',
    capacity: 'Small packages',
    description: 'Documents, small parcels up to 20kg',
    commissionRate: 12.5
  },
  {
    id: 'bakkie',
    name: 'Bakkie',
    capacity: 'Up to 1 ton',
    description: 'Single room, small furniture, appliances',
    commissionRate: 15
  },
  {
    id: 'small_truck',
    name: 'Small Truck',
    capacity: '1-1.5 tons',
    description: '1-2 bedroom apartment, office move',
    commissionRate: 17.5
  },
  {
    id: 'medium_truck_2t',
    name: 'Medium Truck',
    capacity: '2 tons',
    description: '2-3 bedroom house, small office',
    commissionRate: 20
  },
  {
    id: 'medium_truck_4t',
    name: 'Medium Truck',
    capacity: '4 tons',
    description: '3-4 bedroom house, medium office',
    commissionRate: 20
  },
  {
    id: 'large_truck_5t',
    name: 'Large Truck',
    capacity: '5 tons',
    description: '4+ bedroom house, large office',
    commissionRate: 22.5
  },
  {
    id: 'large_truck_8t',
    name: 'Large Truck',
    capacity: '8 tons',
    description: 'Large house, warehouse moves',
    commissionRate: 22.5
  },
  {
    id: 'heavy_truck_10t',
    name: 'Heavy Truck',
    capacity: '10 tons',
    description: 'Commercial moves, heavy machinery',
    commissionRate: 25
  },
  {
    id: 'heavy_truck_14t',
    name: 'Heavy Truck',
    capacity: '14 tons',
    description: 'Industrial moves, heavy equipment',
    commissionRate: 25
  }
];

// Complete Pricing Matrix (0-2255km covering full N2 route)
export const PRICING_MATRIX: PricingBracket[] = [
  { minDistance: 0, maxDistance: 5, motorbike: 150, bakkie: 650, small_truck: 800, medium_truck_2t: 1050, medium_truck_4t: 1050, large_truck_5t: 1300, large_truck_8t: 1300, heavy_truck_10t: 1650, heavy_truck_14t: 1650 },
  { minDistance: 5, maxDistance: 10, motorbike: 200, bakkie: 700, small_truck: 850, medium_truck_2t: 1100, medium_truck_4t: 1100, large_truck_5t: 1600, large_truck_8t: 1600, heavy_truck_10t: 1750, heavy_truck_14t: 1750 },
  { minDistance: 10, maxDistance: 15, motorbike: 300, bakkie: 850, small_truck: 1000, medium_truck_2t: 1350, medium_truck_4t: 1350, large_truck_5t: 2000, large_truck_8t: 2000, heavy_truck_10t: 2250, heavy_truck_14t: 2250 },
  { minDistance: 15, maxDistance: 20, motorbike: 400, bakkie: 1000, small_truck: 1200, medium_truck_2t: 1650, medium_truck_4t: 1650, large_truck_5t: 2400, large_truck_8t: 2400, heavy_truck_10t: 2800, heavy_truck_14t: 2800 },
  { minDistance: 20, maxDistance: 25, motorbike: 500, bakkie: 1150, small_truck: 1400, medium_truck_2t: 1950, medium_truck_4t: 1950, large_truck_5t: 2800, large_truck_8t: 2800, heavy_truck_10t: 3350, heavy_truck_14t: 3350 },
  { minDistance: 25, maxDistance: 30, motorbike: 600, bakkie: 1300, small_truck: 1600, medium_truck_2t: 2250, medium_truck_4t: 2250, large_truck_5t: 3200, large_truck_8t: 3200, heavy_truck_10t: 3900, heavy_truck_14t: 3900 },
  { minDistance: 30, maxDistance: 40, motorbike: 700, bakkie: 1600, small_truck: 2000, medium_truck_2t: 2700, medium_truck_4t: 2700, large_truck_5t: 4000, large_truck_8t: 4000, heavy_truck_10t: 4900, heavy_truck_14t: 4900 },
  { minDistance: 40, maxDistance: 50, motorbike: 800, bakkie: 1900, small_truck: 2300, medium_truck_2t: 3100, medium_truck_4t: 3100, large_truck_5t: 4600, large_truck_8t: 4600, heavy_truck_10t: 5600, heavy_truck_14t: 5600 },
  { minDistance: 50, maxDistance: 75, motorbike: 1000, bakkie: 2400, small_truck: 2800, medium_truck_2t: 3700, medium_truck_4t: 3700, large_truck_5t: 5600, large_truck_8t: 5600, heavy_truck_10t: 6800, heavy_truck_14t: 6800 },
  { minDistance: 75, maxDistance: 100, motorbike: 1200, bakkie: 3000, small_truck: 3500, medium_truck_2t: 4600, medium_truck_4t: 4600, large_truck_5t: 6800, large_truck_8t: 6800, heavy_truck_10t: 8400, heavy_truck_14t: 8400 },
  { minDistance: 100, maxDistance: 150, motorbike: 1700, bakkie: 4300, small_truck: 5000, medium_truck_2t: 6500, medium_truck_4t: 6500, large_truck_5t: 9500, large_truck_8t: 9500, heavy_truck_10t: 11500, heavy_truck_14t: 11500 },
  { minDistance: 150, maxDistance: 200, motorbike: 2200, bakkie: 5600, small_truck: 6500, medium_truck_2t: 8500, medium_truck_4t: 8500, large_truck_5t: 12000, large_truck_8t: 12000, heavy_truck_10t: 14500, heavy_truck_14t: 14500 },
  { minDistance: 200, maxDistance: 300, motorbike: 3000, bakkie: 7600, small_truck: 8900, medium_truck_2t: 11500, medium_truck_4t: 11500, large_truck_5t: 16500, large_truck_8t: 16500, heavy_truck_10t: 20000, heavy_truck_14t: 20000 },
  { minDistance: 300, maxDistance: 500, motorbike: 5800, bakkie: 11000, small_truck: 14800, medium_truck_2t: 19500, medium_truck_4t: 19500, large_truck_5t: 28000, large_truck_8t: 28000, heavy_truck_10t: 34000, heavy_truck_14t: 34000 },
  { minDistance: 500, maxDistance: 750, motorbike: 7800, bakkie: 14800, small_truck: 20500, medium_truck_2t: 27000, medium_truck_4t: 27000, large_truck_5t: 39000, large_truck_8t: 39000, heavy_truck_10t: 48500, heavy_truck_14t: 48500 },
  { minDistance: 750, maxDistance: 1000, motorbike: 10000, bakkie: 18200, small_truck: 25000, medium_truck_2t: 34000, medium_truck_4t: 34000, large_truck_5t: 50000, large_truck_8t: 50000, heavy_truck_10t: 62000, heavy_truck_14t: 62000 },
  { minDistance: 1000, maxDistance: 1500, motorbike: 14000, bakkie: 25000, small_truck: 35000, medium_truck_2t: 48000, medium_truck_4t: 48000, large_truck_5t: 70000, large_truck_8t: 70000, heavy_truck_10t: 83000, heavy_truck_14t: 83000 },
  { minDistance: 1500, maxDistance: 2000, motorbike: 18000, bakkie: 32000, small_truck: 46000, medium_truck_2t: 62000, medium_truck_4t: 62000, large_truck_5t: 90000, large_truck_8t: 90000, heavy_truck_10t: 107000, heavy_truck_14t: 107000 },
  { minDistance: 2000, maxDistance: 2255, motorbike: 20500, bakkie: 36500, small_truck: 52500, medium_truck_2t: 70900, medium_truck_4t: 70900, large_truck_5t: 103000, large_truck_8t: 103000, heavy_truck_10t: 123000, heavy_truck_14t: 123000 }
];

// Add-On Service Fees (flat rates in ZAR)
export const ADDON_FEES = {
  STAIRS_PER_FLIGHT: 150,
  HELPER_PER_PERSON: 350,
  PACKING_MATERIALS: 200, // 10 boxes + wrap
  CLEANING_SERVICE: 500,
  INSURANCE_RATE: 0.015, // 1.5% of declared value
  EXPRESS_SERVICE: 450
};

/**
 * Calculate fare based on distance, vehicle class, and add-on services
 */
export function calculateFare(
  distance: number,
  vehicleClassId: string,
  addOns: AddOnServices
): FareCalculation {
  // Find the pricing bracket for the distance
  const bracket = PRICING_MATRIX.find(
    b => distance >= b.minDistance && distance <= b.maxDistance
  );
  
  if (!bracket) {
    throw new Error(`No pricing bracket found for distance: ${distance}km`);
  }

  // Get base rate for vehicle class
  const baseRate = getBaseRateForVehicle(bracket, vehicleClassId);
  
  // Calculate add-on fees
  const stairsFee = addOns.stairs ? addOns.stairsCount * ADDON_FEES.STAIRS_PER_FLIGHT : 0;
  const helpersFee = addOns.helpers ? addOns.helpersCount * ADDON_FEES.HELPER_PER_PERSON : 0;
  const packingFee = addOns.packing ? ADDON_FEES.PACKING_MATERIALS : 0;
  const cleaningFee = addOns.cleaning ? ADDON_FEES.CLEANING_SERVICE : 0;
  const insuranceFee = addOns.insurance ? addOns.insuranceValue * ADDON_FEES.INSURANCE_RATE : 0;
  const expressFee = addOns.express ? ADDON_FEES.EXPRESS_SERVICE : 0;

  // Calculate subtotal
  const subtotal = baseRate + stairsFee + helpersFee + packingFee + cleaningFee + insuranceFee + expressFee;

  // Get vehicle class for commission calculation
  const vehicleClass = VEHICLE_CLASSES.find(vc => vc.id === vehicleClassId);
  if (!vehicleClass) {
    throw new Error(`Invalid vehicle class: ${vehicleClassId}`);
  }

  // Calculate platform commission
  let commissionRate = vehicleClass.commissionRate;
  const platformCommission = subtotal * (commissionRate / 100);
  const driverEarnings = subtotal - platformCommission;
  const total = subtotal;

  // Create breakdown
  const breakdown: FareBreakdownItem[] = [
    { description: `${vehicleClass.name} (${distance}km)`, amount: baseRate, type: 'base' }
  ];

  if (stairsFee > 0) {
    breakdown.push({ description: `Stairs (${addOns.stairsCount} flights)`, amount: stairsFee, type: 'addon' });
  }
  if (helpersFee > 0) {
    breakdown.push({ description: `Loading helpers (${addOns.helpersCount} people)`, amount: helpersFee, type: 'addon' });
  }
  if (packingFee > 0) {
    breakdown.push({ description: 'Packing materials', amount: packingFee, type: 'addon' });
  }
  if (cleaningFee > 0) {
    breakdown.push({ description: 'Cleaning service', amount: cleaningFee, type: 'addon' });
  }
  if (insuranceFee > 0) {
    breakdown.push({ description: `Insurance (R${addOns.insuranceValue.toLocaleString()})`, amount: insuranceFee, type: 'addon' });
  }
  if (expressFee > 0) {
    breakdown.push({ description: 'Express delivery', amount: expressFee, type: 'addon' });
  }

  breakdown.push({ description: `Platform fee (${commissionRate.toFixed(1)}%)`, amount: platformCommission, type: 'commission' });

  return {
    baseRate,
    stairsFee,
    helpersFee,
    packingFee,
    cleaningFee,
    insuranceFee,
    expressFee,
    subtotal,
    platformCommission,
    driverEarnings,
    total,
    breakdown
  };
}

function getBaseRateForVehicle(bracket: PricingBracket, vehicleClassId: string): number {
  switch (vehicleClassId) {
    case 'motorbike': return bracket.motorbike;
    case 'bakkie': return bracket.bakkie;
    case 'small_truck': return bracket.small_truck;
    case 'medium_truck_2t': return bracket.medium_truck_2t;
    case 'medium_truck_4t': return bracket.medium_truck_4t;
    case 'large_truck_5t': return bracket.large_truck_5t;
    case 'large_truck_8t': return bracket.large_truck_8t;
    case 'heavy_truck_10t': return bracket.heavy_truck_10t;
    case 'heavy_truck_14t': return bracket.heavy_truck_14t;
    default:
      throw new Error(`Invalid vehicle class: ${vehicleClassId}`);
  }
}

/**
 * Get available vehicle classes for a given load description
 */
export function getRecommendedVehicleClasses(loadDescription: string, distance: number): VehicleClass[] {
  const lowerDescription = loadDescription.toLowerCase();
  
  if (lowerDescription.includes('document') || lowerDescription.includes('letter')) {
    return VEHICLE_CLASSES.filter(vc => vc.id === 'motorbike');
  }
  
  if (lowerDescription.includes('room') || lowerDescription.includes('bedroom')) {
    const roomCount = extractRoomCount(lowerDescription);
    if (roomCount <= 1) return VEHICLE_CLASSES.filter(vc => ['bakkie', 'small_truck'].includes(vc.id));
    if (roomCount <= 2) return VEHICLE_CLASSES.filter(vc => ['small_truck', 'medium_truck_2t'].includes(vc.id));
    if (roomCount <= 3) return VEHICLE_CLASSES.filter(vc => ['medium_truck_2t', 'medium_truck_4t'].includes(vc.id));
    return VEHICLE_CLASSES.filter(vc => ['medium_truck_4t', 'large_truck_5t', 'large_truck_8t'].includes(vc.id));
  }
  
  // Default: return all applicable classes for the distance
  if (distance > 1000) {
    return VEHICLE_CLASSES.filter(vc => vc.id !== 'motorbike');
  }
  
  return VEHICLE_CLASSES;
}

function extractRoomCount(description: string): number {
  const match = description.match(/(\d+)[\s-]*(bedroom|room)/i);
  return match ? parseInt(match[1]) : 1;
}

export interface RouteEstimate {
  estimatedDuration: number; // minutes
  estimatedFuelCost: number; // ZAR
  tollFees: number; // ZAR
  carbonFootprint: number; // kg CO2
}

export function calculateRouteEstimate(distance: number, vehicleClassId: string): RouteEstimate {
  const vehicleClass = VEHICLE_CLASSES.find(vc => vc.id === vehicleClassId);
  if (!vehicleClass) {
    throw new Error(`Invalid vehicle class: ${vehicleClassId}`);
  }

  // Estimated parameters
  const avgSpeedKmh = distance > 100 ? 80 : 50;
  const estimatedDuration = (distance / avgSpeedKmh) * 60;

  // Fuel consumption estimates (L/100km)
  const fuelConsumption = getFuelConsumption(vehicleClassId);
  const fuelPrice = 22.50; // ZAR per liter
  const estimatedFuelCost = (distance / 100) * fuelConsumption * fuelPrice;

  // Toll fees
  const tollFees = calculateTollFees(distance);

  // Carbon footprint (kg CO2 per 100km)
  const emissionFactor = getEmissionFactor(vehicleClassId);
  const carbonFootprint = (distance / 100) * emissionFactor;

  return {
    estimatedDuration,
    estimatedFuelCost,
    tollFees,
    carbonFootprint
  };
}

function getFuelConsumption(vehicleClassId: string): number {
  const consumptionMap: Record<string, number> = {
    motorbike: 3.5,
    bakkie: 9.0,
    small_truck: 12.0,
    medium_truck_2t: 15.0,
    medium_truck_4t: 18.0,
    large_truck_5t: 22.0,
    large_truck_8t: 25.0,
    heavy_truck_10t: 28.0,
    heavy_truck_14t: 32.0
  };
  return consumptionMap[vehicleClassId] || 15.0;
}

function getEmissionFactor(vehicleClassId: string): number {
  const emissionMap: Record<string, number> = {
    motorbike: 8.5,
    bakkie: 22.0,
    small_truck: 29.0,
    medium_truck_2t: 36.0,
    medium_truck_4t: 43.0,
    large_truck_5t: 52.0,
    large_truck_8t: 59.0,
    heavy_truck_10t: 66.0,
    heavy_truck_14t: 75.0
  };
  return emissionMap[vehicleClassId] || 35.0;
}

function calculateTollFees(distance: number): number {
  if (distance < 50) return 0;
  if (distance < 200) return 25;
  if (distance < 500) return 85;
  if (distance < 1000) return 175;
  return 285;
}
