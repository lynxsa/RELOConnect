import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
  };
}

// Rate limiter for authentication attempts
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Token blacklist (in production, use Redis or database)
const tokenBlacklist = new Set<string>();

export const blacklistToken = (token: string): void => {
  tokenBlacklist.add(token);
};

export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ 
        error: 'No authorization header provided',
        code: 'MISSING_AUTH_HEADER'
      });
      return;
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ 
        error: 'No token provided',
        code: 'MISSING_TOKEN'
      });
      return;
    }

    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      res.status(401).json({ 
        error: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET not configured');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as { 
      userId: string; 
      email: string; 
      role: string; 
      iat: number; 
      exp: number; 
    };

    // Additional security checks
    const now = Math.floor(Date.now() / 1000);
    
    // Check if token is expired (redundant check, but good practice)
    if (decoded.exp < now) {
      res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }

    // Check if token was issued too long ago (max 7 days)
    const maxTokenAge = 7 * 24 * 60 * 60; // 7 days in seconds
    if (decoded.iat < now - maxTokenAge) {
      res.status(401).json({ 
        error: 'Token too old, please login again',
        code: 'TOKEN_TOO_OLD'
      });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Role-based authorization middleware
export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }

    next();
  };
};

// Token refresh middleware
export const refreshToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token required' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    const decoded = jwt.verify(refreshToken, jwtSecret) as { 
      userId: string; 
      email: string; 
      role: string; 
      type: string;
    };

    // Ensure this is actually a refresh token
    if (decoded.type !== 'refresh') {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Generate new access token
    const newToken = jwt.sign(
      { 
        userId: decoded.userId, 
        email: decoded.email, 
        role: decoded.role 
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    res.json({ 
      token: newToken,
      expiresIn: 3600 // 1 hour
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// Export authenticateToken as alias for authMiddleware
export const authenticateToken = authMiddleware;

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};
