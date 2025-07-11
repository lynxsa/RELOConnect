import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.reloconnect.com"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' },
  frameguard: { action: 'deny' },
});

// API rate limiting
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/status';
  },
});

// Strict rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict rate limiting for password reset
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    error: 'Too many password reset attempts, please try again later',
    code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation middleware
export const validateInput = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array(),
    });
    return;
  }
  next();
};

// Common validation rules
export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
];

export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .isLength({ min: 2, max: 50 })
    .trim()
    .escape()
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .isLength({ min: 2, max: 50 })
    .trim()
    .escape()
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
];

export const bookingValidation = [
  body('pickupLocation')
    .notEmpty()
    .trim()
    .escape()
    .withMessage('Pickup location is required'),
  body('deliveryLocation')
    .notEmpty()
    .trim()
    .escape()
    .withMessage('Delivery location is required'),
  body('vehicleType')
    .isIn(['mini-van', '1-ton-truck', '1.5-ton-truck', '2-ton-truck', '4-ton-truck', '5-ton-truck', '8-ton-truck', '10-ton-truck'])
    .withMessage('Please select a valid vehicle type'),
  body('scheduledDate')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date < now) {
        throw new Error('Scheduled date cannot be in the past');
      }
      return true;
    }),
];

// Security logging middleware
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const originalJson = res.json;
  
  res.json = function(body: any) {
    const duration = Date.now() - startTime;
    
    // Log security-relevant events
    if (res.statusCode >= 400) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        statusCode: res.statusCode,
        duration,
        body: res.statusCode >= 400 ? body : undefined,
      }));
    }
    
    return originalJson.call(this, body);
  };
  
  next();
};

// Request sanitization middleware
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction): void => {
  // Remove potentially dangerous characters from string inputs
  const sanitizeString = (str: string): string => {
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '');
  };

  // Recursively sanitize object properties
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// IP whitelist middleware (for admin endpoints)
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (!clientIP || !allowedIPs.includes(clientIP)) {
      res.status(403).json({
        error: 'Access denied from this IP address',
        code: 'IP_NOT_ALLOWED',
      });
      return;
    }
    
    next();
  };
};

// CORS configuration
export const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://reloconnect.com', 'https://admin.reloconnect.com']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8081'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

export default {
  securityHeaders,
  apiRateLimit,
  authRateLimit,
  passwordResetRateLimit,
  validateInput,
  loginValidation,
  registerValidation,
  bookingValidation,
  securityLogger,
  sanitizeRequest,
  ipWhitelist,
  corsConfig,
};

// Enhanced Security Features for Phase 1

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Account lockout functionality
export class AccountSecurity {
  static async recordFailedAttempt(identifier: string, type: 'email' | 'phone'): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: type === 'email' ? { email: identifier } : { phone: identifier },
      });

      if (!user) return;

      // Increment failed attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null; // 30 min lockout

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil: lockUntil,
          lastFailedLogin: new Date(),
        },
      });

      if (lockUntil) {
        console.log(`🔒 Account locked for user ${user.id} until ${lockUntil}`);
      }
    } catch (error) {
      console.error('Error recording failed attempt:', error);
    }
  }

  static async resetFailedAttempts(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastSuccessfulLogin: new Date(),
        },
      });
    } catch (error) {
      console.error('Error resetting failed attempts:', error);
    }
  }

  static async isAccountLocked(identifier: string, type: 'email' | 'phone'): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: type === 'email' ? { email: identifier } : { phone: identifier },
      });

      if (!user || !user.lockedUntil) return false;

      if (user.lockedUntil > new Date()) {
        return true;
      } else {
        // Unlock account if lock period has expired
        await this.resetFailedAttempts(user.id);
        return false;
      }
    } catch (error) {
      console.error('Error checking account lock status:', error);
      return false;
    }
  }
}

// Multi-Factor Authentication
export class MFAService {
  // Generate SMS-based 2FA code
  static generateSMSCode(): { code: string; expiresAt: Date } {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return { code, expiresAt };
  }

  // Store MFA code for user
  static async storeMFACode(
    userId: string,
    code: string,
    type: 'SMS' | 'EMAIL',
    expiresAt: Date
  ): Promise<void> {
    try {
      // Hash the code before storing
      const hashedCode = await bcrypt.hash(code, 10);

      // Note: These fields need to be added to the User model in schema
      console.log(`Storing MFA code for user ${userId}: ${code} (${type})`);
    } catch (error) {
      console.error('Error storing MFA code:', error);
      throw error;
    }
  }

  // Send SMS code (mock implementation)
  static async sendSMSCode(phone: string, code: string): Promise<boolean> {
    try {
      console.log(`📱 SMS Code ${code} sent to ${phone}`);
      // In production, integrate with SMS service like Twilio, Clickatell for SA
      return true;
    } catch (error) {
      console.error('Error sending SMS code:', error);
      return false;
    }
  }
}

// Enhanced password validation
export class PasswordSecurity {
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
    score: number;
  } {
    const errors: string[] = [];
    let score = 0;

    // Length check
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else if (password.length >= 12) {
      score += 2;
    } else {
      score += 1;
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    // Number check
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    // Common password check
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'letmein', 'welcome', 'monkey', '1234567890'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common, please choose a more unique password');
      score = 0;
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.min(score, 5), // Max score of 5
    };
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12); // Use higher cost factor for production
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

// Payment security rate limiter
export const paymentRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 payment attempts per 5 minutes
  message: {
    error: 'Too many payment attempts from this IP, please try again later.',
    retryAfter: '5 minutes'
  },
});

// Enhanced authentication middleware with MFA support
export const enhancedAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier, password, mfaCode } = req.body;
    
    // Check if account is locked
    const isLocked = await AccountSecurity.isAccountLocked(identifier, 'email');
    if (isLocked) {
      return res.status(423).json({
        error: 'Account is temporarily locked due to multiple failed attempts',
        code: 'ACCOUNT_LOCKED'
      });
    }

    next();
  } catch (error) {
    console.error('Enhanced auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Biometric authentication placeholder (for mobile apps)
export const biometricAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const biometricToken = req.headers['x-biometric-token'];
  
  if (biometricToken) {
    // Validate biometric token
    console.log('🔐 Biometric authentication detected');
    // In production, validate against secure enclave/keychain
  }
  
  next();
};

export const enhancedSecurity = {
  AccountSecurity,
  MFAService,
  PasswordSecurity,
  paymentRateLimit,
  enhancedAuth,
  biometricAuthMiddleware,
};
