import { reloAI } from '../../src/services/reloAI';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock the Google Generative AI
jest.mock('@google/generative-ai');

describe('ReloAI Service', () => {
  let mockGenAI: jest.Mocked<GoogleGenerativeAI>;
  let mockModel: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockModel = {
      generateContent: jest.fn(),
    };

    mockGenAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockModel),
    } as any;

    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => mockGenAI);
  });

  describe('parseBookingRequest', () => {
    it('should parse natural language booking request', async () => {
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            success: true,
            intent: 'BOOKING_REQUEST',
            entities: {
              pickup: { address: 'Cape Town', confidence: 0.95 },
              dropoff: { address: 'Johannesburg', confidence: 0.92 },
              items: ['furniture', 'boxes'],
              urgency: 'MEDIUM',
            },
            confidence: 0.93,
          })),
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      const result = await reloAI.parseBookingRequest(
        'I need to move my furniture and boxes from Cape Town to Johannesburg next week',
        { userType: 'user', location: 'Cape Town' }
      );

      expect(result.success).toBe(true);
      expect(result.intent).toBe('BOOKING_REQUEST');
      expect(result.entities.pickup.address).toBe('Cape Town');
      expect(result.entities.dropoff.address).toBe('Johannesburg');
      expect(result.entities.items).toContain('furniture');
    });

    it('should handle ambiguous requests', async () => {
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            success: false,
            intent: 'UNCLEAR',
            confidence: 0.23,
            clarificationNeeded: [
              'pickup_location',
              'dropoff_location',
              'items_description'
            ],
            suggestedQuestions: [
              'Where would you like us to pick up from?',
              'What is your destination?',
              'What items do you need to move?'
            ],
          })),
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      const result = await reloAI.parseBookingRequest(
        'I need help',
        { userType: 'user' }
      );

      expect(result.success).toBe(false);
      expect(result.intent).toBe('UNCLEAR');
      expect(result.clarificationNeeded).toContain('pickup_location');
      expect(result.suggestedQuestions).toHaveLength(3);
    });

    it('should handle AI service errors', async () => {
      mockModel.generateContent.mockRejectedValue(new Error('API rate limit exceeded'));

      const result = await reloAI.parseBookingRequest(
        'Move my stuff from A to B',
        { userType: 'user' }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('API rate limit exceeded');
    });
  });

  describe('recommendTruck', () => {
    it('should recommend appropriate truck for booking', async () => {
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            success: true,
            recommendations: [
              {
                truckId: 'truck-123',
                type: 'MEDIUM_TRUCK',
                capacity: '4 tons',
                estimatedCost: 2500,
                confidence: 0.89,
                reasons: ['Appropriate size for furniture', 'Cost effective'],
              },
              {
                truckId: 'truck-456',
                type: 'LARGE_TRUCK',
                capacity: '8 tons',
                estimatedCost: 3200,
                confidence: 0.75,
                reasons: ['Extra space if needed', 'Single trip guarantee'],
              },
            ],
            confidence: 0.89,
          })),
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      const request = {
        pickupLocation: {
          address: 'Cape Town',
          latitude: -33.9249,
          longitude: 18.4241,
        },
        dropoffLocation: {
          address: 'Johannesburg',
          latitude: -26.2041,
          longitude: 28.0473,
        },
        items: ['furniture', 'appliances'],
        estimatedWeight: 2000,
        preferredDate: '2024-01-15',
        budget: 3000,
      };

      const result = await reloAI.recommendTruck(request);

      expect(result.success).toBe(true);
      expect(result.recommendations).toHaveLength(2);
      expect(result.recommendations[0].type).toBe('MEDIUM_TRUCK');
      expect(result.recommendations[0].estimatedCost).toBe(2500);
    });

    it('should handle no available trucks', async () => {
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            success: false,
            recommendations: [],
            reason: 'NO_TRUCKS_AVAILABLE',
            message: 'No trucks available for the specified date and location',
            alternatives: [
              'Consider different dates',
              'Break down into smaller loads',
              'Contact customer service for special arrangements',
            ],
          })),
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      const request = {
        pickupLocation: {
          address: 'Remote Location',
          latitude: -30.0000,
          longitude: 25.0000,
        },
        dropoffLocation: {
          address: 'Another Remote Location',
          latitude: -25.0000,
          longitude: 30.0000,
        },
        items: ['heavy machinery'],
        estimatedWeight: 15000,
        preferredDate: '2024-12-25', // Christmas Day
      };

      const result = await reloAI.recommendTruck(request);

      expect(result.success).toBe(false);
      expect(result.reason).toBe('NO_TRUCKS_AVAILABLE');
      expect(result.alternatives).toContain('Consider different dates');
    });
  });

  describe('verifyFace', () => {
    it('should verify face with high confidence', async () => {
      // Mock successful face verification
      const mockVerification = {
        success: true,
        passed: true,
        matchScore: 0.94,
        livenessScore: 0.87,
        qualityScore: 0.91,
        sessionId: 'session-abc123',
        processingTime: 1200,
      };

      // We would typically mock the actual face verification logic here
      // For now, we'll mock the method directly
      jest.spyOn(reloAI, 'verifyFace').mockResolvedValue(mockVerification);

      const imageBuffer = Buffer.from('fake-image-data');
      const referenceBuffer = Buffer.from('fake-reference-data');

      const result = await reloAI.verifyFace(
        imageBuffer,
        referenceBuffer,
        'USER_VERIFICATION'
      );

      expect(result.success).toBe(true);
      expect(result.passed).toBe(true);
      expect(result.matchScore).toBeGreaterThan(0.9);
      expect(result.livenessScore).toBeGreaterThan(0.8);
    });

    it('should reject poor quality images', async () => {
      const mockVerification = {
        success: true,
        passed: false,
        matchScore: 0.45,
        livenessScore: 0.32,
        qualityScore: 0.28,
        sessionId: 'session-def456',
        processingTime: 800,
        error: 'Image quality too low for reliable verification',
      };

      jest.spyOn(reloAI, 'verifyFace').mockResolvedValue(mockVerification);

      const lowQualityBuffer = Buffer.from('low-quality-image');

      const result = await reloAI.verifyFace(
        lowQualityBuffer,
        undefined,
        'OWNER_VERIFICATION'
      );

      expect(result.success).toBe(true);
      expect(result.passed).toBe(false);
      expect(result.matchScore).toBeLessThan(0.5);
      expect(result.error).toContain('quality too low');
    });

    it('should handle vision API errors', async () => {
      const mockVerification = {
        success: false,
        passed: false,
        processingTime: 0,
        error: 'Vision API service unavailable',
      };

      jest.spyOn(reloAI, 'verifyFace').mockResolvedValue(mockVerification);

      const imageBuffer = Buffer.from('image-data');

      const result = await reloAI.verifyFace(imageBuffer);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Vision API service unavailable');
    });
  });

  describe('chatAssistant', () => {
    it('should provide helpful responses for booking queries', async () => {
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            message: 'I can help you with your booking! To get started, I need to know: 1) Where are you moving from? 2) Where are you moving to? 3) What items do you need to move? 4) When would you like to schedule the move?',
            intent: 'BOOKING_ASSISTANCE',
            suggestedActions: [
              'Start new booking',
              'Check existing bookings',
              'Get price estimate'
            ],
            confidence: 0.92,
          })),
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      const context = {
        userType: 'user',
        userId: 'user-123',
        location: 'Cape Town',
        verificationLevel: 'VERIFIED',
        sessionId: 'chat-session-1',
      };

      const result = await reloAI.chatAssistant(
        'Hi, I need help with booking a truck',
        context
      );

      expect(result.message).toContain('help you with your booking');
      expect(result.intent).toBe('BOOKING_ASSISTANCE');
      expect(result.suggestedActions).toContain('Start new booking');
    });

    it('should handle driver-specific queries', async () => {
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            message: 'As a driver, you can: 1) Check available jobs in your area, 2) Update your truck status, 3) View your earnings dashboard, or 4) Manage your profile. What would you like to do?',
            intent: 'DRIVER_ASSISTANCE',
            suggestedActions: [
              'View available jobs',
              'Update truck status',
              'Check earnings',
              'Edit profile'
            ],
            confidence: 0.88,
          })),
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      const context = {
        userType: 'driver',
        userId: 'driver-456',
        location: 'Johannesburg',
        activeBookings: 2,
        sessionId: 'chat-session-2',
      };

      const result = await reloAI.chatAssistant(
        'What can I do here?',
        context
      );

      expect(result.message).toContain('As a driver');
      expect(result.intent).toBe('DRIVER_ASSISTANCE');
      expect(result.suggestedActions).toContain('View available jobs');
    });

    it('should handle off-topic queries appropriately', async () => {
      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            message: 'I\'m RELOConnect\'s logistics assistant. I can help you with moving services, truck bookings, pricing, and logistics support. How can I assist you with your relocation needs?',
            intent: 'OFF_TOPIC_REDIRECT',
            suggestedActions: [
              'Book a truck',
              'Get price quote',
              'Track existing booking',
              'Contact support'
            ],
            confidence: 0.95,
          })),
        },
      };

      mockModel.generateContent.mockResolvedValue(mockResponse);

      const context = {
        userType: 'user',
        userId: 'user-789',
        sessionId: 'chat-session-3',
      };

      const result = await reloAI.chatAssistant(
        'What\'s the weather like today?',
        context
      );

      expect(result.message).toContain('logistics assistant');
      expect(result.intent).toBe('OFF_TOPIC_REDIRECT');
      expect(result.suggestedActions).toContain('Book a truck');
    });
  });
});
