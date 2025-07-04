import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Create a single instance of Prisma Client
const prisma = new PrismaClient();

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      prisma: PrismaClient;
    }
  }
}

/**
 * Middleware to attach Prisma client to the request object
 */
export function prismaMiddleware(req: Request, res: Response, next: NextFunction) {
  req.prisma = prisma;
  next();
}
