import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schema for creating safety reports
const createSafetyReportSchema = z.object({
  reportType: z.enum([
    'SAFETY_INCIDENT', 'FRAUD_ATTEMPT', 'IDENTITY_THEFT', 'VEHICLE_MISMATCH',
    'UNPROFESSIONAL_BEHAVIOR', 'THEFT_SUSPICION', 'FAKE_DOCUMENTS',
    'OVERCHARGING', 'ROUTE_DEVIATION', 'DAMAGE_DISPUTE', 'OTHER'
  ]),
  category: z.enum([
    'DRIVER_BEHAVIOR', 'VEHICLE_CONDITION', 'DOCUMENTATION', 'PAYMENT_FRAUD',
    'IDENTITY_FRAUD', 'SAFETY_VIOLATION', 'CUSTOMER_SERVICE', 'OPERATIONAL_ISSUE'
  ]),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  reportedDriverId: z.string().optional(),
  reportedFleetOwnerId: z.string().optional(),
  reportedTruckId: z.string().optional(),
  reportedBookingId: z.string().optional(),
  evidenceUrls: z.array(z.string()).default([]),
  witnessContacts: z.array(z.string()).default([]),
});

// GET /api/safety-reports - Get all safety reports (Admin only)
router.get('/', async (req, res) => {
  try {
    const { status, severity, category, page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {};
    
    if (status) whereClause.status = status;
    if (severity) whereClause.severity = severity;
    if (category) whereClause.category = category;

    const [reports, totalCount] = await Promise.all([
      prisma.safetyReport.findMany({
        where: whereClause,
        include: {
          reporter: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          reportedDriver: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true }
              }
            }
          },
          reportedFleetOwner: {
            include: {
              user: {
                select: { firstName: true, lastName: true, email: true }
              }
            }
          },
          reportedTruck: {
            select: { id: true, name: true, licensePlate: true }
          },
          reportedBooking: {
            select: { id: true, status: true, scheduledDateTime: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.safetyReport.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          hasNext: pageNum * limitNum < totalCount,
          hasPrev: pageNum > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching safety reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch safety reports',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/safety-reports - Create new safety report
router.post('/', async (req, res) => {
  try {
    const validatedData = createSafetyReportSchema.parse(req.body);
    const { reporterId } = req.body; // Should come from authenticated user

    if (!reporterId) {
      return res.status(400).json({
        success: false,
        message: 'Reporter ID is required'
      });
    }

    // Verify reporter exists
    const reporter = await prisma.user.findUnique({
      where: { id: reporterId }
    });

    if (!reporter) {
      return res.status(404).json({
        success: false,
        message: 'Reporter not found'
      });
    }

    // Validate that at least one entity is being reported
    const hasReportedEntity = !!(
      validatedData.reportedDriverId ||
      validatedData.reportedFleetOwnerId ||
      validatedData.reportedTruckId ||
      validatedData.reportedBookingId
    );

    if (!hasReportedEntity) {
      return res.status(400).json({
        success: false,
        message: 'At least one entity must be reported (driver, fleet owner, truck, or booking)'
      });
    }

    const safetyReport = await prisma.safetyReport.create({
      data: {
        reporterId,
        ...validatedData,
        status: 'PENDING'
      },
      include: {
        reporter: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        reportedDriver: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        reportedFleetOwner: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        reportedTruck: {
          select: { id: true, name: true, licensePlate: true }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: safetyReport,
      message: 'Safety report submitted successfully'
    });
  } catch (error) {
    console.error('Error creating safety report:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create safety report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/safety-reports/:id - Get specific safety report
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const report = await prisma.safetyReport.findUnique({
      where: { id },
      include: {
        reporter: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        reportedDriver: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        reportedFleetOwner: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        reportedTruck: {
          select: { id: true, name: true, licensePlate: true }
        },
        reportedBooking: {
          select: { id: true, status: true, scheduledDateTime: true }
        }
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Safety report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching safety report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch safety report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/safety-reports/:id/review - Admin review of safety report
router.put('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, actionTaken, reviewedBy } = req.body;

    if (!reviewedBy) {
      return res.status(400).json({
        success: false,
        message: 'Reviewer ID is required'
      });
    }

    if (!['INVESTIGATING', 'RESOLVED', 'DISMISSED', 'ESCALATED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be INVESTIGATING, RESOLVED, DISMISSED, or ESCALATED'
      });
    }

    const updatedReport = await prisma.safetyReport.update({
      where: { id },
      data: {
        status,
        reviewNotes,
        actionTaken,
        reviewedBy,
        reviewedAt: new Date()
      },
      include: {
        reporter: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        reportedDriver: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        },
        reportedFleetOwner: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedReport,
      message: 'Safety report reviewed successfully'
    });
  } catch (error) {
    console.error('Error reviewing safety report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review safety report',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/safety-reports/stats/overview - Get safety report statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalReports,
      pendingReports,
      resolvedReports,
      criticalReports,
      reportsByCategory,
      reportsBySeverity,
      recentReports
    ] = await Promise.all([
      prisma.safetyReport.count(),
      prisma.safetyReport.count({ where: { status: 'PENDING' } }),
      prisma.safetyReport.count({ where: { status: 'RESOLVED' } }),
      prisma.safetyReport.count({ where: { severity: 'CRITICAL' } }),
      prisma.safetyReport.groupBy({
        by: ['category'],
        _count: true
      }),
      prisma.safetyReport.groupBy({
        by: ['severity'],
        _count: true
      }),
      prisma.safetyReport.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: { firstName: true, lastName: true }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalReports,
          pendingReports,
          resolvedReports,
          criticalReports
        },
        breakdown: {
          byCategory: reportsByCategory,
          bySeverity: reportsBySeverity
        },
        recentReports
      }
    });
  } catch (error) {
    console.error('Error fetching safety report stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch safety report statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
