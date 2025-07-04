import express from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
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
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'));
    }
  }
});

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

const driverDocumentSchema = z.object({
  licenseNumber: z.string().min(1),
  vehicleId: z.string().min(1),
  accountNumber: z.string().min(1),
  bankName: z.string().min(1),
  accountHolder: z.string().min(1),
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = (req as any).userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isVerified: true,
        avatar: true,
        createdAt: true,
        driverProfile: {
          select: {
            id: true,
            licenseNumber: true,
            vehicleId: true,
            rating: true,
            totalTrips: true,
            isOnline: true,
            accountNumber: true,
            bankName: true,
            accountHolder: true,
            vehicle: {
              select: {
                id: true,
                type: true,
                name: true,
                capacity: true,
                maxWeight: true,
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const validatedData = updateProfileSchema.parse(req.body);

    // Check if email is being updated and is already taken
    if (validatedData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      });
      
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    // Check if phone is being updated and is already taken
    if (validatedData.phone) {
      const existingUser = await prisma.user.findUnique({
        where: { phone: validatedData.phone }
      });
      
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Phone number already in use' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isVerified: true,
        avatar: true,
      }
    });

    return res.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

// Upload profile picture
router.post('/profile-picture', upload.single('avatar'), async (req, res) => {
  try {
    const userId = (req as any).userId;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/documents/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        avatar: true
      }
    });

    return res.json({ 
      message: 'Profile picture updated successfully',
      avatar: updatedUser.avatar 
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    return res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

// Driver document upload and profile creation
router.post('/driver/documents', upload.fields([
  { name: 'licenseDoc', maxCount: 1 },
  { name: 'idDoc', maxCount: 1 },
  { name: 'vehicleRegDoc', maxCount: 1 },
  { name: 'insuranceDoc', maxCount: 1 }
]), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const validatedData = driverDocumentSchema.parse(req.body);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { driverProfile: true }
    });

    if (!user || user.role !== Role.DRIVER) {
      return res.status(403).json({ error: 'Only drivers can upload documents' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files.licenseDoc || !files.idDoc || !files.vehicleRegDoc || !files.insuranceDoc) {
      return res.status(400).json({ error: 'All document files are required' });
    }

    const documentUrls = {
      licenseDoc: `/uploads/documents/${files.licenseDoc[0].filename}`,
      idDoc: `/uploads/documents/${files.idDoc[0].filename}`,
      vehicleRegDoc: `/uploads/documents/${files.vehicleRegDoc[0].filename}`,
      insuranceDoc: `/uploads/documents/${files.insuranceDoc[0].filename}`,
    };

    // Create or update driver profile
    const driverProfile = await prisma.driver.upsert({
      where: { userId },
      create: {
        userId,
        licenseNumber: validatedData.licenseNumber,
        vehicleId: validatedData.vehicleId,
        accountNumber: validatedData.accountNumber,
        bankName: validatedData.bankName,
        accountHolder: validatedData.accountHolder,
        ...documentUrls,
      },
      update: {
        licenseNumber: validatedData.licenseNumber,
        vehicleId: validatedData.vehicleId,
        accountNumber: validatedData.accountNumber,
        bankName: validatedData.bankName,
        accountHolder: validatedData.accountHolder,
        ...documentUrls,
      },
      include: {
        vehicle: true
      }
    });

    return res.json({ 
      message: 'Documents uploaded successfully',
      driverProfile 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Driver document upload error:', error);
    return res.status(500).json({ error: 'Failed to upload documents' });
  }
});

// Get driver status
router.get('/driver/status', async (req, res) => {
  try {
    const userId = (req as any).userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        driverProfile: {
          include: {
            vehicle: true
          }
        }
      }
    });

    if (!user || user.role !== Role.DRIVER) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json({ driver: user.driverProfile });
  } catch (error) {
    console.error('Get driver status error:', error);
    return res.status(500).json({ error: 'Failed to fetch driver status' });
  }
});

// Update driver availability
router.put('/driver/availability', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { isOnline } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { driverProfile: true }
    });

    if (!user || user.role !== Role.DRIVER) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!user.driverProfile) {
      return res.status(400).json({ error: 'Driver profile must be created first' });
    }

    const updatedDriver = await prisma.driver.update({
      where: { userId },
      data: { isOnline: Boolean(isOnline) },
      select: {
        id: true,
        isOnline: true
      }
    });

    return res.json({ 
      message: `Driver status updated to ${updatedDriver.isOnline ? 'online' : 'offline'}`,
      driver: updatedDriver 
    });
  } catch (error) {
    console.error('Update driver availability error:', error);
    return res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Update driver location
router.put('/driver/location', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { latitude, longitude, address } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { driverProfile: true }
    });

    if (!user || user.role !== Role.DRIVER) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!user.driverProfile) {
      return res.status(400).json({ error: 'Driver profile must be created first' });
    }

    const updatedDriver = await prisma.driver.update({
      where: { userId },
      data: { 
        currentLatitude: parseFloat(latitude),
        currentLongitude: parseFloat(longitude),
        currentAddress: address
      },
      select: {
        id: true,
        currentLatitude: true,
        currentLongitude: true,
        currentAddress: true
      }
    });

    return res.json({ 
      message: 'Location updated successfully',
      driver: updatedDriver 
    });
  } catch (error) {
    console.error('Update driver location error:', error);
    return res.status(500).json({ error: 'Failed to update location' });
  }
});

// Delete account
router.delete('/account', async (req, res) => {
  try {
    const userId = (req as any).userId;

    // Check for active bookings
    const activeBookings = await prisma.booking.findMany({
      where: {
        userId: userId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
        }
      }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete account with active bookings. Please complete or cancel them first.' 
      });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    return res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
