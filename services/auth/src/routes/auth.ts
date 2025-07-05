import express, { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const router = express.Router();

// Mock user data - replace with actual database integration
interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'driver' | 'admin';
  isVerified: boolean;
  createdAt: Date;
}

// In-memory storage - replace with database
const users: User[] = [];

// Register route
const registerHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role = 'customer' } = req.body;

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
      return;
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User already exists'
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      isVerified: false,
      createdAt: new Date()
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          isVerified: newUser.isVerified
        },
        token
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

router.post('/register', registerHandler);

// Login route
const loginHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
      return;
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified
        },
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

router.post('/login', loginHandler);

// Health check specific to auth routes
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

export { router as authRoutes };
