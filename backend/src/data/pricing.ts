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

// Pricing Matrix (25 distance bands x 8 vehicle types = 200 rates)
export const PRICING_RATES: PricingRate[] = [
  // 0-5 km
  { id: 'rate-0-5-mini-van', vehicleClassId: 'mini-van', distanceBandId: 'band-0-5', baseFare: 650 },
  { id: 'rate-0-5-1-ton', vehicleClassId: '1-ton-truck', distanceBandId: 'band-0-5', baseFare: 800 },
  { id: 'rate-0-5-1.5-ton', vehicleClassId: '1.5-ton-truck', distanceBandId: 'band-0-5', baseFare: 950 },
  { id: 'rate-0-5-2-ton', vehicleClassId: '2-ton-truck', distanceBandId: 'band-0-5', baseFare: 1050 },
  { id: 'rate-0-5-4-ton', vehicleClassId: '4-ton-truck', distanceBandId: 'band-0-5', baseFare: 1300 },
  { id: 'rate-0-5-5-ton', vehicleClassId: '5-ton-truck', distanceBandId: 'band-0-5', baseFare: 1500 },
  { id: 'rate-0-5-8-ton', vehicleClassId: '8-ton-truck', distanceBandId: 'band-0-5', baseFare: 2500 },
  { id: 'rate-0-5-10-ton', vehicleClassId: '10-ton-truck', distanceBandId: 'band-0-5', baseFare: 3000 },
  
  // 5-10 km
  { id: 'rate-5-10-mini-van', vehicleClassId: 'mini-van', distanceBandId: 'band-5-10', baseFare: 700 },
  { id: 'rate-5-10-1-ton', vehicleClassId: '1-ton-truck', distanceBandId: 'band-5-10', baseFare: 850 },
  { id: 'rate-5-10-1.5-ton', vehicleClassId: '1.5-ton-truck', distanceBandId: 'band-5-10', baseFare: 1000 },
  { id: 'rate-5-10-2-ton', vehicleClassId: '2-ton-truck', distanceBandId: 'band-5-10', baseFare: 1100 },
  { id: 'rate-5-10-4-ton', vehicleClassId: '4-ton-truck', distanceBandId: 'band-5-10', baseFare: 1600 },
  { id: 'rate-5-10-5-ton', vehicleClassId: '5-ton-truck', distanceBandId: 'band-5-10', baseFare: 1800 },
  { id: 'rate-5-10-8-ton', vehicleClassId: '8-ton-truck', distanceBandId: 'band-5-10', baseFare: 3000 },
  { id: 'rate-5-10-10-ton', vehicleClassId: '10-ton-truck', distanceBandId: 'band-5-10', baseFare: 3600 },
  
  // Continue with all other distance bands...
  // I'll generate the complete matrix programmatically in the seed function
];

// Extra Services
export const EXTRA_SERVICES: ExtraService[] = [
  {
    id: 'loading-service',
    name: 'Loading / Unloading',
    code: 'LOADING',
    description: 'Professional loading and unloading service',
    priceType: 'per_unit',
    price: 350,
    unit: 'person',
    icon: '👷'
  },
  {
    id: 'stairs',
    name: 'Stair Flights',
    code: 'STAIRS',
    description: 'Additional charge per flight of stairs',
    priceType: 'per_unit',
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
    priceType: 'per_unit',
    price: 100,
    unit: '15min',
    icon: '⏰'
  }
];

// Complete pricing matrix generator
export function generateCompletePricingMatrix(): PricingRate[] {
  const pricingMatrix: { [key: string]: number[] } = {
    'mini-van': [650, 700, 750, 800, 850, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 2000, 2300, 2600, 2900, 3400, 3900, 4400, 4900, 5500, 6200, 6900, 0], // 0 = custom quote
    '1-ton-truck': [800, 850, 900, 950, 1000, 1050, 1200, 1350, 1500, 1650, 1800, 1950, 2100, 2500, 2900, 3300, 3700, 4200, 4700, 5200, 5700, 6300, 7000, 7700, 0],
    '1.5-ton-truck': [950, 1000, 1100, 1200, 1300, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3200, 3600, 4000, 4400, 5000, 5600, 6200, 6800, 7500, 8200, 9000, 0],
    '2-ton-truck': [1050, 1100, 1200, 1350, 1400, 1500, 1800, 2050, 2250, 2450, 2650, 2850, 3050, 3500, 3900, 4300, 4700, 5300, 5900, 6500, 7200, 7900, 8700, 9600, 0],
    '4-ton-truck': [1300, 1600, 1900, 2100, 2400, 2700, 3200, 3600, 4000, 4300, 4700, 5100, 5500, 6200, 6800, 7500, 8200, 9500, 10800, 12500, 14200, 16000, 18500, 21000, 0],
    '5-ton-truck': [1500, 1800, 2100, 2300, 2600, 3000, 3500, 4000, 4400, 4700, 5100, 5600, 6000, 6800, 7500, 8200, 8900, 10200, 11600, 13400, 15200, 17100, 19800, 22500, 0],
    '8-ton-truck': [2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9500, 10500, 11500, 12500, 14000, 15500, 18000, 20500, 23000, 26000, 29000, 0],
    '10-ton-truck': [3000, 3600, 4200, 4800, 5400, 6000, 6600, 7200, 7800, 8400, 9000, 9600, 10200, 11400, 12600, 13800, 15000, 16800, 18600, 21600, 24600, 27600, 31200, 34800, 0]
  };

  const rates: PricingRate[] = [];
  
  VEHICLE_CLASSES.forEach(vehicle => {
    DISTANCE_BANDS.forEach((band, index) => {
      const fare = pricingMatrix[vehicle.id][index];
      rates.push({
        id: `rate-${band.id}-${vehicle.id}`,
        vehicleClassId: vehicle.id,
        distanceBandId: band.id,
        baseFare: fare
      });
    });
  });
  
  return rates;
}
