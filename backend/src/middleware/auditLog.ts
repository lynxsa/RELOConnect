import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuditLogData {
  entityType: string;
  entityId: string;
  action: string;
  actorType: 'USER' | 'ADMIN' | 'SYSTEM';
  actorId?: string;
  changes?: any;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
}

/**
 * Create an audit log entry for compliance and monitoring
 */
export async function auditLog(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        actorType: data.actorType,
        actorId: data.actorId,
        changes: data.changes,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        reason: data.reason,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw error to avoid breaking the main flow
  }
}

/**
 * Audit log middleware for Express
 */
export function auditLogMiddleware(action: string) {
  return (req: any, res: any, next: any) => {
    const originalSend = res.send;
    
    res.send = function(data: any) {
      // Log after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        auditLog({
          entityType: req.route?.path || 'unknown',
          entityId: req.params.id || 'system',
          action: action,
          actorType: req.user ? 'USER' : 'SYSTEM',
          actorId: req.user?.id,
          changes: {
            method: req.method,
            path: req.path,
            body: req.method !== 'GET' ? req.body : undefined,
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}

export default auditLog;
