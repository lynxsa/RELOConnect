import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createPortSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(2).max(10),
  country: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string().min(1),
  facilities: z.array(z.string()).optional(),
});

const createVesselSchema = z.object({
  name: z.string().min(1),
  imo: z.string().min(1),
  type: z.string().min(1),
  flag: z.string().min(1),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  draft: z.number().positive().optional(),
});

const createScheduleSchema = z.object({
  portId: z.string().min(1),
  vesselId: z.string().min(1),
  eta: z.string(),
  etd: z.string(),
  status: z.enum(['SCHEDULED', 'ARRIVED', 'DEPARTED', 'DELAYED', 'CANCELLED']).optional(),
  berth: z.string().optional(),
  cargo: z.string().min(1),
});

// Get all ports
router.get('/', async (req, res) => {
  try {
    const { country, search, page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    let whereClause: any = {};

    if (country) {
      whereClause.country = {
        contains: country as string,
        mode: 'insensitive'
      };
    }

    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search as string,
            mode: 'insensitive'
          }
        },
        {
          code: {
            contains: search as string,
            mode: 'insensitive'
          }
        }
      ];
    }

    const [ports, total] = await Promise.all([
      prisma.port.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              schedules: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        },
        skip,
        take,
      }),
      prisma.port.count({
        where: whereClause
      })
    ]);

    return res.json({
      ports,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get ports error:', error);
    return res.status(500).json({ error: 'Failed to fetch ports' });
  }
});

// Get port by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const port = await prisma.port.findUnique({
      where: { id },
      include: {
        schedules: {
          include: {
            vessel: true
          },
          orderBy: {
            eta: 'asc'
          },
          take: 20 // Latest 20 schedules
        }
      }
    });

    if (!port) {
      return res.status(404).json({ error: 'Port not found' });
    }

    return res.json({ port });
  } catch (error) {
    console.error('Get port error:', error);
    return res.status(500).json({ error: 'Failed to fetch port' });
  }
});

// Get port by code
router.get('/code/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const port = await prisma.port.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        schedules: {
          include: {
            vessel: true
          },
          orderBy: {
            eta: 'asc'
          },
          take: 20
        }
      }
    });

    if (!port) {
      return res.status(404).json({ error: 'Port not found' });
    }

    return res.json({ port });
  } catch (error) {
    console.error('Get port by code error:', error);
    return res.status(500).json({ error: 'Failed to fetch port' });
  }
});

// Get ports by country
router.get('/country/:country', async (req, res) => {
  try {
    const { country } = req.params;

    const ports = await prisma.port.findMany({
      where: {
        country: {
          contains: country,
          mode: 'insensitive'
        }
      },
      include: {
        _count: {
          select: {
            schedules: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return res.json({ ports });
  } catch (error) {
    console.error('Get ports by country error:', error);
    return res.status(500).json({ error: 'Failed to fetch ports' });
  }
});

// Get port schedules
router.get('/:id/schedules', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      vesselType, 
      fromDate, 
      toDate, 
      page = 1, 
      limit = 50 
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    let whereClause: any = { portId: id };

    if (status) {
      whereClause.status = status;
    }

    if (fromDate && toDate) {
      whereClause.eta = {
        gte: new Date(fromDate as string),
        lte: new Date(toDate as string)
      };
    } else if (fromDate) {
      whereClause.eta = {
        gte: new Date(fromDate as string)
      };
    } else if (toDate) {
      whereClause.eta = {
        lte: new Date(toDate as string)
      };
    }

    if (vesselType) {
      whereClause.vessel = {
        type: {
          contains: vesselType as string,
          mode: 'insensitive'
        }
      };
    }

    const [schedules, total] = await Promise.all([
      prisma.portSchedule.findMany({
        where: whereClause,
        include: {
          vessel: true,
          port: {
            select: {
              name: true,
              code: true
            }
          }
        },
        orderBy: {
          eta: 'asc'
        },
        skip,
        take,
      }),
      prisma.portSchedule.count({
        where: whereClause
      })
    ]);

    return res.json({
      schedules,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get port schedules error:', error);
    return res.status(500).json({ error: 'Failed to fetch port schedules' });
  }
});

// Get all vessels
router.get('/vessels/all', async (req, res) => {
  try {
    const { type, flag, search, page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    let whereClause: any = {};

    if (type) {
      whereClause.type = {
        contains: type as string,
        mode: 'insensitive'
      };
    }

    if (flag) {
      whereClause.flag = {
        contains: flag as string,
        mode: 'insensitive'
      };
    }

    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search as string,
            mode: 'insensitive'
          }
        },
        {
          imo: {
            contains: search as string,
            mode: 'insensitive'
          }
        }
      ];
    }

    const [vessels, total] = await Promise.all([
      prisma.vessel.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              schedules: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        },
        skip,
        take,
      }),
      prisma.vessel.count({
        where: whereClause
      })
    ]);

    return res.json({
      vessels,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get vessels error:', error);
    return res.status(500).json({ error: 'Failed to fetch vessels' });
  }
});

// Get vessel by ID
router.get('/vessels/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const vessel = await prisma.vessel.findUnique({
      where: { id },
      include: {
        schedules: {
          include: {
            port: true
          },
          orderBy: {
            eta: 'asc'
          }
        }
      }
    });

    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }

    return res.json({ vessel });
  } catch (error) {
    console.error('Get vessel error:', error);
    return res.status(500).json({ error: 'Failed to fetch vessel' });
  }
});

// Get vessel by IMO
router.get('/vessels/imo/:imo', async (req, res) => {
  try {
    const { imo } = req.params;

    const vessel = await prisma.vessel.findUnique({
      where: { imo: imo.toUpperCase() },
      include: {
        schedules: {
          include: {
            port: true
          },
          orderBy: {
            eta: 'asc'
          }
        }
      }
    });

    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }

    return res.json({ vessel });
  } catch (error) {
    console.error('Get vessel by IMO error:', error);
    return res.status(500).json({ error: 'Failed to fetch vessel' });
  }
});

// Track vessel (get current and upcoming schedules)
router.get('/vessels/:id/track', async (req, res) => {
  try {
    const { id } = req.params;

    const vessel = await prisma.vessel.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        imo: true,
        type: true,
        flag: true
      }
    });

    if (!vessel) {
      return res.status(404).json({ error: 'Vessel not found' });
    }

    const now = new Date();

    // Get current port (where vessel has arrived but not departed)
    const currentSchedule = await prisma.portSchedule.findFirst({
      where: {
        vesselId: id,
        eta: { lte: now },
        etd: { gte: now },
        status: 'ARRIVED'
      },
      include: {
        port: true
      }
    });

    // Get upcoming schedules
    const upcomingSchedules = await prisma.portSchedule.findMany({
      where: {
        vesselId: id,
        eta: { gte: now }
      },
      include: {
        port: true
      },
      orderBy: {
        eta: 'asc'
      },
      take: 10
    });

    // Get recent history
    const recentSchedules = await prisma.portSchedule.findMany({
      where: {
        vesselId: id,
        etd: { lte: now },
        status: 'DEPARTED'
      },
      include: {
        port: true
      },
      orderBy: {
        etd: 'desc'
      },
      take: 5
    });

    return res.json({
      vessel,
      currentSchedule,
      upcomingSchedules,
      recentSchedules
    });
  } catch (error) {
    console.error('Track vessel error:', error);
    return res.status(500).json({ error: 'Failed to track vessel' });
  }
});

// Get all schedules with filters
router.get('/schedules/all', async (req, res) => {
  try {
    const { 
      portCode, 
      vesselImo, 
      status, 
      fromDate, 
      toDate, 
      page = 1, 
      limit = 50 
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    let whereClause: any = {};

    if (portCode) {
      whereClause.port = {
        code: portCode as string
      };
    }

    if (vesselImo) {
      whereClause.vessel = {
        imo: vesselImo as string
      };
    }

    if (status) {
      whereClause.status = status;
    }

    if (fromDate && toDate) {
      whereClause.eta = {
        gte: new Date(fromDate as string),
        lte: new Date(toDate as string)
      };
    }

    const [schedules, total] = await Promise.all([
      prisma.portSchedule.findMany({
        where: whereClause,
        include: {
          port: true,
          vessel: true
        },
        orderBy: {
          eta: 'asc'
        },
        skip,
        take,
      }),
      prisma.portSchedule.count({
        where: whereClause
      })
    ]);

    return res.json({
      schedules,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get all schedules error:', error);
    return res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Get port statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalPorts,
      totalVessels,
      totalSchedules,
      activeVessels,
      countryCount
    ] = await Promise.all([
      prisma.port.count(),
      prisma.vessel.count(),
      prisma.portSchedule.count(),
      prisma.portSchedule.count({
        where: {
          status: {
            in: ['SCHEDULED', 'ARRIVED']
          }
        }
      }),
      prisma.port.groupBy({
        by: ['country'],
        _count: {
          country: true
        }
      })
    ]);

    return res.json({
      stats: {
        totalPorts,
        totalVessels,
        totalSchedules,
        activeVessels,
        countries: countryCount.length,
        topCountries: countryCount
          .sort((a, b) => b._count.country - a._count.country)
          .slice(0, 10)
          .map(item => ({
            country: item.country,
            ports: item._count.country
          }))
      }
    });
  } catch (error) {
    console.error('Get port stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch port statistics' });
  }
});

// Admin routes (would need admin middleware)

// Create port
router.post('/', async (req, res) => {
  try {
    const validatedData = createPortSchema.parse(req.body);

    const port = await prisma.port.create({
      data: {
        ...validatedData,
        code: validatedData.code.toUpperCase(),
        facilities: validatedData.facilities || [],
      }
    });

    return res.status(201).json({
      message: 'Port created successfully',
      port
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Create port error:', error);
    return res.status(500).json({ error: 'Failed to create port' });
  }
});

// Create vessel
router.post('/vessels', async (req, res) => {
  try {
    const validatedData = createVesselSchema.parse(req.body);

    const vessel = await prisma.vessel.create({
      data: {
        ...validatedData,
        imo: validatedData.imo.toUpperCase(),
      }
    });

    return res.status(201).json({
      message: 'Vessel created successfully',
      vessel
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Create vessel error:', error);
    return res.status(500).json({ error: 'Failed to create vessel' });
  }
});

// Create schedule
router.post('/schedules', async (req, res) => {
  try {
    const validatedData = createScheduleSchema.parse(req.body);

    const schedule = await prisma.portSchedule.create({
      data: {
        ...validatedData,
        eta: new Date(validatedData.eta),
        etd: new Date(validatedData.etd),
        status: validatedData.status || 'SCHEDULED',
      },
      include: {
        port: true,
        vessel: true
      }
    });

    return res.status(201).json({
      message: 'Schedule created successfully',
      schedule
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Create schedule error:', error);
    return res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Update schedule status
router.put('/schedules/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['SCHEDULED', 'ARRIVED', 'DEPARTED', 'DELAYED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const schedule = await prisma.portSchedule.update({
      where: { id },
      data: { status },
      include: {
        port: true,
        vessel: true
      }
    });

    return res.json({
      message: 'Schedule status updated successfully',
      schedule
    });
  } catch (error) {
    console.error('Update schedule status error:', error);
    return res.status(500).json({ error: 'Failed to update schedule status' });
  }
});

export default router;
