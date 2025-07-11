import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createFleetOwnerSchema = z.object({
  businessName: z.string().optional(),
  businessRegNumber: z.string().optional(),
  phoneNumber: z.string(),
  address: z.string(),
  city: z.string(),
  province: z.string(),
  postalCode: z.string(),
  idDocument: z.string(),
  businessRegDoc: z.string().optional(),
  proofOfOwnership: z.string().optional(),
  profilePhoto: z.string().optional(),
});

const createTruckSchema = z.object({
  name: z.string(),
  licensePlate: z.string(),
  vehicleType: z.enum(['SMALL_TRUCK', 'MEDIUM_TRUCK', 'LARGE_TRUCK', 'REFRIGERATED', 'FLATBED', 'CONTAINER', 'CRANE_TRUCK', 'FURNITURE_VAN']),
  capacity: z.number(),
  maxWeight: z.number(),
  year: z.number(),
  make: z.string(),
  model: z.string(),
  color: z.string(),
  registrationDoc: z.string(),
  insuranceDoc: z.string(),
  roadworthyDoc: z.string().optional(),
  permitDoc: z.string().optional(),
});

const createDriverProfileSchema = z.object({
  phoneNumber: z.string(),
  address: z.string(),
  city: z.string(),
  province: z.string(),
  postalCode: z.string(),
  profilePhoto: z.string().optional(),
  emergencyContact: z.string(),
  emergencyPhone: z.string(),
  licenseNumber: z.string(),
  licenseType: z.enum(['CODE_8', 'CODE_10', 'CODE_11', 'CODE_14', 'EBEC', 'PrDP']),
  pdpNumber: z.string(),
  licenseExpiry: z.string().transform((str) => new Date(str)),
  pdpExpiry: z.string().transform((str) => new Date(str)),
  licenseDoc: z.string(),
  pdpDoc: z.string(),
  idDocument: z.string(),
  medicalCert: z.string().optional(),
});

// GET /api/fleet - Get all fleet owners (Admin only)
router.get('/', async (req, res) => {
  try {
    const fleetOwners = await prisma.fleetOwner.findMany({
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        },
        trucks: {
          include: {
            assignments: {
              where: { isActive: true },
              include: {
                driver: {
                  include: {
                    user: {
                      select: { firstName: true, lastName: true }
                    }
                  }
                }
              }
            }
          }
        },
        drivers: true,
        _count: {
          select: { trucks: true, drivers: true }
        }
      }
    });

    res.json({
      success: true,
      data: fleetOwners
    });
  } catch (error) {
    console.error('Error fetching fleet owners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fleet owners',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/fleet/:id - Get specific fleet owner
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const fleetOwner = await prisma.fleetOwner.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        },
        trucks: {
          include: {
            assignments: {
              where: { isActive: true },
              include: {
                driver: {
                  include: {
                    user: {
                      select: { firstName: true, lastName: true }
                    }
                  }
                }
              }
            }
          }
        },
        drivers: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      }
    });

    if (!fleetOwner) {
      return res.status(404).json({
        success: false,
        message: 'Fleet owner not found'
      });
    }

    res.json({
      success: true,
      data: fleetOwner
    });
  } catch (error) {
    console.error('Error fetching fleet owner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fleet owner',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/fleet - Create new fleet owner
router.post('/', async (req, res) => {
  try {
    const validatedData = createFleetOwnerSchema.parse(req.body);
    const { userId } = req.body; // Should come from authenticated user

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if user exists and doesn't already have a fleet owner profile
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { fleetOwnerProfile: true }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (existingUser.fleetOwnerProfile) {
      return res.status(400).json({
        success: false,
        message: 'User already has a fleet owner profile'
      });
    }

    const fleetOwner = await prisma.fleetOwner.create({
      data: {
        userId,
        ...validatedData,
        verificationStatus: 'PENDING',
        trustScore: 0,
        reportCount: 0,
        flaggedForReview: false
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: fleetOwner,
      message: 'Fleet owner profile created successfully'
    });
  } catch (error) {
    console.error('Error creating fleet owner:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create fleet owner',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/fleet/:id/trucks - Add truck to fleet
router.post('/:id/trucks', async (req, res) => {
  try {
    const { id: fleetOwnerId } = req.params;
    const validatedData = createTruckSchema.parse(req.body);

    // Verify fleet owner exists
    const fleetOwner = await prisma.fleetOwner.findUnique({
      where: { id: fleetOwnerId }
    });

    if (!fleetOwner) {
      return res.status(404).json({
        success: false,
        message: 'Fleet owner not found'
      });
    }

    // Check if license plate is unique
    const existingTruck = await prisma.truck.findUnique({
      where: { licensePlate: validatedData.licensePlate }
    });

    if (existingTruck) {
      return res.status(400).json({
        success: false,
        message: 'A truck with this license plate already exists'
      });
    }

    const truck = await prisma.truck.create({
      data: {
        fleetOwnerId,
        ...validatedData,
        verificationStatus: 'PENDING',
        isActive: true,
        gpsEnabled: false
      }
    });

    res.status(201).json({
      success: true,
      data: truck,
      message: 'Truck added to fleet successfully'
    });
  } catch (error) {
    console.error('Error adding truck to fleet:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add truck to fleet',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/fleet/:id/trucks - Get all trucks for a fleet owner
router.get('/:id/trucks', async (req, res) => {
  try {
    const { id: fleetOwnerId } = req.params;

    const trucks = await prisma.truck.findMany({
      where: { fleetOwnerId },
      include: {
        assignments: {
          where: { isActive: true },
          include: {
            driver: {
              include: {
                user: {
                  select: { firstName: true, lastName: true }
                }
              }
            }
          }
        },
        bookings: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] }
          },
          select: { id: true, status: true, scheduledDateTime: true }
        }
      }
    });

    res.json({
      success: true,
      data: trucks
    });
  } catch (error) {
    console.error('Error fetching fleet trucks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fleet trucks',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/fleet/:id/drivers - Add driver to fleet
router.post('/:id/drivers', async (req, res) => {
  try {
    const { id: fleetOwnerId } = req.params;
    const validatedData = createDriverProfileSchema.parse(req.body);
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Verify fleet owner exists
    const fleetOwner = await prisma.fleetOwner.findUnique({
      where: { id: fleetOwnerId }
    });

    if (!fleetOwner) {
      return res.status(404).json({
        success: false,
        message: 'Fleet owner not found'
      });
    }

    // Check if user exists and doesn't already have a driver profile
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { newDriverProfile: true }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (existingUser.newDriverProfile) {
      return res.status(400).json({
        success: false,
        message: 'User already has a driver profile'
      });
    }

    const driverProfile = await prisma.driverProfile.create({
      data: {
        userId,
        fleetOwnerId,
        ...validatedData,
        verificationStatus: 'PENDING',
        rating: 0,
        totalTrips: 0,
        completedTrips: 0,
        cancelledTrips: 0,
        isOnline: false,
        isAvailable: true,
        trustScore: 0,
        reportCount: 0,
        flaggedForReview: false,
        backgroundCheckStatus: 'PENDING'
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: driverProfile,
      message: 'Driver added to fleet successfully'
    });
  } catch (error) {
    console.error('Error adding driver to fleet:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add driver to fleet',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/fleet/:fleetId/trucks/:truckId/assign/:driverId - Assign driver to truck
router.put('/:fleetId/trucks/:truckId/assign/:driverId', async (req, res) => {
  try {
    const { fleetId, truckId, driverId } = req.params;
    const { notes } = req.body;

    // Verify ownership and relationships
    const truck = await prisma.truck.findFirst({
      where: { id: truckId, fleetOwnerId: fleetId }
    });

    if (!truck) {
      return res.status(404).json({
        success: false,
        message: 'Truck not found or does not belong to this fleet'
      });
    }

    const driverProfile = await prisma.driverProfile.findFirst({
      where: { id: driverId, fleetOwnerId: fleetId }
    });

    if (!driverProfile) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found or does not belong to this fleet'
      });
    }

    // Deactivate any existing assignment for this truck
    await prisma.truckAssignment.updateMany({
      where: { truckId, isActive: true },
      data: { isActive: false, unassignedAt: new Date() }
    });

    // Create new assignment
    const assignment = await prisma.truckAssignment.create({
      data: {
        truckId,
        driverId,
        assignedAt: new Date(),
        isActive: true,
        notes: notes || 'Assigned via fleet management'
      },
      include: {
        truck: true,
        driver: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: assignment,
      message: 'Driver assigned to truck successfully'
    });
  } catch (error) {
    console.error('Error assigning driver to truck:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign driver to truck',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
