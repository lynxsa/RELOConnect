import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';
import { auditLog } from '../middleware/auditLog';
import sendEmail from '../services/emailService';
import BackgroundCheckService from '../services/backgroundCheckService';

const router = express.Router();
const prisma = new PrismaClient();
const backgroundCheckService = new BackgroundCheckService();

// ===== KYC MANAGEMENT ENDPOINTS =====

/**
 * GET /admin/kyc/pending
 * Get pending KYC verifications for admin review
 */
router.get('/kyc/pending', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Base where clause
    const whereClause: any = {
      kycStatus: {
        in: ['DOCUMENTS_REQUIRED', 'UNDER_REVIEW']
      }
    };

    let pendingItems: any[] = [];
    let totalCount = 0;

    switch (type) {
      case 'owner':
        const owners = await prisma.owner.findMany({
          where: {
            kycStatus: {
              in: ['DOCUMENTS_REQUIRED', 'UNDER_REVIEW']
            }
          },
          select: {
            id: true,
            name: true,
            businessName: true,
            kycStatus: true,
            createdAt: true,
            contactInfo: true,
            idDocuments: true,
            faceVerification: true
          },
          skip: offset,
          take: parseInt(limit as string),
          orderBy: { createdAt: 'desc' }
        });

        totalCount = await prisma.owner.count({
          where: {
            kycStatus: {
              in: ['DOCUMENTS_REQUIRED', 'UNDER_REVIEW']
            }
          }
        });

        pendingItems = owners.map(owner => ({
          id: owner.id,
          type: 'owner',
          name: owner.name || owner.businessName,
          submittedAt: owner.createdAt,
          priority: owner.businessName ? 'high' : 'medium', // Business owners get higher priority
          documentsCount: Object.keys(owner.idDocuments || {}).length,
          status: owner.kycStatus,
          hasDocuments: !!owner.idDocuments,
          hasFaceVerification: !!owner.faceVerification
        }));
        break;

      case 'driver':
        const drivers = await prisma.driver.findMany({
          where: {
            kycStatus: {
              in: ['DOCUMENTS_REQUIRED', 'UNDER_REVIEW']
            }
          },
          select: {
            id: true,
            name: true,
            email: true,
            kycStatus: true,
            createdAt: true,
            licenseDocs: true,
            faceVerification: true,
            backgroundCheck: true
          },
          skip: offset,
          take: parseInt(limit as string),
          orderBy: { createdAt: 'desc' }
        });

        totalCount = await prisma.driver.count({
          where: {
            kycStatus: {
              in: ['DOCUMENTS_REQUIRED', 'UNDER_REVIEW']
            }
          }
        });

        pendingItems = drivers.map(driver => ({
          id: driver.id,
          type: 'driver',
          name: driver.name,
          submittedAt: driver.createdAt,
          priority: 'high', // Drivers are high priority
          documentsCount: Object.keys(driver.licenseDocs || {}).length,
          status: driver.kycStatus,
          hasDocuments: !!driver.licenseDocs,
          hasFaceVerification: !!driver.faceVerification,
          hasBackgroundCheck: !!driver.backgroundCheck
        }));
        break;

      case 'assistant':
        const assistants = await prisma.assistant.findMany({
          where: {
            vettingStatus: {
              in: ['DOCUMENTS_REQUIRED', 'BACKGROUND_CHECK']
            }
          },
          select: {
            id: true,
            name: true,
            phone: true,
            vettingStatus: true,
            createdAt: true,
            idDocuments: true,
            faceVerification: true,
            backgroundCheckDocs: true
          },
          skip: offset,
          take: parseInt(limit as string),
          orderBy: { createdAt: 'desc' }
        });

        totalCount = await prisma.assistant.count({
          where: {
            vettingStatus: {
              in: ['DOCUMENTS_REQUIRED', 'BACKGROUND_CHECK']
            }
          }
        });

        pendingItems = assistants.map(assistant => ({
          id: assistant.id,
          type: 'assistant',
          name: assistant.name,
          submittedAt: assistant.createdAt,
          priority: 'medium',
          documentsCount: Object.keys(assistant.idDocuments || {}).length,
          status: assistant.vettingStatus,
          hasDocuments: !!assistant.idDocuments,
          hasFaceVerification: !!assistant.faceVerification,
          hasBackgroundCheckDocs: !!assistant.backgroundCheckDocs
        }));
        break;

      case 'user':
        const users = await prisma.user.findMany({
          where: {
            verificationLevel: 'BASIC',
            idDocuments: { not: null }
          },
          select: {
            id: true,
            name: true,
            email: true,
            verificationLevel: true,
            createdAt: true,
            idDocuments: true,
            faceVerification: true
          },
          skip: offset,
          take: parseInt(limit as string),
          orderBy: { createdAt: 'desc' }
        });

        totalCount = await prisma.user.count({
          where: {
            verificationLevel: 'BASIC',
            idDocuments: { not: null }
          }
        });

        pendingItems = users.map(user => ({
          id: user.id,
          type: 'user',
          name: user.name,
          submittedAt: user.createdAt,
          priority: 'low', // Users are lower priority
          documentsCount: Object.keys(user.idDocuments || {}).length,
          status: user.verificationLevel,
          hasDocuments: !!user.idDocuments,
          hasFaceVerification: !!user.faceVerification
        }));
        break;

      default:
        // Get all types
        const [allOwners, allDrivers, allAssistants, allUsers] = await Promise.all([
          prisma.owner.findMany({
            where: { kycStatus: { in: ['DOCUMENTS_REQUIRED', 'UNDER_REVIEW'] } },
            select: { id: true, name: true, businessName: true, kycStatus: true, createdAt: true },
            take: 5,
            orderBy: { createdAt: 'desc' }
          }),
          prisma.driver.findMany({
            where: { kycStatus: { in: ['DOCUMENTS_REQUIRED', 'UNDER_REVIEW'] } },
            select: { id: true, name: true, kycStatus: true, createdAt: true },
            take: 5,
            orderBy: { createdAt: 'desc' }
          }),
          prisma.assistant.findMany({
            where: { vettingStatus: { in: ['DOCUMENTS_REQUIRED', 'BACKGROUND_CHECK'] } },
            select: { id: true, name: true, vettingStatus: true, createdAt: true },
            take: 5,
            orderBy: { createdAt: 'desc' }
          }),
          prisma.user.findMany({
            where: { verificationLevel: 'BASIC', idDocuments: { not: null } },
            select: { id: true, name: true, verificationLevel: true, createdAt: true },
            take: 5,
            orderBy: { createdAt: 'desc' }
          })
        ]);

        pendingItems = [
          ...allOwners.map(item => ({ ...item, type: 'owner', priority: 'high' })),
          ...allDrivers.map(item => ({ ...item, type: 'driver', priority: 'high' })),
          ...allAssistants.map(item => ({ ...item, type: 'assistant', priority: 'medium' })),
          ...allUsers.map(item => ({ ...item, type: 'user', priority: 'low' }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        totalCount = pendingItems.length;
        break;
    }

    const totalPages = Math.ceil(totalCount / parseInt(limit as string));

    res.json({
      success: true,
      data: {
        items: pendingItems,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount,
          pages: totalPages,
          hasNext: parseInt(page as string) < totalPages,
          hasPrev: parseInt(page as string) > 1
        }
      }
    });

  } catch (error) {
    console.error('Failed to fetch pending KYC items:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve pending KYC items'
      }
    });
  }
});

/**
 * GET /admin/kyc/{entityType}/{entityId}/details
 * Get detailed information for KYC review
 */
router.get('/kyc/:entityType/:entityId/details', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    let entityDetails: any = null;

    switch (entityType) {
      case 'owner':
        entityDetails = await prisma.owner.findUnique({
          where: { id: entityId },
          include: {
            trucks: {
              select: {
                id: true,
                plate: true,
                makeModel: true,
                status: true
              }
            },
            drivers: {
              select: {
                id: true,
                name: true,
                email: true,
                kycStatus: true
              }
            }
          }
        });
        break;

      case 'driver':
        entityDetails = await prisma.driver.findUnique({
          where: { id: entityId },
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                businessName: true
              }
            },
            truck: {
              select: {
                id: true,
                plate: true,
                makeModel: true
              }
            }
          }
        });
        break;

      case 'assistant':
        entityDetails = await prisma.assistant.findUnique({
          where: { id: entityId }
        });
        break;

      case 'user':
        entityDetails = await prisma.user.findUnique({
          where: { id: entityId },
          include: {
            bookings: {
              select: {
                id: true,
                status: true,
                createdAt: true,
                totalPrice: true
              },
              take: 5,
              orderBy: { createdAt: 'desc' }
            }
          }
        });
        break;
    }

    if (!entityDetails) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `${entityType} not found`
        }
      });
    }

    res.json({
      success: true,
      data: entityDetails
    });

  } catch (error) {
    console.error('Failed to fetch entity details:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve entity details'
      }
    });
  }
});

/**
 * POST /admin/kyc/{entityType}/{entityId}/review
 * Admin approves or rejects KYC submission
 */
router.post('/kyc/:entityType/:entityId/review', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { decision, reason, notes, documentsReviewed } = req.body;

    if (!['approve', 'reject'].includes(decision)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Decision must be either "approve" or "reject"'
        }
      });
    }

    let updateResult: any = null;
    let entityData: any = null;

    // Update entity status based on decision
    switch (entityType) {
      case 'owner':
        updateResult = await prisma.owner.update({
          where: { id: entityId },
          data: {
            kycStatus: decision === 'approve' ? 'VERIFIED' : 'REJECTED',
            verifiedAt: decision === 'approve' ? new Date() : null
          }
        });
        entityData = updateResult;
        break;

      case 'driver':
        updateResult = await prisma.driver.update({
          where: { id: entityId },
          data: {
            kycStatus: decision === 'approve' ? 'VERIFIED' : 'REJECTED',
            verifiedAt: decision === 'approve' ? new Date() : null
          }
        });
        entityData = updateResult;
        break;

      case 'assistant':
        updateResult = await prisma.assistant.update({
          where: { id: entityId },
          data: {
            vettingStatus: decision === 'approve' ? 'APPROVED' : 'REJECTED'
          }
        });
        entityData = updateResult;
        break;

      case 'user':
        updateResult = await prisma.user.update({
          where: { id: entityId },
          data: {
            verificationLevel: decision === 'approve' ? 'VERIFIED' : 'BASIC'
          }
        });
        entityData = updateResult;
        break;
    }

    // Create audit log
    await auditLog({
      entityType: entityType.charAt(0).toUpperCase() + entityType.slice(1),
      entityId,
      action: decision === 'approve' ? 'VERIFIED' : 'REJECTED',
      actorType: 'ADMIN',
      actorId: req.user.id,
      changes: {
        decision,
        reason,
        notes,
        documentsReviewed
      },
      reason,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Send notification email
    const emailTemplate = decision === 'approve' ? 'kyc-approved' : 'kyc-rejected';
    let emailData: any = {
      name: entityData.name || entityData.businessName,
      entityType: entityType
    };

    if (decision === 'reject') {
      emailData.reason = reason;
      emailData.requiredActions = notes ? [notes] : [];
    } else {
      emailData.nextSteps = [
        'You can now access all platform features',
        'Complete your profile setup',
        'Start using RELOConnect services'
      ];
    }

    // Get email address
    let emailAddress: string | null = null;
    if (entityType === 'owner' && entityData.contactInfo?.email) {
      emailAddress = entityData.contactInfo.email;
    } else if (entityData.email) {
      emailAddress = entityData.email;
    }

    if (emailAddress) {
      await sendEmail({
        to: emailAddress,
        subject: `RELOConnect ${decision === 'approve' ? 'Verification Approved' : 'Additional Information Required'}`,
        template: emailTemplate,
        data: emailData
      });
    }

    res.json({
      success: true,
      data: {
        reviewId: `review_${Date.now()}`,
        decision,
        processedAt: new Date().toISOString(),
        notificationsSent: emailAddress ? [emailAddress] : []
      },
      message: `${entityType} ${decision === 'approve' ? 'approved' : 'rejected'} successfully`
    });

  } catch (error) {
    console.error('KYC review error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to process KYC review'
      }
    });
  }
});

// ===== AUDIT LOG ENDPOINTS =====

/**
 * GET /admin/audit-logs
 * Retrieve audit logs for compliance and monitoring
 */
router.get('/audit-logs', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const {
      entityType,
      entityId,
      action,
      from,
      to,
      page = 1,
      limit = 50
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build where clause
    const whereClause: any = {};

    if (entityType) whereClause.entityType = entityType;
    if (entityId) whereClause.entityId = entityId;
    if (action) whereClause.action = action;

    if (from || to) {
      whereClause.timestamp = {};
      if (from) whereClause.timestamp.gte = new Date(from as string);
      if (to) whereClause.timestamp.lte = new Date(to as string);
    }

    const [logs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        skip: offset,
        take: parseInt(limit as string),
        orderBy: { timestamp: 'desc' }
      }),
      prisma.auditLog.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit as string));

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount,
          pages: totalPages,
          hasNext: parseInt(page as string) < totalPages,
          hasPrev: parseInt(page as string) > 1
        }
      }
    });

  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve audit logs'
      }
    });
  }
});

// ===== DASHBOARD ANALYTICS =====

/**
 * GET /admin/dashboard/stats
 * Get dashboard statistics for admin overview
 */
router.get('/dashboard/stats', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
  try {
    const [
      pendingOwners,
      pendingDrivers,
      pendingAssistants,
      pendingUsers,
      totalBookings,
      todayBookings,
      activeTrucks,
      totalRevenue
    ] = await Promise.all([
      prisma.owner.count({
        where: { kycStatus: { in: ['DOCUMENTS_REQUIRED', 'UNDER_REVIEW'] } }
      }),
      prisma.driver.count({
        where: { kycStatus: { in: ['DOCUMENTS_REQUIRED', 'UNDER_REVIEW'] } }
      }),
      prisma.assistant.count({
        where: { vettingStatus: { in: ['DOCUMENTS_REQUIRED', 'BACKGROUND_CHECK'] } }
      }),
      prisma.user.count({
        where: { verificationLevel: 'BASIC', idDocuments: { not: null } }
      }),
      prisma.booking.count(),
      prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.truck.count({
        where: { status: 'AVAILABLE' }
      }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: { status: 'COMPLETED' }
      })
    ]);

    res.json({
      success: true,
      data: {
        kyc: {
          pendingOwners,
          pendingDrivers,
          pendingAssistants,
          pendingUsers,
          totalPending: pendingOwners + pendingDrivers + pendingAssistants + pendingUsers
        },
        platform: {
          totalBookings,
          todayBookings,
          activeTrucks,
          totalRevenue: totalRevenue._sum.totalPrice || 0
        },
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve dashboard statistics'
      }
    });
  }
});

export default router;
