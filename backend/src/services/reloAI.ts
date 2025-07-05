import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { prisma } from '../middleware/prisma';
import { z } from 'zod';

// ===== AI SERVICE CONFIGURATION =====

interface GeminiConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

class ReloAIService {
  private genAI: GoogleGenerativeAI;
  private fileManager: GoogleAIFileManager;
  private config: GeminiConfig;

  constructor() {
    this.config = {
      apiKey: process.env.GEMINI_API_KEY!,
      model: 'gemini-pro',
      temperature: 0.7,
      maxTokens: 2048,
    };

    this.genAI = new GoogleGenerativeAI(this.config.apiKey);
    this.fileManager = new GoogleAIFileManager(this.config.apiKey);
  }

  // ===== NATURAL LANGUAGE BOOKING PARSER =====

  async parseBookingRequest(userInput: string, context?: any): Promise<ParsedBookingResult> {
    const startTime = Date.now();
    
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = this.buildBookingParsePrompt(userInput, context);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const parsedData = JSON.parse(text);
      
      // Log AI interaction
      await this.logInteraction({
        userType: context?.userType || 'unknown',
        userId: context?.userId,
        interactionType: 'BOOKING_PARSE',
        prompt: userInput,
        response: parsedData,
        modelUsed: 'gemini-pro',
        processingTime: Date.now() - startTime,
        tokens: response.usageMetadata?.totalTokenCount,
      });

      return {
        success: true,
        confidence: parsedData.confidence || 0.8,
        extractedData: parsedData,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('Booking parse error:', error);
      return {
        success: false,
        confidence: 0,
        error: error.message,
        processingTime: Date.now() - startTime,
      };
    }
  }

  private buildBookingParsePrompt(userInput: string, context?: any): string {
    return `
You are RELOConnect's AI booking assistant for South African moving services. 
Parse the user's natural language input into structured booking data.

Context:
- User Location: ${context?.userLocation || 'Unknown'}
- User History: ${context?.bookingHistory || 'New user'}
- Current Date: ${new Date().toISOString()}

User Input: "${userInput}"

Extract and return ONLY valid JSON with this exact structure:
{
  "confidence": 0.95,
  "pickupLocation": "detailed address or area",
  "dropoffLocation": "detailed address or area", 
  "preferredDate": "YYYY-MM-DD or relative like 'next friday'",
  "preferredTime": "HH:MM or 'morning/afternoon/evening'",
  "items": ["furniture", "boxes", "appliances"],
  "specialRequirements": ["piano", "fragile items", "stairs"],
  "estimatedSize": "SMALL|MEDIUM|LARGE|EXTRA_LARGE",
  "urgency": "LOW|MEDIUM|HIGH",
  "budget": null or estimated number,
  "additionalNotes": "any other relevant details"
}

South African Context Rules:
- Recognize SA city names: Cape Town, Johannesburg, Durban, Pretoria, etc.
- Understand local terms: "bakkie", "robot" (traffic light), "braai" items
- Date formats: SA uses DD/MM/YYYY
- Currency: South African Rand (ZAR)

Return only the JSON object, no additional text.
`;
  }

  // ===== TRUCK RECOMMENDATION ENGINE =====

  async recommendTruck(request: TruckRecommendationRequest): Promise<TruckRecommendationResult> {
    const startTime = Date.now();

    try {
      // Get available trucks from database
      const availableTrucks = await prisma.truck.findMany({
        where: {
          status: 'AVAILABLE',
        },
        include: {
          owner: true,
          drivers: true,
        },
      });

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = this.buildTruckRecommendationPrompt(request, availableTrucks);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const recommendations = JSON.parse(response.text());

      // Log interaction
      await this.logInteraction({
        userType: 'user',
        userId: request.userId,
        interactionType: 'TRUCK_RECOMMEND',
        prompt: JSON.stringify(request),
        response: recommendations,
        modelUsed: 'gemini-pro',
        processingTime: Date.now() - startTime,
      });

      return {
        success: true,
        recommendations: recommendations.trucks,
        confidence: recommendations.confidence,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('Truck recommendation error:', error);
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
      };
    }
  }

  private buildTruckRecommendationPrompt(request: TruckRecommendationRequest, trucks: any[]): string {
    return `
You are RELOConnect's intelligent truck matching system. Analyze the booking requirements 
and recommend the best trucks from the available fleet.

Booking Requirements:
- Pickup: ${request.pickupLocation.address}
- Dropoff: ${request.dropoffLocation.address}
- Items: ${request.items.join(', ')}
- Estimated Weight: ${request.estimatedWeight || 'Unknown'} tons
- Preferred Date: ${request.preferredDate}
- Budget: R${request.budget || 'Flexible'}

Available Trucks:
${trucks.map(truck => `
- ID: ${truck.id}
  Plate: ${truck.plate}
  Capacity: ${truck.capacityTons} tons
  Make/Model: ${truck.makeModel}
  Location: ${truck.location?.address || 'Unknown'}
  Owner: ${truck.owner.name}
  Driver: ${truck.drivers[0]?.name || 'Unassigned'}
`).join('\n')}

Analyze and rank trucks based on:
1. Capacity suitability for items and weight
2. Proximity to pickup location
3. Availability on preferred date
4. Cost efficiency
5. Driver ratings and experience

Return ONLY valid JSON:
{
  "confidence": 0.90,
  "trucks": [
    {
      "truckId": "uuid",
      "matchScore": 0.95,
      "estimatedPrice": 2500,
      "availability": "AVAILABLE",
      "distance": 15.5,
      "reasons": ["Perfect capacity match", "Closest to pickup", "Experienced driver"]
    }
  ],
  "alternatives": [
    {
      "option": "Multiple smaller trucks",
      "reason": "If items don't fit in single truck"
    }
  ]
}
`;
  }

  // ===== ETA & PRICING PREDICTION =====

  async predictETA(request: ETAPredictionRequest): Promise<ETAPredictionResult> {
    const startTime = Date.now();

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = this.buildETAPredictionPrompt(request);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const prediction = JSON.parse(response.text());

      await this.logInteraction({
        userType: 'system',
        interactionType: 'ETA_PREDICT',
        prompt: JSON.stringify(request),
        response: prediction,
        modelUsed: 'gemini-pro',
        processingTime: Date.now() - startTime,
      });

      return {
        success: true,
        estimatedDuration: prediction.duration,
        suggestedPrice: prediction.price,
        confidence: prediction.confidence,
        factors: prediction.factors,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('ETA prediction error:', error);
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
      };
    }
  }

  private buildETAPredictionPrompt(request: ETAPredictionRequest): string {
    return `
You are RELOConnect's logistics optimization AI. Predict accurate ETA and optimal pricing
for a moving job in South Africa.

Route Details:
- From: ${request.route.from.address}
- To: ${request.route.to.address}
- Distance: ${this.calculateDistance(request.route.from, request.route.to)} km
- Truck Type: ${request.truckType}
- Scheduled Time: ${request.scheduledTime}

Current Conditions:
- Traffic: ${request.trafficData?.level || 'Unknown'}
- Weather: ${request.weatherData?.condition || 'Clear'}
- Day of Week: ${new Date(request.scheduledTime).toLocaleDateString('en-ZA', { weekday: 'long' })}

South African Logistics Factors:
- Average speed in cities: 25-40 km/h
- Highway speeds: 80-120 km/h  
- Loading/unloading time: 30-90 minutes per location
- Traffic peak hours: 07:00-09:00, 16:00-18:00
- Weather impact on mountain passes (N3, N1)

Historical Data Patterns:
- Friday afternoon moves take 20% longer
- Rain reduces speed by 15%
- Holiday periods increase by 30%

Return ONLY valid JSON:
{
  "confidence": 0.85,
  "duration": 240,
  "price": 3500,
  "factors": {
    "traffic": "MODERATE",
    "weather": "CLEAR", 
    "demand": "HIGH",
    "route_difficulty": "MEDIUM"
  },
  "breakdown": {
    "driving_time": 180,
    "loading_time": 45,
    "unloading_time": 30,
    "buffer_time": 15
  },
  "price_factors": {
    "base_rate": 2800,
    "distance_premium": 400,
    "demand_surge": 300,
    "total": 3500
  }
}
`;
  }

  // ===== ADVANCED FACE VERIFICATION =====

  async verifyFace(imageBuffer: Buffer, referenceImage?: Buffer, entityType?: string): Promise<FaceVerificationResult> {
    const startTime = Date.now();

    try {
      // Upload image to Gemini
      const uploadResult = await this.fileManager.uploadFile(imageBuffer, {
        mimeType: 'image/jpeg',
        displayName: `face_verification_${Date.now()}`,
      });

      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro-vision' });
      
      const prompt = this.buildFaceVerificationPrompt(entityType);
      
      const result = await model.generateContent([
        prompt,
        {
          fileData: {
            mimeType: uploadResult.file.mimeType,
            fileUri: uploadResult.file.uri,
          },
        },
      ]);

      const response = await result.response;
      const analysis = JSON.parse(response.text());

      // Clean up uploaded file
      await this.fileManager.deleteFile(uploadResult.file.name);

      await this.logInteraction({
        userType: entityType || 'unknown',
        interactionType: 'FACE_VERIFY',
        prompt: 'Face verification analysis',
        response: analysis,
        modelUsed: 'gemini-pro-vision',
        processingTime: Date.now() - startTime,
      });

      return {
        success: true,
        matchScore: analysis.matchScore,
        livenessScore: analysis.livenessScore,
        qualityScore: analysis.qualityScore,
        passed: analysis.passed,
        sessionId: `fv_${Date.now()}`,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('Face verification error:', error);
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
      };
    }
  }

  private buildFaceVerificationPrompt(entityType?: string): string {
    const securityLevel = entityType === 'driver' ? 'HIGH' : 'MEDIUM';
    
    return `
You are RELOConnect's biometric security AI. Analyze this selfie image for face verification
with ${securityLevel} security requirements.

Analyze for:
1. LIVENESS DETECTION
   - Natural eye reflection and blink patterns
   - Skin texture and micro-expressions
   - Lighting consistency and shadows
   - Anti-spoofing indicators

2. IMAGE QUALITY
   - Resolution and clarity
   - Proper lighting and contrast  
   - Face visibility and positioning
   - Background appropriateness

3. FACE CHARACTERISTICS
   - Clear facial features
   - No obstructions (sunglasses, masks)
   - Frontal pose with minimal tilt
   - Age consistency indicators

Security Thresholds for ${entityType?.toUpperCase() || 'GENERAL'}:
- Minimum liveness score: ${securityLevel === 'HIGH' ? '0.85' : '0.75'}
- Minimum quality score: ${securityLevel === 'HIGH' ? '0.80' : '0.70'}
- Anti-spoofing detection: STRICT

Return ONLY valid JSON:
{
  "livenessScore": 0.92,
  "qualityScore": 0.88,
  "matchScore": 0.95,
  "passed": true,
  "analysis": {
    "liveness_indicators": ["natural_blink", "skin_texture", "eye_reflection"],
    "quality_factors": ["good_lighting", "clear_features", "proper_angle"],
    "security_flags": []
  },
  "recommendations": ["Image passed all security checks"]
}
`;
  }

  // ===== CONTEXTUAL AI CHAT ASSISTANT =====

  async chatAssistant(message: string, context: ChatContext): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = this.buildChatPrompt(message, context);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      await this.logInteraction({
        userType: context.userType,
        userId: context.userId,
        interactionType: 'CHAT',
        prompt: message,
        response: { text },
        modelUsed: 'gemini-pro',
        processingTime: Date.now() - startTime,
      });

      return {
        success: true,
        message: text,
        context: context,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error('Chat assistant error:', error);
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
      };
    }
  }

  private buildChatPrompt(message: string, context: ChatContext): string {
    const roleContext = this.getRoleSpecificContext(context.userType);
    
    return `
You are RELOConnect's intelligent assistant, helping with South African moving and logistics.

User Context:
- Role: ${context.userType}
- Location: ${context.location || 'Unknown'}
- Active Bookings: ${context.activeBookings || 0}
- Verification Level: ${context.verificationLevel || 'Basic'}

${roleContext}

User Message: "${message}"

Respond naturally and helpfully. Include:
- Practical moving advice for South Africa
- Local logistics knowledge (traffic, areas, regulations)
- Cost estimates in South African Rand
- Weather and seasonal considerations
- Security and safety tips

Keep responses concise but informative. Use South African English.
`;
  }

  private getRoleSpecificContext(userType: string): string {
    switch (userType) {
      case 'driver':
        return `
Driver-specific guidance:
- Route optimization and traffic updates
- Vehicle maintenance tips
- Earnings optimization strategies
- Customer service best practices
- Safety protocols and regulations
`;
      case 'owner':
        return `
Owner-specific guidance:
- Fleet management advice
- Driver recruitment and management
- Business growth strategies
- Compliance and documentation
- Pricing and profitability optimization
`;
      case 'user':
        return `
Customer guidance:
- Moving preparation tips
- Packing and organization advice
- Cost-saving strategies
- Booking optimization
- What to expect during moves
`;
      default:
        return `
General logistics guidance:
- Moving industry insights
- Best practices and tips
- Cost considerations
- Safety and security advice
`;
    }
  }

  // ===== UTILITY METHODS =====

  private calculateDistance(from: Location, to: Location): number {
    // Haversine formula for calculating distance between two coordinates
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(to.latitude - from.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(from.latitude)) * Math.cos(this.toRadians(to.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  private async logInteraction(interaction: AIInteractionLog): Promise<void> {
    try {
      await prisma.aIInteraction.create({
        data: {
          userId: interaction.userId,
          userType: interaction.userType,
          sessionId: interaction.sessionId || `session_${Date.now()}`,
          interactionType: interaction.interactionType,
          prompt: interaction.prompt,
          response: interaction.response,
          confidence: interaction.confidence,
          tokens: interaction.tokens,
          modelUsed: interaction.modelUsed,
          processingTime: interaction.processingTime,
        },
      });
    } catch (error) {
      console.error('Failed to log AI interaction:', error);
    }
  }
}

// ===== TYPE DEFINITIONS =====

interface ParsedBookingResult {
  success: boolean;
  confidence: number;
  extractedData?: any;
  error?: string;
  processingTime: number;
}

interface TruckRecommendationRequest {
  userId?: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  items: string[];
  estimatedWeight?: number;
  preferredDate: string;
  budget?: number;
}

interface TruckRecommendationResult {
  success: boolean;
  recommendations?: any[];
  confidence?: number;
  error?: string;
  processingTime: number;
}

interface ETAPredictionRequest {
  route: {
    from: Location;
    to: Location;
    waypoints?: Location[];
  };
  truckType: string;
  scheduledTime: string;
  trafficData?: any;
  weatherData?: any;
}

interface ETAPredictionResult {
  success: boolean;
  estimatedDuration?: number;
  suggestedPrice?: number;
  confidence?: number;
  factors?: any;
  error?: string;
  processingTime: number;
}

interface FaceVerificationResult {
  success: boolean;
  matchScore?: number;
  livenessScore?: number;
  qualityScore?: number;
  passed?: boolean;
  sessionId?: string;
  error?: string;
  processingTime: number;
}

interface ChatContext {
  userType: string;
  userId?: string;
  location?: string;
  activeBookings?: number;
  verificationLevel?: string;
  sessionId?: string;
}

interface ChatResponse {
  success: boolean;
  message?: string;
  context?: ChatContext;
  error?: string;
  processingTime: number;
}

interface Location {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

interface AIInteractionLog {
  userId?: string;
  userType: string;
  sessionId?: string;
  interactionType: string;
  prompt: string;
  response: any;
  confidence?: number;
  tokens?: number;
  modelUsed: string;
  processingTime: number;
}

// ===== VALIDATION SCHEMAS =====

export const BookingParseSchema = z.object({
  userInput: z.string().min(10).max(1000),
  context: z.object({
    userType: z.string().optional(),
    userId: z.string().optional(),
    userLocation: z.string().optional(),
    bookingHistory: z.string().optional(),
  }).optional(),
});

export const TruckRecommendationSchema = z.object({
  pickupLocation: z.object({
    address: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  dropoffLocation: z.object({
    address: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  items: z.array(z.string()),
  estimatedWeight: z.number().optional(),
  preferredDate: z.string(),
  budget: z.number().optional(),
});

export const FaceVerificationSchema = z.object({
  entityId: z.string().uuid(),
  entityType: z.enum(['owner', 'driver', 'assistant', 'user']),
});

// ===== SINGLETON EXPORT =====

export const reloAI = new ReloAIService();
export default ReloAIService;
