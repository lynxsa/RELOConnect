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
  unit?: string; // e.g., 'person', 'flight', '15min'
  icon: string;
}

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
    icon: '🚛',
    description: 'Ideal for medium-sized moves',
    order: 2
  },
  {
    id: '2-ton-truck',
    name: '2 Ton Truck',
    capacity: '2 tons',
    maxWeight: 2000,
    icon: '🚚',
    description: 'Great for larger household moves',
    order: 3
  },
  {
    id: '3-ton-truck',
    name: '3 Ton Truck',
    capacity: '3 tons',
    maxWeight: 3000,
    icon: '🚛',
    description: 'Perfect for full house moves',
    order: 4
  },
  {
    id: '4-ton-truck',
    name: '4 Ton Truck',
    capacity: '4 tons',
    maxWeight: 4000,
    icon: '🚚',
    description: 'Large capacity for big moves',
    order: 5
  },
  {
    id: '6-ton-truck',
    name: '6 Ton Truck',
    capacity: '6 tons',
    maxWeight: 6000,
    icon: '🚛',
    description: 'Commercial grade moving',
    order: 6
  },
  {
    id: '8-ton-truck',
    name: '8 Ton Truck',
    capacity: '8 tons',
    maxWeight: 8000,
    icon: '🚚',
    description: 'Heavy duty commercial moves',
    order: 7
  },
  {
    id: '12-ton-truck',
    name: '12 Ton Truck',
    capacity: '12 tons',
    maxWeight: 12000,
    icon: '🚛',
    description: 'Maximum capacity for large commercial moves',
    order: 8
  }
];

// Distance Bands (9 bands)
export const DISTANCE_BANDS: DistanceBand[] = [
  { id: 'local', minKm: 0, maxKm: 20, label: 'Local (0-20km)' },
  { id: 'regional-1', minKm: 21, maxKm: 50, label: 'Regional (21-50km)' },
  { id: 'regional-2', minKm: 51, maxKm: 100, label: 'Regional (51-100km)' },
  { id: 'intercity-1', minKm: 101, maxKm: 200, label: 'Intercity (101-200km)' },
  { id: 'intercity-2', minKm: 201, maxKm: 350, label: 'Intercity (201-350km)' },
  { id: 'intercity-3', minKm: 351, maxKm: 500, label: 'Intercity (351-500km)' },
  { id: 'long-distance-1', minKm: 501, maxKm: 750, label: 'Long Distance (501-750km)' },
  { id: 'long-distance-2', minKm: 751, maxKm: 1000, label: 'Long Distance (751-1000km)' },
  { id: 'long-distance-3', minKm: 1001, maxKm: null, label: 'Long Distance (1000+km)' }
];

// Extra Services
export const EXTRA_SERVICES: ExtraService[] = [
  {
    id: 'packing',
    name: 'Packing Service',
    code: 'PACK',
    description: 'Professional packing of your items',
    priceType: 'per_unit',
    price: 25,
    unit: 'box',
    icon: '📦'
  },
  {
    id: 'unpacking',
    name: 'Unpacking Service',
    code: 'UNPACK',
    description: 'Professional unpacking at destination',
    priceType: 'per_unit',
    price: 20,
    unit: 'box',
    icon: '📤'
  },
  {
    id: 'storage',
    name: 'Storage Service',
    code: 'STORAGE',
    description: 'Secure storage facility',
    priceType: 'per_unit',
    price: 150,
    unit: 'day',
    icon: '🏬'
  },
  {
    id: 'assembly',
    name: 'Furniture Assembly',
    code: 'ASSEMBLY',
    description: 'Assembly and disassembly of furniture',
    priceType: 'per_unit',
    price: 200,
    unit: 'item',
    icon: '🔧'
  },
  {
    id: 'extra-helpers',
    name: 'Extra Helpers',
    code: 'HELPERS',
    description: 'Additional movers',
    priceType: 'per_unit',
    price: 300,
    unit: 'person',
    icon: '👥'
  },
  {
    id: 'insurance',
    name: 'Moving Insurance',
    code: 'INSURANCE',
    description: 'Comprehensive moving insurance',
    priceType: 'percentage',
    price: 2.5,
    unit: 'percentage',
    icon: '🛡️'
  },
  {
    id: 'rush-service',
    name: 'Rush Service',
    code: 'RUSH',
    description: 'Express moving service',
    priceType: 'percentage',
    price: 25,
    unit: 'percentage',
    icon: '⚡'
  }
];

// Generate base pricing rates
export const generateCompletePricingMatrix = (): PricingRate[] => {
  const pricingMatrix: PricingRate[] = [];
  
  // Base rates (simplified for demo)
  const baseRates = {
    'mini-van': [450, 650, 850, 1200, 1800, 2400, 3000, 3800, 4500],
    '1-ton-truck': [550, 750, 950, 1400, 2000, 2600, 3200, 4000, 4800],
    '2-ton-truck': [650, 850, 1050, 1600, 2200, 2800, 3400, 4200, 5000],
    '3-ton-truck': [750, 950, 1150, 1800, 2400, 3000, 3600, 4400, 5200],
    '4-ton-truck': [850, 1050, 1250, 2000, 2600, 3200, 3800, 4600, 5400],
    '6-ton-truck': [1050, 1250, 1450, 2400, 3000, 3600, 4200, 5000, 5800],
    '8-ton-truck': [1250, 1450, 1650, 2800, 3400, 4000, 4600, 5400, 6200],
    '12-ton-truck': [1650, 1850, 2050, 3600, 4200, 4800, 5400, 6200, 7000]
  };

  VEHICLE_CLASSES.forEach(vehicle => {
    DISTANCE_BANDS.forEach((band, index) => {
      pricingMatrix.push({
        id: `${vehicle.id}-${band.id}`,
        vehicleClassId: vehicle.id,
        distanceBandId: band.id,
        baseFare: baseRates[vehicle.id as keyof typeof baseRates][index]
      });
    });
  });

  return pricingMatrix;
};

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

export const DEFAULT_PRICING_CONFIG: PricingConfiguration = {
  currency: 'ZAR',
  taxRate: 0.15, // 15% VAT
  serviceFee: 50, // R50 service fee
  minimumOrder: 200, // R200 minimum order
  fuelSurchargeEnabled: true,
  dynamicPricingEnabled: true,
  loyaltyDiscountEnabled: true
};

// Pricing calculation functions
export const calculatePricing = (
  vehicleClassId: string,
  distanceBandId: string,
  extraServices: { serviceId: string; quantity: number }[] = []
): {
  baseFare: number;
  extraServicesCost: number;
  subtotal: number;
  tax: number;
  total: number;
} => {
  const pricingMatrix = generateCompletePricingMatrix();
  
  // Find base fare
  const baseRate = pricingMatrix.find(
    rate => rate.vehicleClassId === vehicleClassId && rate.distanceBandId === distanceBandId
  );
  
  if (!baseRate) {
    throw new Error(`No pricing found for vehicle ${vehicleClassId} and distance ${distanceBandId}`);
  }

  const baseFare = baseRate.baseFare;
  
  // Calculate extra services cost
  let extraServicesCost = 0;
  extraServices.forEach(({ serviceId, quantity }) => {
    const service = EXTRA_SERVICES.find(s => s.id === serviceId);
    if (service) {
      if (service.priceType === 'flat') {
        extraServicesCost += service.price;
      } else if (service.priceType === 'per_unit') {
        extraServicesCost += service.price * quantity;
      } else if (service.priceType === 'percentage') {
        extraServicesCost += baseFare * (service.price / 100);
      }
    }
  });

  const subtotal = baseFare + extraServicesCost;
  const tax = subtotal * DEFAULT_PRICING_CONFIG.taxRate;
  const total = subtotal + tax;

  return {
    baseFare,
    extraServicesCost,
    subtotal,
    tax,
    total
  };
};

// Export pricing matrix for use in components
export const PRICING_MATRIX = generateCompletePricingMatrix();
