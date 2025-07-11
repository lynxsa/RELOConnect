import { PrismaClient } from '@prisma/client';
import { EXTRA_SERVICES } from '../data/pricing';

const prisma = new PrismaClient();

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface ExtraServices {
  loading: boolean;
  loadingPeople?: number;
  stairs: number;
  packing: boolean;
  cleaning: boolean;
  express: boolean;
  insurance: boolean;
  insuranceValue?: number;
  waitingTime?: number; // in 15-min blocks
  security?: boolean;
  customs?: boolean;
}

interface PriceEstimateRequest {
  distance: number;
  vehicleClassId: string;
  extraServices: ExtraServices;
  provinceFrom?: string;
  provinceTo?: string;
  terrainType?: string; // urban, peri-urban, rural, mountain
}

interface PriceBreakdown {
  baseFare: number;
  extras: {
    loading: number;
    stairs: number;
    packing: number;
    cleaning: number;
    express: number;
    insurance: number;
    waitingTime: number;
    security?: number;
    customs?: number;
  };
  total: number;
  adjustedTotal?: number;
  adjustments?: Record<string, number>;
}

/**
 * Calculate price estimate based on distance, vehicle type, and extra services
 */
export async function calculatePriceEstimate(request: PriceEstimateRequest): Promise<PriceBreakdown> {
  try {
    // 1. Find the appropriate distance band for the given distance
    const distanceBand = await prisma.distanceBand.findFirst({
      where: {
        AND: [
          { minKm: { lte: request.distance } },
          {
            OR: [
              { maxKm: { gte: request.distance } },
              { maxKm: null } // For the "1000+" band
            ]
          }
        ]
      },
      orderBy: { minKm: 'asc' },
    });

    if (!distanceBand) {
      throw new Error('No distance band found for the given distance');
    }

    // 2. Get the base fare from the pricing rate table
    const pricingRate = await prisma.pricingRate.findUnique({
      where: {
        vehicleClassId_distanceBandId: {
          vehicleClassId: request.vehicleClassId,
          distanceBandId: distanceBand.id
        }
      }
    });

    if (!pricingRate) {
      throw new Error('No pricing rate found for the given vehicle type and distance');
    }

    // For distances over 1000 km that need a custom quote
    if (request.distance > 1000 && pricingRate.baseFare === 0) {
      throw new Error('Distance exceeds 1000 km, please request a custom quote');
    }

    // 3. Calculate extra service costs
    const extras = {
      loading: request.extraServices.loading 
        ? (EXTRA_SERVICES.find(s => s.code === 'LOADING')?.price || 350) * (request.extraServices.loadingPeople || 1)
        : 0,
      stairs: request.extraServices.stairs > 0 
        ? (EXTRA_SERVICES.find(s => s.code === 'STAIRS')?.price || 150) * request.extraServices.stairs
        : 0,
      packing: request.extraServices.packing 
        ? (EXTRA_SERVICES.find(s => s.code === 'PACKING')?.price || 200)
        : 0,
      cleaning: request.extraServices.cleaning 
        ? (EXTRA_SERVICES.find(s => s.code === 'CLEANING')?.price || 500)
        : 0,
      express: request.extraServices.express 
        ? (EXTRA_SERVICES.find(s => s.code === 'EXPRESS')?.price || 500)
        : 0,
      insurance: request.extraServices.insurance && request.extraServices.insuranceValue 
        ? (request.extraServices.insuranceValue * ((EXTRA_SERVICES.find(s => s.code === 'INSURANCE')?.price || 5) / 100))
        : 0,
      waitingTime: (request.extraServices.waitingTime || 0) > 0 
        ? (EXTRA_SERVICES.find(s => s.code === 'WAITING')?.price || 100) * (request.extraServices.waitingTime || 0)
        : 0,
      security: request.extraServices.security 
        ? (EXTRA_SERVICES.find(s => s.code === 'SECURITY')?.price || 750)
        : 0,
      customs: request.extraServices.customs 
        ? (EXTRA_SERVICES.find(s => s.code === 'CUSTOMS')?.price || 1200)
        : 0
    };

    // 4. Calculate the total price
    const totalExtras = Object.values(extras).reduce((sum, cost) => sum + cost, 0);
    const totalPrice = pricingRate.baseFare + totalExtras;

    // 5. Apply South African specific adjustments
    let adjustedPrice = totalPrice;
    let adjustmentDetails = {};
    
    if (request.provinceFrom || request.provinceTo || request.terrainType) {
      const adjustmentResult = await calculateAdjustedPrice(
        totalPrice,
        request.provinceFrom,
        request.provinceTo,
        request.terrainType
      );
      
      adjustedPrice = adjustmentResult.adjustedPrice;
      adjustmentDetails = adjustmentResult.adjustments;
    }

    // 6. Return the price breakdown with adjustments
    return {
      baseFare: pricingRate.baseFare,
      extras,
      total: totalPrice,
      adjustedTotal: adjustedPrice,
      adjustments: adjustmentDetails
    };
  } catch (error) {
    console.error('Error calculating price estimate:', error);
    throw error;
  }
}

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(origin: Location, destination: Location): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(destination.latitude - origin.latitude);
  const dLon = deg2rad(destination.longitude - origin.longitude);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(origin.latitude)) * Math.cos(deg2rad(destination.latitude)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

/**
 * Get the current active fuel surcharge
 * @returns The active fuel surcharge or null if none is active
 */
export async function getActiveFuelSurcharge(): Promise<any> {
  try {
    const currentDate = new Date();
    
    const activeSurcharge = await prisma.fuelSurcharge.findFirst({
      where: {
        isActive: true,
        effectiveFrom: {
          lte: currentDate
        },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: currentDate } }
        ]
      },
      orderBy: {
        effectiveFrom: 'desc'
      }
    });
    
    return activeSurcharge;
  } catch (error) {
    console.error('Error getting active fuel surcharge:', error);
    return null;
  }
}

/**
 * Get provincial adjustment factor for a specific province
 * @param province The name of the South African province
 * @returns The adjustment factor (e.g., 1.05 for 5% increase)
 */
export async function getProvincialAdjustment(province: string): Promise<number> {
  try {
    const adjustment = await prisma.provincialAdjustment.findFirst({
      where: { province }
    });
    
    return adjustment ? adjustment.adjustment : 1.0; // Default to no adjustment
  } catch (error) {
    console.error('Error getting provincial adjustment:', error);
    return 1.0; // Default to no adjustment on error
  }
}

/**
 * Calculate price with all South African specific adjustments
 */
export async function calculateAdjustedPrice(
  basePrice: number,
  provinceFrom?: string,
  provinceTo?: string,
  terrainType?: string
): Promise<{ adjustedPrice: number, adjustments: Record<string, number> }> {
  const adjustments: Record<string, number> = {};
  let finalPrice = basePrice;
  
  // Apply provincial adjustments if provinces are specified
  if (provinceFrom) {
    const fromAdjustment = await getProvincialAdjustment(provinceFrom);
    if (fromAdjustment !== 1.0) {
      adjustments.provinceFrom = fromAdjustment;
      finalPrice *= fromAdjustment;
    }
  }
  
  if (provinceTo) {
    const toAdjustment = await getProvincialAdjustment(provinceTo);
    if (toAdjustment !== 1.0) {
      adjustments.provinceTo = toAdjustment;
      finalPrice *= toAdjustment;
    }
  }
  
  // Apply fuel surcharge
  const fuelSurcharge = await getActiveFuelSurcharge();
  if (fuelSurcharge) {
    adjustments.fuelSurcharge = 1 + fuelSurcharge.surchargeRate;
    finalPrice *= adjustments.fuelSurcharge;
  }
  
  // Apply terrain adjustments
  if (terrainType) {
    const terrainAdjustments = {
      'urban': 1.0,
      'peri-urban': 1.1,
      'rural': 1.25,
      'mountain': 1.4
    };
    
    const terrainAdjustment = terrainAdjustments[terrainType as keyof typeof terrainAdjustments] || 1.0;
    if (terrainAdjustment !== 1.0) {
      adjustments.terrain = terrainAdjustment;
      finalPrice *= terrainAdjustment;
    }
  }
  
  return {
    adjustedPrice: finalPrice,
    adjustments
  };
}
