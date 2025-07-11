import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createVehicleSchema = z.object({
  type: z.enum(['VAN', 'TRUCK', 'PICKUP', 'MOTORCYCLE']),
  capacity: z.number().positive(),
  maxWeight: z.number().positive(),
  name: z.string().min(1),
  description: z.string().min(1),
  basePrice: z.number().positive(),
  pricePerKm: z.number().positive(),
  icon: z.string().min(1),
});

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        _count: {
          select: {
            drivers: true,
            bookings: true
          }
        }
      },
      orderBy: {
        basePrice: 'asc'
      }
    });

    return res.json({ vehicles });
  } catch (error) {
    console.error('Get vehicles error:', error);
    return res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Get vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        drivers: {
          where: {
            isOnline: true
          },
          select: {
            id: true,
            rating: true,
            totalTrips: true,
            currentLatitude: true,
            currentLongitude: true,
            currentAddress: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            drivers: true,
            bookings: true
          }
        }
      }
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    return res.json({ vehicle });
  } catch (error) {
    console.error('Get vehicle error:', error);
    return res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// Get vehicles by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;

    if (!['VAN', 'TRUCK', 'PICKUP', 'MOTORCYCLE'].includes(type.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid vehicle type' });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: {
        type: type.toUpperCase() as any
      },
      include: {
        _count: {
          select: {
            drivers: true,
            bookings: true
          }
        }
      },
      orderBy: {
        basePrice: 'asc'
      }
    });

    return res.json({ vehicles });
  } catch (error) {
    console.error('Get vehicles by type error:', error);
    return res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Get price estimate
router.post('/estimate', async (req, res) => {
  try {
    const { vehicleId, distance, extras } = req.body;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Calculate base price
    let totalPrice = vehicle.basePrice + (vehicle.pricePerKm * distance);

    // Add extra service costs
    const extrasCost = {
      loadingService: 150,
      packingService: 250,
      cleaningService: 200,
      expressService: 300,
      insuranceService: 100,
      stairsService: 50, // per floor
    };

    if (extras) {
      if (extras.loadingService) totalPrice += extrasCost.loadingService;
      if (extras.packingService) totalPrice += extrasCost.packingService;
      if (extras.cleaningService) totalPrice += extrasCost.cleaningService;
      if (extras.expressService) totalPrice += extrasCost.expressService;
      if (extras.insuranceService) totalPrice += extrasCost.insuranceService;
      if (extras.stairsCount > 0) totalPrice += extrasCost.stairsService * extras.stairsCount;
    }

    return res.json({
      vehicle: {
        id: vehicle.id,
        name: vehicle.name,
        type: vehicle.type,
        basePrice: vehicle.basePrice,
        pricePerKm: vehicle.pricePerKm,
      },
      distance,
      estimation: {
        basePrice: vehicle.basePrice,
        distancePrice: vehicle.pricePerKm * distance,
        extrasPrice: totalPrice - (vehicle.basePrice + (vehicle.pricePerKm * distance)),
        totalPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
      }
    });
  } catch (error) {
    console.error('Price estimate error:', error);
    return res.status(500).json({ error: 'Failed to calculate price estimate' });
  }
});

// Find available drivers for vehicle
router.get('/:id/drivers', async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, radius = 20 } = req.query;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id }
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    let whereClause: any = {
      vehicleId: id,
      isOnline: true,
    };

    // If location is provided, filter by proximity (simplified)
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const radiusKm = parseFloat(radius as string);

      // Simple bounding box calculation (more sophisticated geo queries would use PostGIS)
      const latDelta = radiusKm / 111; // Rough km to lat conversion
      const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

      whereClause.currentLatitude = {
        gte: lat - latDelta,
        lte: lat + latDelta,
      };
      whereClause.currentLongitude = {
        gte: lng - lngDelta,
        lte: lng + lngDelta,
      };
    }

    const drivers = await prisma.driver.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
          }
        },
        vehicle: {
          select: {
            name: true,
            type: true,
          }
        }
      },
      orderBy: {
        rating: 'desc'
      }
    });

    return res.json({ drivers });
  } catch (error) {
    console.error('Find drivers error:', error);
    return res.status(500).json({ error: 'Failed to find available drivers' });
  }
});

// Create vehicle (Admin only - would need admin middleware)
router.post('/', async (req, res) => {
  try {
    const validatedData = createVehicleSchema.parse(req.body);

    const vehicle = await prisma.vehicle.create({
      data: validatedData
    });

    return res.status(201).json({ 
      message: 'Vehicle created successfully',
      vehicle 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Create vehicle error:', error);
    return res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

// Update vehicle (Admin only - would need admin middleware)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = createVehicleSchema.partial().parse(req.body);

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: validatedData
    });

    return res.json({ 
      message: 'Vehicle updated successfully',
      vehicle 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Update vehicle error:', error);
    return res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// Delete vehicle (Admin only - would need admin middleware)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vehicle has active bookings
    const activeBookings = await prisma.booking.findMany({
      where: {
        vehicleId: id,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
        }
      }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete vehicle with active bookings' 
      });
    }

    await prisma.vehicle.delete({
      where: { id }
    });

    return res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

export default router;
