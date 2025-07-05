import request from 'supertest';
import { app } from '../../src/index';
import { prisma } from '../../src/middleware/prisma';
import { reloAI } from '../../src/services/reloAI';

// Mock the AI service
jest.mock('../../src/services/reloAI');

// Mock Prisma
jest.mock('../../src/middleware/prisma', () => ({
  prisma: {
    owner: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    kYC: {
      create: jest.fn(),
    },
    document: {
      create: jest.fn(),
    },
    aIInteraction: {
      create: jest.fn(),
    },
  },
}));

describe('Onboarding API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/onboarding/owner/onboard', () => {
    const validOwnerData = {
      name: 'John Doe Transport',
      businessName: 'JD Logistics',
      regNumber: '2023/123456/07',
      vatNumber: '1234567890',
      contactInfo: {
        email: 'john@jdlogistics.co.za',
        phone: '+27123456789',
        address: {
          street: '123 Main Street',
          city: 'Cape Town',
          province: 'Western Cape',
          postalCode: '8001',
          country: 'ZA',
        },
      },
    };

    it('should successfully onboard a new owner', async () => {
      const mockOwner = {
        id: 'owner-123',
        ...validOwnerData,
        userId: 'user-123',
        verificationStatus: 'PENDING',
      };

      const mockKYC = {
        id: 'kyc-123',
        ownerId: 'owner-123',
        type: 'OWNER',
        status: 'PENDING',
      };

      (prisma.owner.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.owner.create as jest.Mock).mockResolvedValue(mockOwner);
      (prisma.kYC.create as jest.Mock).mockResolvedValue(mockKYC);

      const response = await request(app)
        .post('/api/onboarding/owner/onboard')
        .send(validOwnerData)
        .expect(201);

      expect(response.body).toEqual({
        ownerId: 'owner-123',
        kycId: 'kyc-123',
        status: 'PENDING_KYC',
        message: 'Owner account created successfully. KYC verification required.',
      });

      expect(prisma.owner.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: validOwnerData.name,
          businessName: validOwnerData.businessName,
          regNumber: validOwnerData.regNumber,
          vatNumber: validOwnerData.vatNumber,
        }),
      });
    });

    it('should reject duplicate owner registration', async () => {
      (prisma.owner.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-owner',
        email: validOwnerData.contactInfo.email,
      });

      const response = await request(app)
        .post('/api/onboarding/owner/onboard')
        .send(validOwnerData)
        .expect(409);

      expect(response.body.code).toBe('OWNER_EXISTS');
      expect(response.body.message).toBe('Owner with this email already exists');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: 'A', // Too short
        contactInfo: {
          email: 'invalid-email', // Invalid format
          phone: '123', // Invalid format
        },
      };

      const response = await request(app)
        .post('/api/onboarding/owner/onboard')
        .send(invalidData)
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.validationErrors).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      (prisma.owner.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.owner.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/onboarding/owner/onboard')
        .send(validOwnerData)
        .expect(500);

      expect(response.body.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/onboarding/owner/verify-face', () => {
    const mockOwner = {
      id: 'owner-123',
      verificationStatus: 'PENDING',
    };

    beforeEach(() => {
      (prisma.owner.findUnique as jest.Mock) = jest.fn().mockResolvedValue(mockOwner);
      (prisma.owner.update as jest.Mock) = jest.fn();
      (prisma.document.create as jest.Mock) = jest.fn();
      (prisma.aIInteraction.create as jest.Mock) = jest.fn();
    });

    it('should successfully verify face with AI', async () => {
      const mockVerification = {
        success: true,
        passed: true,
        matchScore: 0.95,
        livenessScore: 0.88,
        qualityScore: 0.92,
        sessionId: 'session-123',
        processingTime: 1500,
      };

      (reloAI.verifyFace as jest.Mock).mockResolvedValue(mockVerification);

      // Create a mock file buffer
      const imageBuffer = Buffer.from('fake-image-data');

      const response = await request(app)
        .post('/api/onboarding/owner/verify-face')
        .field('ownerId', 'owner-123')
        .attach('selfie', imageBuffer, 'selfie.jpg')
        .expect(200);

      expect(response.body.verificationPassed).toBe(true);
      expect(response.body.confidence).toBe(0.95);

      expect(reloAI.verifyFace).toHaveBeenCalledWith(
        imageBuffer,
        undefined,
        'OWNER_VERIFICATION'
      );
    });

    it('should reject low-quality face verification', async () => {
      const mockVerification = {
        success: true,
        passed: false,
        matchScore: 0.45,
        livenessScore: 0.30,
        qualityScore: 0.25,
        processingTime: 1200,
      };

      (reloAI.verifyFace as jest.Mock).mockResolvedValue(mockVerification);

      const imageBuffer = Buffer.from('fake-image-data');

      const response = await request(app)
        .post('/api/onboarding/owner/verify-face')
        .field('ownerId', 'owner-123')
        .attach('selfie', imageBuffer, 'selfie.jpg')
        .expect(400);

      expect(response.body.code).toBe('VERIFICATION_FAILED');
    });

    it('should handle missing files', async () => {
      const response = await request(app)
        .post('/api/onboarding/owner/verify-face')
        .field('ownerId', 'owner-123')
        .expect(400);

      expect(response.body.code).toBe('MISSING_FILE');
    });

    it('should handle AI service errors', async () => {
      (reloAI.verifyFace as jest.Mock).mockRejectedValue(new Error('AI service unavailable'));

      const imageBuffer = Buffer.from('fake-image-data');

      const response = await request(app)
        .post('/api/onboarding/owner/verify-face')
        .field('ownerId', 'owner-123')
        .attach('selfie', imageBuffer, 'selfie.jpg')
        .expect(500);

      expect(response.body.code).toBe('VERIFICATION_ERROR');
    });
  });

  describe('POST /api/onboarding/assistant', () => {
    const validAssistantData = {
      parentId: 'owner-123',
      parentType: 'OWNER' as const,
      name: 'Jane Smith',
      email: 'jane@jdlogistics.co.za',
      phone: '+27987654321',
    };

    beforeEach(() => {
      // Mock authentication middleware
      (app as any).request.user = { userId: 'user-123' };
    });

    it('should successfully create assistant for owner', async () => {
      const mockParent = {
        id: 'owner-123',
        userId: 'user-123',
        name: 'John Doe Transport',
      };

      const mockAssistant = {
        id: 'assistant-123',
        ...validAssistantData,
        verificationStatus: 'PENDING',
      };

      (prisma.owner.findUnique as jest.Mock).mockResolvedValue(mockParent);
      (prisma.assistant.findFirst as jest.Mock) = jest.fn().mockResolvedValue(null);
      (prisma.assistant.create as jest.Mock) = jest.fn().mockResolvedValue(mockAssistant);
      (prisma.kYC.create as jest.Mock).mockResolvedValue({
        id: 'kyc-assistant-123',
        assistantId: 'assistant-123',
      });

      const response = await request(app)
        .post('/api/onboarding/assistant')
        .send(validAssistantData)
        .expect(201);

      expect(response.body.assistantId).toBe('assistant-123');
      expect(response.body.status).toBe('PENDING_VERIFICATION');
    });

    it('should reject unauthorized assistant creation', async () => {
      const mockParent = {
        id: 'owner-123',
        userId: 'different-user-id',
        name: 'John Doe Transport',
      };

      (prisma.owner.findUnique as jest.Mock).mockResolvedValue(mockParent);

      const response = await request(app)
        .post('/api/onboarding/assistant')
        .send(validAssistantData)
        .expect(403);

      expect(response.body.code).toBe('UNAUTHORIZED');
    });
  });
});
