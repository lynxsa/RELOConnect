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
}

interface PriceEstimateRequest {
  distance: number;
  vehicleClassId: string;
  extraServices: ExtraServices;
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
  };
  total: number;
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
        : 0
    };

    // 4. Calculate the total price
    const totalExtras = Object.values(extras).reduce((sum, cost) => sum + cost, 0);
    const totalPrice = pricingRate.baseFare + totalExtras;

    // 5. Return the price breakdown
    return {
      baseFare: pricingRate.baseFare,
      extras,
      total: totalPrice
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
