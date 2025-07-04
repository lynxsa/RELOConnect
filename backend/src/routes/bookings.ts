import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Validation schemas
const createBookingSchema = z.object({
  pickupLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  dropoffLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  scheduledDateTime: z.string().datetime(),
  vehicleType: z.enum(['van', 'truck', 'pickup', 'motorcycle']),
  estimatedDistance: z.number(),
  estimatedDuration: z.number(),
  packageDetails: z.object({
    description: z.string(),
    weight: z.number().optional(),
    volume: z.number().optional(),
    fragile: z.boolean(),
    valuable: z.boolean(),
  }),
  extraServices: z.object({
    loading: z.boolean(),
    stairs: z.number(),
    packing: z.boolean(),
    cleaning: z.boolean(),
    express: z.boolean(),
    insurance: z.boolean(),
  }),
  totalPrice: z.number(),
  paymentMethod: z.enum(['card', 'yoco', 'apple_pay', 'google_pay']),
});

// Create a new booking
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = createBookingSchema.parse(req.body);
    
// Get or create vehicle based on type
    const vehicle = await prisma.vehicle.findFirst({
      where: { type: validatedData.vehicleType.toUpperCase() as any },
    });

    if (!vehicle) {
      return res.status(400).json({ error: 'Vehicle type not found' });
    }

    const booking = await prisma.booking.create({
      data: {
        // Pickup location
        pickupLatitude: validatedData.pickupLocation.latitude,
        pickupLongitude: validatedData.pickupLocation.longitude,
        pickupAddress: validatedData.pickupLocation.address,
        pickupCity: validatedData.pickupLocation.city,
        pickupState: validatedData.pickupLocation.state,
        pickupPostalCode: validatedData.pickupLocation.postalCode,
        pickupCountry: validatedData.pickupLocation.country,
        
        // Dropoff location
        dropoffLatitude: validatedData.dropoffLocation.latitude,
        dropoffLongitude: validatedData.dropoffLocation.longitude,
        dropoffAddress: validatedData.dropoffLocation.address,
        dropoffCity: validatedData.dropoffLocation.city,
        dropoffState: validatedData.dropoffLocation.state,
        dropoffPostalCode: validatedData.dropoffLocation.postalCode,
        dropoffCountry: validatedData.dropoffLocation.country,
        
        // Other fields
        scheduledDateTime: new Date(validatedData.scheduledDateTime),
        vehicleId: vehicle.id,
        estimatedDistance: validatedData.estimatedDistance,
        estimatedDuration: validatedData.estimatedDuration,
        
        // Package details
        packageDescription: validatedData.packageDetails.description,
        packageWeight: validatedData.packageDetails.weight,
        packageVolume: validatedData.packageDetails.volume,
        isFragile: validatedData.packageDetails.fragile,
        isValuable: validatedData.packageDetails.valuable,
        
        // Extra services
        loadingService: validatedData.extraServices.loading,
        stairsCount: validatedData.extraServices.stairs,
        packingService: validatedData.extraServices.packing,
        cleaningService: validatedData.extraServices.cleaning,
        expressService: validatedData.extraServices.express,
        insuranceService: validatedData.extraServices.insurance,
        
        totalPrice: validatedData.totalPrice,
        paymentMethod: validatedData.paymentMethod.toUpperCase() as any,
        status: 'PENDING',
        userId: req.user!.userId,
      },
    });

    return res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }
    
    console.error('Create booking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's bookings
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        driver: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            rating: true,
            vehicle: true,
          },
        },
      },
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific booking
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        driver: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            rating: true,
            vehicle: true,
            currentLatitude: true,
            currentLongitude: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    return res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking status
router.patch('/:id/status', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
    });

    return res.json({
      message: 'Booking status updated successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel booking
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'IN_PROGRESS') {
      return res.status(400).json({ 
        error: 'Cannot cancel booking that is already in progress' 
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });

    return res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get price estimate
router.post('/estimate', async (req: Request, res: Response) => {
  try {
    const { distance, vehicleType, extraServices } = req.body;
    
    // Base pricing logic (simplified)
    const basePrices: Record<string, { base: number; perKm: number }> = {
      motorcycle: { base: 40, perKm: 1.5 },
      pickup: { base: 60, perKm: 2 },
      van: { base: 80, perKm: 2.5 },
      truck: { base: 120, perKm: 3.5 },
    };

    const vehiclePricing = basePrices[vehicleType] || basePrices.van;
    let totalPrice = vehiclePricing.base + (distance * vehiclePricing.perKm);

    // Add extra services
    if (extraServices) {
      if (extraServices.loading) totalPrice += 150;
      if (extraServices.stairs) totalPrice += extraServices.stairs * 50;
      if (extraServices.packing) totalPrice += 200;
      if (extraServices.cleaning) totalPrice += 180;
      if (extraServices.express) totalPrice += 100;
      if (extraServices.insurance) totalPrice += 80;
    }

    res.json({
      basePrice: vehiclePricing.base + (distance * vehiclePricing.perKm),
      extraServicesPrice: totalPrice - (vehiclePricing.base + (distance * vehiclePricing.perKm)),
      totalPrice: Math.round(totalPrice * 100) / 100,
      currency: 'ZAR',
    });
  } catch (error) {
    console.error('Price estimate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
