import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import bookingRoutes from './routes/bookings';
import vehicleRoutes from './routes/vehicles';
import donationRoutes from './routes/donations';
import newsRoutes from './routes/news';
import portRoutes from './routes/ports';
import paymentRoutes from './routes/payments';
import chatRoutes from './routes/chat';
import pricingRoutes from './routes/pricing';
import onboardingRoutes from './routes/onboarding';
import adminRoutes from './routes/admin';
import aiRoutes from './routes/ai';

import { setupSocketHandlers } from './socket/handlers';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { prismaMiddleware } from './middleware/prisma';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // Serve uploaded files
app.use(prismaMiddleware); // Attach Prisma client to request

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/bookings', authMiddleware, bookingRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/donations', authMiddleware, donationRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/ports', portRoutes);
app.use('/api/payments', authMiddleware, paymentRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Status endpoint with more details
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'RELOConnect Backend Running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/auth/signup',
      'POST /api/auth/login', 
      'GET /api/auth/me',
      'GET /api/vehicles',
      'POST /api/bookings',
      'GET /api/news',
      'GET /api/ports',
      'GET /api/donations'
    ]
  });
});

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`🚀 RELOConnect Backend running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
