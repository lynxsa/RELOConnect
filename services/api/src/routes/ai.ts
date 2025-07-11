import express from 'express';
import { reloAI } from '../services/reloAI';
import { authMiddleware } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const BookingParseSchema = z.object({
  userInput: z.string().min(10).max(500),
  context: z.object({
    userType: z.string().optional(),
    location: z.string().optional(),
    userId: z.string().optional(),
  }).optional(),
});

const TruckRecommendationSchema = z.object({
  pickupLocation: z.object({
    address: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    placeId: z.string().optional(),
  }),
  dropoffLocation: z.object({
    address: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    placeId: z.string().optional(),
  }),
  items: z.array(z.string()),
  estimatedWeight: z.number().positive().optional(),
  preferredDate: z.string(),
  budget: z.number().positive().optional(),
});

const ETAPredictionSchema = z.object({
  route: z.object({
    from: z.object({
      address: z.string(),
      latitude: z.number(),
      longitude: z.number(),
      placeId: z.string().optional(),
    }),
    to: z.object({
      address: z.string(),
      latitude: z.number(),
      longitude: z.number(),
      placeId: z.string().optional(),
    }),
    waypoints: z.array(z.object({
      address: z.string(),
      latitude: z.number(),
      longitude: z.number(),
      placeId: z.string().optional(),
    })).optional(),
  }),
  truckType: z.string(),
  scheduledTime: z.string(),
});

const ChatMessageSchema = z.object({
  message: z.string().min(1).max(500),
  context: z.object({
    userType: z.string(),
    userId: z.string().optional(),
    location: z.string().optional(),
    activeBookings: z.number().optional(),
    verificationLevel: z.string().optional(),
    sessionId: z.string().optional(),
  }),
});

/**
 * @route POST /api/ai/parse-booking
 * @desc Parse natural language booking request
 * @access Private
 */
router.post('/parse-booking', authMiddleware, async (req, res) => {
  try {
    const validatedData = BookingParseSchema.parse(req.body);
    
    const result = await reloAI.parseBookingRequest(
      validatedData.userInput,
      validatedData.context
    );

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        validationErrors: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    console.error('Booking parse error:', error);
    res.status(500).json({
      success: false,
      error: 'AI_ERROR',
      message: 'Failed to parse booking request',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @route POST /api/ai/recommend-truck
 * @desc Get AI-powered truck recommendations
 * @access Private
 */
router.post('/recommend-truck', authMiddleware, async (req, res) => {
  try {
    const validatedData = TruckRecommendationSchema.parse(req.body);
    
    const recommendations = await reloAI.recommendTruck(validatedData);

    res.json({
      success: true,
      data: recommendations,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid truck recommendation data',
        validationErrors: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    console.error('Truck recommendation error:', error);
    res.status(500).json({
      success: false,
      error: 'AI_ERROR',
      message: 'Failed to get truck recommendations',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @route POST /api/ai/predict-eta
 * @desc Predict ETA using AI
 * @access Private
 */
router.post('/predict-eta', authMiddleware, async (req, res) => {
  try {
    const validatedData = ETAPredictionSchema.parse(req.body);
    
    const prediction = await reloAI.predictETA(validatedData);

    res.json({
      success: true,
      data: prediction,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid ETA prediction data',
        validationErrors: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    console.error('ETA prediction error:', error);
    res.status(500).json({
      success: false,
      error: 'AI_ERROR',
      message: 'Failed to predict ETA',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @route POST /api/ai/chat
 * @desc AI-powered chat assistant
 * @access Private
 */
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const validatedData = ChatMessageSchema.parse(req.body);
    
    const response = await reloAI.chatAssistant(
      validatedData.message,
      validatedData.context
    );

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid chat data',
        validationErrors: error.errors,
        timestamp: new Date().toISOString(),
      });
    }

    console.error('Chat assistant error:', error);
    res.status(500).json({
      success: false,
      error: 'AI_ERROR',
      message: 'Failed to process chat message',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
