import express, { Request, Response, RequestHandler } from 'express';
import { logger } from '../utils/logger';

const router = express.Router();

// Mock booking data
interface Booking {
  id: string;
  userId: string;
  vehicleClassId: string;
  pickupLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  dropoffLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  scheduledDateTime: Date;
  status: 'pending' | 'confirmed' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: Date;
}

// In-memory storage - replace with database
const bookings: Booking[] = [];

// Create booking handler
const createBookingHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId,
      vehicleClassId,
      pickupLocation,
      dropoffLocation,
      scheduledDateTime,
      totalAmount
    } = req.body;

    // Basic validation
    if (!userId || !vehicleClassId || !pickupLocation || !dropoffLocation) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
      return;
    }

    // Create booking
    const newBooking: Booking = {
      id: Date.now().toString(),
      userId,
      vehicleClassId,
      pickupLocation,
      dropoffLocation,
      scheduledDateTime: new Date(scheduledDateTime),
      status: 'pending',
      totalAmount,
      createdAt: new Date()
    };

    bookings.push(newBooking);

    logger.info(`Booking created: ${newBooking.id}`);

    res.status(201).json({
      success: true,
      data: {
        booking: newBooking
      }
    });
  } catch (error) {
    logger.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get bookings handler
const getBookingsHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;

    let filteredBookings = bookings;
    if (userId) {
      filteredBookings = bookings.filter(b => b.userId === userId);
    }

    res.json({
      success: true,
      data: {
        bookings: filteredBookings
      }
    });
  } catch (error) {
    logger.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get booking by ID handler
const getBookingHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const booking = bookings.find(b => b.id === id);

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        booking
      }
    });
  } catch (error) {
    logger.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Routes
router.post('/', createBookingHandler);
router.get('/', getBookingsHandler);
router.get('/:id', getBookingHandler);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Booking service is running',
    timestamp: new Date().toISOString()
  });
});

export { router as bookingRoutes };
