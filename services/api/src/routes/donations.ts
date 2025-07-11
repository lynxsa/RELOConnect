import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/donations/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

// Validation schemas
const createDonationSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  category: z.enum(['FURNITURE', 'ELECTRONICS', 'CLOTHING', 'BOOKS', 'APPLIANCES', 'OTHER']),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

const updateDonationSchema = createDonationSchema.partial();

// Get all donations (with filters)
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      condition, 
      city, 
      status = 'AVAILABLE',
      latitude,
      longitude,
      radius = 20,
      page = 1,
      limit = 20
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    let whereClause: any = {
      status: status as string
    };

    // Apply filters
    if (category) whereClause.category = category;
    if (condition) whereClause.condition = condition;
    if (city) whereClause.city = { contains: city as string, mode: 'insensitive' };

    // Location-based filtering (simplified)
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const radiusKm = parseFloat(radius as string);

      const latDelta = radiusKm / 111;
      const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

      whereClause.latitude = {
        gte: lat - latDelta,
        lte: lat + latDelta,
      };
      whereClause.longitude = {
        gte: lng - lngDelta,
        lte: lng + lngDelta,
      };
    }

    const [donations, total] = await Promise.all([
      prisma.donationItem.findMany({
        where: whereClause,
        include: {
          donor: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            }
          },
          requester: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take,
      }),
      prisma.donationItem.count({
        where: whereClause
      })
    ]);

    return res.json({
      donations,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get donations error:', error);
    return res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// Get donation by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const donation = await prisma.donationItem.findUnique({
      where: { id },
      include: {
        donor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
          }
        },
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
          }
        }
      }
    });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    return res.json({ donation });
  } catch (error) {
    console.error('Get donation error:', error);
    return res.status(500).json({ error: 'Failed to fetch donation' });
  }
});

// Get user's donations
router.get('/user/donations', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { status, type = 'donated' } = req.query;

    let whereClause: any = {};

    if (type === 'donated') {
      whereClause.donorId = userId;
    } else if (type === 'requested') {
      whereClause.requesterId = userId;
    } else {
      // Both donated and requested
      whereClause = {
        OR: [
          { donorId: userId },
          { requesterId: userId }
        ]
      };
    }

    if (status) {
      whereClause.status = status;
    }

    const donations = await prisma.donationItem.findMany({
      where: whereClause,
      include: {
        donor: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        requester: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.json({ donations });
  } catch (error) {
    console.error('Get user donations error:', error);
    return res.status(500).json({ error: 'Failed to fetch user donations' });
  }
});

// Create donation
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const validatedData = createDonationSchema.parse(req.body);
    
    const files = req.files as Express.Multer.File[];
    const images = files ? files.map(file => `/uploads/donations/${file.filename}`) : [];

    if (images.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' });
    }

    const donation = await prisma.donationItem.create({
      data: {
        ...validatedData,
        images,
        donorId: userId,
      },
      include: {
        donor: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          }
        }
      }
    });

    return res.status(201).json({
      message: 'Donation created successfully',
      donation
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Create donation error:', error);
    return res.status(500).json({ error: 'Failed to create donation' });
  }
});

// Update donation
router.put('/:id', upload.array('images', 5), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const validatedData = updateDonationSchema.parse(req.body);

    // Check if user owns this donation
    const existingDonation = await prisma.donationItem.findUnique({
      where: { id }
    });

    if (!existingDonation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (existingDonation.donorId !== userId) {
      return res.status(403).json({ error: 'You can only update your own donations' });
    }

    if (existingDonation.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'Cannot update donation that is not available' });
    }

    const files = req.files as Express.Multer.File[];
    let updateData: any = validatedData;

    // If new images are uploaded, add them to existing images
    if (files && files.length > 0) {
      const newImages = files.map(file => `/uploads/donations/${file.filename}`);
      updateData.images = [...existingDonation.images, ...newImages];
    }

    const donation = await prisma.donationItem.update({
      where: { id },
      data: updateData,
      include: {
        donor: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          }
        }
      }
    });

    return res.json({
      message: 'Donation updated successfully',
      donation
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Update donation error:', error);
    return res.status(500).json({ error: 'Failed to update donation' });
  }
});

// Request donation
router.post('/:id/request', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const donation = await prisma.donationItem.findUnique({
      where: { id },
      include: {
        donor: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (donation.donorId === userId) {
      return res.status(400).json({ error: 'You cannot request your own donation' });
    }

    if (donation.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'Donation is not available' });
    }

    const updatedDonation = await prisma.donationItem.update({
      where: { id },
      data: {
        status: 'REQUESTED',
        requesterId: userId,
      },
      include: {
        donor: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        requester: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          }
        }
      }
    });

    return res.json({
      message: 'Donation requested successfully',
      donation: updatedDonation
    });
  } catch (error) {
    console.error('Request donation error:', error);
    return res.status(500).json({ error: 'Failed to request donation' });
  }
});

// Accept/Reject donation request (donor only)
router.put('/:id/request/:action', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id, action } = req.params;

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use accept or reject' });
    }

    const donation = await prisma.donationItem.findUnique({
      where: { id }
    });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (donation.donorId !== userId) {
      return res.status(403).json({ error: 'Only the donor can accept/reject requests' });
    }

    if (donation.status !== 'REQUESTED') {
      return res.status(400).json({ error: 'No pending request for this donation' });
    }

    let newStatus = 'AVAILABLE';
    let requesterId = donation.requesterId;

    if (action === 'accept') {
      newStatus = 'COLLECTED';
    } else {
      requesterId = null; // Clear requester if rejected
    }

    const updatedDonation = await prisma.donationItem.update({
      where: { id },
      data: {
        status: newStatus as any,
        requesterId,
      },
      include: {
        donor: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        requester: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          }
        }
      }
    });

    return res.json({
      message: `Request ${action}ed successfully`,
      donation: updatedDonation
    });
  } catch (error) {
    console.error('Accept/Reject request error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
});

// Mark donation as completed
router.put('/:id/complete', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const donation = await prisma.donationItem.findUnique({
      where: { id }
    });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    // Both donor and requester can mark as completed
    if (donation.donorId !== userId && donation.requesterId !== userId) {
      return res.status(403).json({ error: 'Only donor or requester can mark as completed' });
    }

    if (donation.status !== 'COLLECTED') {
      return res.status(400).json({ error: 'Donation must be collected before marking as completed' });
    }

    const updatedDonation = await prisma.donationItem.update({
      where: { id },
      data: {
        status: 'COMPLETED',
      },
      include: {
        donor: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          }
        },
        requester: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          }
        }
      }
    });

    return res.json({
      message: 'Donation marked as completed',
      donation: updatedDonation
    });
  } catch (error) {
    console.error('Complete donation error:', error);
    return res.status(500).json({ error: 'Failed to complete donation' });
  }
});

// Delete donation
router.delete('/:id', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const donation = await prisma.donationItem.findUnique({
      where: { id }
    });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    if (donation.donorId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own donations' });
    }

    if (donation.status === 'COLLECTED') {
      return res.status(400).json({ error: 'Cannot delete collected donations' });
    }

    await prisma.donationItem.delete({
      where: { id }
    });

    return res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Delete donation error:', error);
    return res.status(500).json({ error: 'Failed to delete donation' });
  }
});

// Get donation statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const [
      totalDonations,
      totalRequests,
      completedDonations,
      availableDonations
    ] = await Promise.all([
      prisma.donationItem.count({
        where: { donorId: userId }
      }),
      prisma.donationItem.count({
        where: { requesterId: userId }
      }),
      prisma.donationItem.count({
        where: {
          OR: [
            { donorId: userId },
            { requesterId: userId }
          ],
          status: 'COMPLETED'
        }
      }),
      prisma.donationItem.count({
        where: { status: 'AVAILABLE' }
      })
    ]);

    return res.json({
      stats: {
        totalDonations,
        totalRequests,
        completedDonations,
        availableDonations
      }
    });
  } catch (error) {
    console.error('Get donation stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch donation statistics' });
  }
});

export default router;
