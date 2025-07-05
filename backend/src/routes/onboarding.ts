import express, { Request, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { prisma } from '../middleware/prisma';
import { reloAI } from '../services/reloAI';
import { authenticateToken, requireRole } from '../middleware/auth';
import { auditLog } from '../middleware/auditLog';
import { rateLimit } from 'express-rate-limit';
import crypto from 'crypto';
import { sendEmail } from '../services/emailService';
import { extractDocumentData } from '../services/ocrService';
import { performBackgroundCheck } from '../services/backgroundCheckService';

// Extend Request interface for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

const router = express.Router();

// ===== RATE LIMITING =====

const onboardingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many onboarding attempts, please try again later.',
});

const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 uploads per 10 minutes
  message: 'Upload limit exceeded, please wait before uploading more documents.',
});

// ===== MULTER CONFIGURATION =====

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed.'));
    }
  },
});

// ===== VALIDATION SCHEMAS =====

const OwnerOnboardingSchema = z.object({
  name: z.string().min(2).max(100),
  businessName: z.string().min(2).max(200).optional(),
  regNumber: z.string().regex(/^[0-9]{4}\/[0-9]{6}\/[0-9]{2}$/).optional(),
  vatNumber: z.string().regex(/^[0-9]{10}$/).optional(),
  contactInfo: z.object({
    email: z.string().email(),
    phone: z.string().regex(/^(\+27|0)[0-9]{9}$/),
    address: z.object({
      street: z.string(),
      city: z.string(),
      province: z.string(),
      postalCode: z.string().regex(/^[0-9]{4}$/),
      country: z.string().default('ZA'),
    }),
  }),
});

const DriverOnboardingSchema = z.object({
  inviteToken: z.string(),
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^(\+27|0)[0-9]{9}$/),
  dob: z.string().transform((str) => new Date(str)),
  licenseNumber: z.string().min(8).max(15),
});

const TruckRegistrationSchema = z.object({
  plate: z.string().regex(/^[A-Z]{2,3}\s[0-9]{3,4}\s[A-Z]{2,3}$/),
  makeModel: z.string(),
  capacityTons: z.number().min(0.5).max(50),
  gpsDeviceId: z.string().optional(),
});

const UserSignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^(\+27|0)[0-9]{9}$/),
});

const AssistantOnboardingSchema = z.object({
  parentId: z.string().uuid(),
  parentType: z.enum(['OWNER', 'DRIVER']),
  name: z.string().min(2).max(100),
  email: z.string().email().optional(),
  phone: z.string().regex(/^(\+27|0)[0-9]{9}$/),
});

const BankInfoSchema = z.object({
  accountNumber: z.string().min(8).max(11),
  bankCode: z.string().length(6),
  accountHolder: z.string(),
  accountType: z.enum(['SAVINGS', 'CURRENT']),
});

// ===== OWNER ONBOARDING ENDPOINTS =====

/**
 * POST /owner/onboard
 * Initialize owner onboarding process (KYB)
 */
router.post('/owner/onboard', onboardingLimiter, async (req, res) => {
  try {
    const validatedData = OwnerOnboardingSchema.parse(req.body);
    
    // Check for existing registration
    const existingOwner = await prisma.owner.findFirst({
      where: {
        OR: [
          { contactInfo: { path: ['email'], equals: validatedData.contactInfo.email } },
          { regNumber: validatedData.regNumber },
          { vatNumber: validatedData.vatNumber },
        ],
      },
    });

    if (existingOwner) {
      return res.status(409).json({
        code: 'RESOURCE_EXISTS',
        message: 'Owner with this email, registration, or VAT number already exists',
        timestamp: new Date().toISOString(),
      });
    }

    // Generate invite code for drivers
    const inviteCode = crypto.randomBytes(8).toString('hex').toUpperCase();

    // Create owner profile
    const owner = await prisma.owner.create({
      data: {
        name: validatedData.name,
        businessName: validatedData.businessName,
        regNumber: validatedData.regNumber,
        vatNumber: validatedData.vatNumber,
        contactInfo: validatedData.contactInfo,
        inviteCode,
        onboardingStep: 1,
        kycStatus: 'PENDING',
      },
    });

    // Log audit trail
    await auditLog({
      entityType: 'Owner',
      entityId: owner.id,
      action: 'CREATED',
      actorType: 'SYSTEM',
      changes: { created: validatedData },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(201).json({
      ownerId: owner.id,
      kycStatus: owner.kycStatus,
      nextSteps: [
        'Upload identification documents',
        'Complete face verification (optional)',
        'Upload UBO documents (if applicable)',
      ],
      inviteCode: owner.inviteCode,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        validationErrors: error.errors,
        timestamp: new Date().toISOString(),
      });
    }
    
    console.error('Owner onboarding error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to process owner onboarding',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /owner/upload-id
 * Upload owner identification documents
 */
router.post('/owner/upload-id', uploadLimiter, upload.fields([
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 },
]), async (req, res) => {
  try {
    const { ownerId } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!ownerId || !files.idFront) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Owner ID and front ID document are required',
        timestamp: new Date().toISOString(),
      });
    }

    const owner = await prisma.owner.findUnique({ where: { id: ownerId } });
    if (!owner) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Owner not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Extract document data using OCR
    const frontData = await extractDocumentData(files.idFront[0].buffer, 'ID_DOCUMENT');
    const backData = files.idBack ? 
      await extractDocumentData(files.idBack[0].buffer, 'ID_DOCUMENT') : null;

    // Store documents and extracted data
    const documentData = {
      front: {
        data: frontData,
        uploadedAt: new Date().toISOString(),
      },
      back: backData ? {
        data: backData,
        uploadedAt: new Date().toISOString(),
      } : null,
    };

    // Update owner with document information
    await prisma.owner.update({
      where: { id: ownerId },
      data: {
        idDocuments: documentData,
        onboardingStep: 2,
        kycStatus: 'DOCUMENTS_REQUIRED', // May need face verification
      },
    });

    // Log audit trail
    await auditLog({
      entityType: 'Owner',
      entityId: ownerId,
      action: 'DOCUMENTS_UPLOADED',
      actorType: 'USER',
      actorId: ownerId,
      changes: { documents: 'ID documents uploaded' },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      success: true,
      extractedData: {
        idNumber: frontData.idNumber,
        fullName: frontData.fullName,
        dateOfBirth: frontData.dateOfBirth,
        expiryDate: frontData.expiryDate,
      },
      verificationStatus: 'DOCUMENTS_UPLOADED',
      confidence: frontData.confidence,
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      code: 'UPLOAD_ERROR',
      message: 'Failed to process document upload',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /owner/verify-face
 * Perform face verification for owners (optional)
 */
router.post('/owner/verify-face', uploadLimiter, upload.single('selfie'), async (req, res) => {
  try {
    const { ownerId } = req.body;
    const selfieFile = req.file;

    if (!ownerId || !selfieFile) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Owner ID and selfie are required',
        timestamp: new Date().toISOString(),
      });
    }

    const owner = await prisma.owner.findUnique({ where: { id: ownerId } });
    if (!owner) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Owner not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Perform face verification using Gemini
    const verificationResult = await reloAI.verifyFace(
      selfieFile.buffer,
      undefined,
      'owner'
    );

    // Update owner with face verification data
    await prisma.owner.update({
      where: { id: ownerId },
      data: {
        faceVerification: verificationResult,
        onboardingStep: verificationResult.passed ? 3 : 2,
        kycStatus: verificationResult.passed ? 'UNDER_REVIEW' : 'DOCUMENTS_REQUIRED',
      },
    });

    // Log audit trail
    await auditLog({
      entityType: 'Owner',
      entityId: ownerId,
      action: 'FACE_VERIFIED',
      actorType: 'USER',
      actorId: ownerId,
      changes: { 
        faceVerification: {
          passed: verificationResult.passed,
          score: verificationResult.matchScore,
        },
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json(verificationResult);
  } catch (error) {
    console.error('Face verification error:', error);
    res.status(500).json({
      code: 'VERIFICATION_ERROR',
      message: 'Failed to process face verification',
      timestamp: new Date().toISOString(),
    });
  }
});

// ===== TRUCK REGISTRATION ENDPOINTS =====

/**
 * POST /truck/register
 * Register a new truck
 */
router.post('/truck/register', authenticateToken, requireRole(['owner']), async (req: AuthenticatedRequest, res) => {
  try {
    const validatedData = TruckRegistrationSchema.parse(req.body);
    const ownerId = req.user?.userId;

    if (!ownerId) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Owner authentication required',
        timestamp: new Date().toISOString(),
      });
    }

    // Check for duplicate plate number
    const existingTruck = await prisma.truck.findUnique({
      where: { plate: validatedData.plate },
    });

    if (existingTruck) {
      return res.status(409).json({
        code: 'RESOURCE_EXISTS',
        message: 'Truck with this plate number already registered',
        timestamp: new Date().toISOString(),
      });
    }

    // Create truck record
    const truck = await prisma.truck.create({
      data: {
        ...validatedData,
        ownerId,
        status: 'INACTIVE', // Needs documents before activation
      },
    });

    // Log audit trail
    await auditLog({
      entityType: 'Truck',
      entityId: truck.id,
      action: 'CREATED',
      actorType: 'USER',
      actorId: ownerId,
      changes: { created: validatedData },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(201).json({
      truckId: truck.id,
      status: truck.status,
      requiredDocuments: [
        'License disc',
        'Insurance certificate',
        'Roadworthiness certificate',
      ],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid truck data',
        validationErrors: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    console.error('Truck registration error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to register truck',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /truck/upload-docs
 * Upload truck documentation
 */
router.post('/truck/upload-docs', uploadLimiter, upload.fields([
  { name: 'licenseDisc', maxCount: 1 },
  { name: 'insuranceCert', maxCount: 1 },
  { name: 'roadWorthiness', maxCount: 1 },
]), async (req, res) => {
  try {
    const { truckId } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!truckId) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Truck ID is required',
        timestamp: new Date().toISOString(),
      });
    }

    const truck = await prisma.truck.findUnique({ where: { id: truckId } });
    if (!truck) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Truck not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Process each uploaded document
    const documents: any = {};
    const expiryDates: any = {};

    for (const [fieldName, fileArray] of Object.entries(files)) {
      if (fileArray && fileArray.length > 0) {
        const file = fileArray[0];
        const extractedData = await extractDocumentData(file.buffer, 'VEHICLE_DOCUMENT');
        
        documents[fieldName] = {
          data: extractedData,
          uploadedAt: new Date().toISOString(),
        };

        // Extract expiry date if available
        if (extractedData.expiryDate) {
          expiryDates[fieldName] = extractedData.expiryDate;
        }
      }
    }

    // Update truck with documents
    await prisma.truck.update({
      where: { id: truckId },
      data: {
        documents,
        docExpiryDates: expiryDates,
        status: Object.keys(documents).length >= 2 ? 'AVAILABLE' : 'INACTIVE',
      },
    });

    // Log audit trail
    await auditLog({
      entityType: 'Truck',
      entityId: truckId,
      action: 'DOCUMENTS_UPLOADED',
      actorType: 'USER',
      actorId: truck.ownerId,
      changes: { documents: Object.keys(documents) },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      success: true,
      message: 'Documents uploaded successfully',
      documentsUploaded: Object.keys(documents),
      truckStatus: Object.keys(documents).length >= 2 ? 'AVAILABLE' : 'INACTIVE',
    });
  } catch (error) {
    console.error('Truck document upload error:', error);
    res.status(500).json({
      code: 'UPLOAD_ERROR',
      message: 'Failed to upload truck documents',
      timestamp: new Date().toISOString(),
    });
  }
});

// ===== DRIVER ONBOARDING ENDPOINTS =====

/**
 * POST /driver/invite
 * Send driver invitation
 */
router.post('/driver/invite', authenticateToken, requireRole(['owner']), async (req, res) => {
  try {
    const { email, name, message } = req.body;
    const ownerId = req.user.id;

    // Generate secure invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create driver record with invite
    const driver = await prisma.driver.create({
      data: {
        ownerId,
        name,
        email,
        phone: '', // Will be filled during onboarding
        dob: new Date(), // Will be updated during onboarding
        licenseNumber: '', // Will be updated during onboarding
        inviteToken,
        invitedAt: new Date(),
        kycStatus: 'PENDING'
      },
    });

    // Generate invite URL
    const inviteUrl = `${process.env.APP_URL}/driver/onboard?token=${inviteToken}`;

    // Send invitation email
    await sendEmail({
      to: email,
      subject: 'RELOConnect Driver Invitation',
      template: 'driver-invite',
      data: {
        ownerName: req.user.name,
        driverName: name,
        inviteUrl,
        expiresAt: expiresAt.toLocaleDateString(),
        personalMessage: message,
      },
    });

    // Log audit trail
    await auditLog({
      entityType: 'Driver',
      entityId: driver.id,
      action: 'INVITED',
      actorType: 'USER',
      actorId: ownerId,
      changes: { invited: { email, name } },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      inviteToken,
      expiresAt,
      inviteUrl,
      message: 'Driver invitation sent successfully',
    });
  } catch (error) {
    console.error('Driver invitation error:', error);
    res.status(500).json({
      code: 'INVITATION_ERROR',
      message: 'Failed to send driver invitation',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /driver/onboard
 * Complete driver onboarding
 */
router.post('/driver/onboard', onboardingLimiter, async (req, res) => {
  try {
    const validatedData = DriverOnboardingSchema.parse(req.body);

    // Find driver by invite token
    const driver = await prisma.driver.findUnique({
      where: { inviteToken: validatedData.inviteToken },
    });

    if (!driver) {
      return res.status(404).json({
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired invitation token',
        timestamp: new Date().toISOString(),
      });
    }

    // Check if invitation has expired (7 days)
    if (driver.invitedAt && Date.now() - driver.invitedAt.getTime() > 7 * 24 * 60 * 60 * 1000) {
      return res.status(400).json({
        code: 'EXPIRED_TOKEN',
        message: 'Invitation token has expired',
        timestamp: new Date().toISOString(),
      });
    }

    // Update driver with onboarding data
    const updatedDriver = await prisma.driver.update({
      where: { id: driver.id },
      data: {
        email: validatedData.email,
        phone: validatedData.phone,
        dob: validatedData.dob,
        licenseNumber: validatedData.licenseNumber,
        inviteToken: null, // Clear token after use
        kycStatus: 'DOCUMENTS_REQUIRED',
      },
    });

    // Log audit trail
    await auditLog({
      entityType: 'Driver',
      entityId: driver.id,
      action: 'ONBOARDED',
      actorType: 'USER',
      actorId: driver.id,
      changes: { onboarded: validatedData },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(201).json({
      driverId: updatedDriver.id,
      kycStatus: updatedDriver.kycStatus,
      nextSteps: [
        'Upload driver\'s license',
        'Complete face verification',
        'Add banking information',
        'Get assigned to a truck',
      ],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid driver data',
        validationErrors: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    console.error('Driver onboarding error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to complete driver onboarding',
      timestamp: new Date().toISOString(),
    });
  }
});

// ===== USER ONBOARDING ENDPOINTS =====

/**
 * POST /user/signup
 * Register new customer
 */
router.post('/user/signup', onboardingLimiter, async (req, res) => {
  try {
    const validatedData = UserSignupSchema.parse(req.body);

    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { phone: validatedData.phone },
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        code: 'RESOURCE_EXISTS',
        message: 'User with this email or phone already exists',
        timestamp: new Date().toISOString(),
      });
    }

    // Create user profile
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        verificationLevel: 'BASIC',
        isActive: true,
      },
    });

    // Generate access tokens (implement JWT logic)
    const accessToken = 'jwt-token-here'; // Replace with actual JWT generation
    const refreshToken = 'refresh-token-here'; // Replace with actual refresh token

    // Log audit trail
    await auditLog({
      entityType: 'User',
      entityId: user.id,
      action: 'CREATED',
      actorType: 'USER',
      actorId: user.id,
      changes: { created: validatedData },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(201).json({
      userId: user.id,
      verificationLevel: user.verificationLevel,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid user data',
        validationErrors: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    console.error('User signup error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to create user account',
      timestamp: new Date().toISOString(),
    });
  }
});

// ===== ASSISTANT ONBOARDING =====

/**
 * @route POST /api/onboarding/assistant
 * @desc Onboard an assistant for an owner or driver
 * @access Private (requires owner/driver role)
 */
router.post('/assistant', onboardingLimiter, authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const validatedData = AssistantOnboardingSchema.parse(req.body);

    // Verify parent exists and user has permission
    const parentModel = validatedData.parentType === 'OWNER' ? 'owner' : 'driver';
    const parent = await prisma[parentModel].findUnique({
      where: { id: validatedData.parentId },
    });

    if (!parent) {
      return res.status(404).json({
        code: 'PARENT_NOT_FOUND',
        message: `${validatedData.parentType} not found`,
        timestamp: new Date().toISOString(),
      });
    }

    // Check if user has permission to add assistant
    if (parent.userId !== req.user?.userId) {
      return res.status(403).json({
        code: 'UNAUTHORIZED',
        message: 'You can only add assistants to your own account',
        timestamp: new Date().toISOString(),
      });
    }

    // Check for existing assistant with same phone/email
    const existingAssistant = await prisma.assistant.findFirst({
      where: {
        OR: [
          { phone: validatedData.phone },
          { email: validatedData.email },
        ],
      },
    });

    if (existingAssistant) {
      return res.status(409).json({
        code: 'ASSISTANT_EXISTS',
        message: 'Assistant with this phone or email already exists',
        timestamp: new Date().toISOString(),
      });
    }

    // Create assistant
    const assistant = await prisma.assistant.create({
      data: {
        ...validatedData,
        verificationStatus: 'PENDING',
        isActive: false,
      },
    });

    // Create KYC record
    const kycRecord = await prisma.kYC.create({
      data: {
        assistantId: assistant.id,
        type: 'ASSISTANT',
        status: 'PENDING',
        submittedAt: new Date(),
      },
    });

    // Send invitation email if email provided
    if (validatedData.email) {
      await sendEmail({
        to: validatedData.email,
        subject: 'RELOConnect Assistant Invitation',
        template: 'assistant-invite',
        data: {
          assistantName: validatedData.name,
          parentName: parent.name,
          parentType: validatedData.parentType.toLowerCase(),
          inviteUrl: `${process.env.CLIENT_URL}/assistant/complete/${assistant.id}`,
        },
      });
    }

    // Log audit trail
    await auditLog({
      entityType: 'Assistant',
      entityId: assistant.id,
      action: 'CREATED',
      actorType: 'USER',
      actorId: req.user?.userId!,
      changes: { created: validatedData },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(201).json({
      assistantId: assistant.id,
      kycId: kycRecord.id,
      status: 'PENDING_VERIFICATION',
      message: 'Assistant account created successfully. Verification required.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid assistant data',
        validationErrors: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    console.error('Assistant onboarding error:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to create assistant account',
      timestamp: new Date().toISOString(),
    });
  }
});

// ===== ADVANCED USER VERIFICATION =====

/**
 * @route POST /api/onboarding/user/verify-identity
 * @desc Advanced identity verification for high-value bookings
 * @access Private (authenticated users)
 */
router.post('/user/verify-identity', uploadLimiter, authenticateToken, upload.fields([
  { name: 'idDocument', maxCount: 1 },
  { name: 'selfie', maxCount: 1 },
]), async (req: AuthenticatedRequest, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files.idDocument || !files.selfie) {
      return res.status(400).json({
        code: 'MISSING_FILES',
        message: 'Both ID document and selfie are required',
        timestamp: new Date().toISOString(),
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
    });

    if (!user) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Check if already verified
    if (user.verificationLevel === 'VERIFIED') {
      return res.status(400).json({
        code: 'ALREADY_VERIFIED',
        message: 'User is already verified',
        timestamp: new Date().toISOString(),
      });
    }

    const idFile = files.idDocument[0];
    const selfieFile = files.selfie[0];

    // Extract data from ID document using OCR
    const idData = await extractDocumentData(idFile.buffer, 'ID_DOCUMENT');

    // Verify face match using AI
    const faceVerification = await reloAI.verifyFace(
      selfieFile.buffer,
      idFile.buffer,
      'USER_VERIFICATION'
    );

    if (!faceVerification.success || !faceVerification.passed) {
      return res.status(400).json({
        code: 'FACE_MISMATCH',
        message: 'Face verification failed. Please try again with clearer images.',
        confidence: faceVerification.matchScore,
        timestamp: new Date().toISOString(),
      });
    }

    // Create verification documents
    const idDocumentHash = crypto.createHash('sha256').update(idFile.buffer).digest('hex');
    const selfieHash = crypto.createHash('sha256').update(selfieFile.buffer).digest('hex');

    const verificationRecord = await prisma.document.create({
      data: {
        userId: user.id,
        type: 'ID_VERIFICATION',
        url: `uploads/verification/${user.id}_id_${Date.now()}.jpg`,
        metadata: {
          idData,
          faceVerification,
          idDocumentHash,
          selfieHash,
          verifiedAt: new Date().toISOString(),
        },
        isVerified: true,
      },
    });

    // Update user verification level
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationLevel: 'VERIFIED',
        verifiedAt: new Date(),
      },
    });

    // Log AI interaction
    await prisma.aIInteraction.create({
      data: {
        userId: user.id,
        interactionType: 'FACE_VERIFICATION',
        inputData: {
          idDocumentProvided: true,
          selfieProvided: true,
        },
        outputData: faceVerification,
        confidence: faceVerification.matchScore,
        processingTimeMs: faceVerification.processingTime,
      },
    });

    // Log audit trail
    await auditLog({
      entityType: 'User',
      entityId: user.id,
      action: 'VERIFIED',
      actorType: 'SYSTEM',
      actorId: 'ai-verification',
      changes: { 
        verificationLevel: { from: 'BASIC', to: 'VERIFIED' },
        faceVerification: faceVerification.passed,
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.json({
      verificationId: verificationRecord.id,
      verificationLevel: 'VERIFIED',
      faceMatch: faceVerification.passed,
      confidence: faceVerification.matchScore,
      message: 'Identity verification completed successfully',
    });
  } catch (error) {
    console.error('Identity verification error:', error);
    res.status(500).json({
      code: 'VERIFICATION_ERROR',
      message: 'Failed to verify identity',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
