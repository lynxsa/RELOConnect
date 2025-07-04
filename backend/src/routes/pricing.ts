import express, { Request, Response } from 'express';
import { z } from 'zod';
import { calculatePriceEstimate, calculateDistance } from '../services/pricingService';

const router = express.Router();

// Schema for price estimate request
const priceEstimateSchema = z.object({
  distance: z.number().optional(),
  vehicleClassId: z.string(),
  extraServices: z.object({
    loading: z.boolean().default(false),
    loadingPeople: z.number().optional(),
    stairs: z.number().default(0),
    packing: z.boolean().default(false),
    cleaning: z.boolean().default(false),
    express: z.boolean().default(false),
    insurance: z.boolean().default(false),
    insuranceValue: z.number().optional(),
    waitingTime: z.number().optional()
  }),
  // Optional: provide locations for distance calculation
  pickupLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string()
  }).optional(),
  dropoffLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string()
  }).optional()
});

// Get all vehicle classes
router.get('/vehicle-classes', async (req: Request, res: Response) => {
  try {
    const vehicleClasses = await req.prisma.vehicleClass.findMany({
      orderBy: { order: 'asc' }
    });
    
    return res.json(vehicleClasses);
  } catch (error) {
    console.error('Error fetching vehicle classes:', error);
    return res.status(500).json({ error: 'Failed to fetch vehicle classes' });
  }
});

// Get all distance bands
router.get('/distance-bands', async (req: Request, res: Response) => {
  try {
    const distanceBands = await req.prisma.distanceBand.findMany({
      orderBy: { minKm: 'asc' }
    });
    
    return res.json(distanceBands);
  } catch (error) {
    console.error('Error fetching distance bands:', error);
    return res.status(500).json({ error: 'Failed to fetch distance bands' });
  }
});

// Get all extra services
router.get('/extra-services', async (req: Request, res: Response) => {
  try {
    const extraServices = await req.prisma.extraService.findMany();
    
    return res.json(extraServices);
  } catch (error) {
    console.error('Error fetching extra services:', error);
    return res.status(500).json({ error: 'Failed to fetch extra services' });
  }
});

// Get complete price table
router.get('/price-table', async (req: Request, res: Response) => {
  try {
    const vehicleClasses = await req.prisma.vehicleClass.findMany({
      orderBy: { order: 'asc' }
    });
    
    const distanceBands = await req.prisma.distanceBand.findMany({
      orderBy: { minKm: 'asc' }
    });
    
    const pricingRates = await req.prisma.pricingRate.findMany();
    
    // Format data as a table with vehicle classes as columns and distance bands as rows
    const priceTable = distanceBands.map(band => {
      const row: Record<string, any> = {
        id: band.id,
        distanceBand: band.label,
      };
      
      vehicleClasses.forEach(vehicle => {
        const rate = pricingRates.find(
          rate => rate.distanceBandId === band.id && rate.vehicleClassId === vehicle.id
        );
        row[vehicle.name] = rate?.baseFare || 'Custom Quote';
      });
      
      return row;
    });
    
    return res.json(priceTable);
  } catch (error) {
    console.error('Error fetching price table:', error);
    return res.status(500).json({ error: 'Failed to fetch price table' });
  }
});

// Calculate price estimate
router.post('/estimate', async (req: Request, res: Response) => {
  try {
    const validatedData = priceEstimateSchema.parse(req.body);
    
    let distance = validatedData.distance;
    
    // Calculate distance if pickup and dropoff locations are provided but distance is not
    if (!distance && validatedData.pickupLocation && validatedData.dropoffLocation) {
      distance = calculateDistance(validatedData.pickupLocation, validatedData.dropoffLocation);
    }
    
    if (!distance) {
      return res.status(400).json({ error: 'Distance is required either directly or via pickup/dropoff locations' });
    }
    
    const priceBreakdown = await calculatePriceEstimate({
      distance,
      vehicleClassId: validatedData.vehicleClassId,
      extraServices: validatedData.extraServices
    });
    
    return res.json({
      distance,
      priceBreakdown
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    if (error instanceof Error && error.message.includes('custom quote')) {
      return res.status(400).json({
        error: error.message,
        requiresCustomQuote: true
      });
    }
    
    console.error('Price estimate error:', error);
    return res.status(500).json({ error: 'Failed to calculate price estimate' });
  }
});

// Update a price rate
router.put('/rates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { baseFare } = req.body;
    
    if (typeof baseFare !== 'number') {
      return res.status(400).json({ error: 'Base fare must be a number' });
    }
    
    const updatedRate = await req.prisma.pricingRate.update({
      where: { id },
      data: { baseFare }
    });
    
    return res.json(updatedRate);
  } catch (error) {
    console.error('Error updating price rate:', error);
    return res.status(500).json({ error: 'Failed to update price rate' });
  }
});

export default router;
