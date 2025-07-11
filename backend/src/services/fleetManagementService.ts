import { PrismaClient } from '@prisma/client';
import { subDays, addDays, format } from 'date-fns';

const prisma = new PrismaClient();

export interface MaintenanceAlert {
  id: string;
  truckId: string;
  type: 'scheduled' | 'overdue' | 'urgent';
  maintenanceType: string;
  dueDate: Date;
  mileage?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost: number;
  description: string;
}

export interface SafetyIncident {
  id: string;
  driverId: string;
  truckId?: string;
  bookingId?: string;
  incidentType: string;
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  location: string;
  description: string;
  actionsTaken: string;
  followUpRequired: boolean;
  reportedAt: Date;
}

export interface VehiclePerformance {
  truckId: string;
  totalTrips: number;
  totalDistance: number;
  averageFuelConsumption: number;
  maintenanceCost: number;
  revenue: number;
  utilizationRate: number;
  safetyScore: number;
  period: {
    from: Date;
    to: Date;
  };
}

export interface DriverComplianceStatus {
  driverId: string;
  licenseStatus: 'valid' | 'expiring' | 'expired';
  licenseExpiryDate: Date;
  medicalCertificate: 'valid' | 'expiring' | 'expired';
  trainingStatus: 'current' | 'required' | 'overdue';
  backgroundCheckStatus: 'cleared' | 'pending' | 'flagged';
  safetyRating: number;
  lastSafetyTraining: Date;
  complianceScore: number;
}

export class FleetManagementService {
  // Vehicle Maintenance Management
  async scheduleMaintenanceAlert(
    truckId: string,
    maintenanceType: string,
    dueDate: Date,
    estimatedCost: number,
    description: string
  ): Promise<MaintenanceAlert> {
    try {
      // Check if truck exists
      const truck = await prisma.truck.findUnique({
        where: { id: truckId },
      });

      if (!truck) {
        throw new Error('Truck not found');
      }

      // Determine priority based on due date
      const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
      let type: 'scheduled' | 'overdue' | 'urgent' = 'scheduled';

      if (daysUntilDue < 0) {
        priority = 'critical';
        type = 'overdue';
      } else if (daysUntilDue <= 7) {
        priority = 'high';
        type = 'urgent';
      } else if (daysUntilDue <= 30) {
        priority = 'medium';
      }

      // Create maintenance alert (would need to add to schema)
      const alert: MaintenanceAlert = {
        id: `maint_${Date.now()}`,
        truckId,
        type,
        maintenanceType,
        dueDate,
        priority,
        estimatedCost,
        description,
      };

      console.log(`🔧 Maintenance alert created: ${alert.id} for truck ${truckId}`);
      return alert;
    } catch (error) {
      console.error('Error scheduling maintenance alert:', error);
      throw error;
    }
  }

  // Get upcoming maintenance alerts
  async getUpcomingMaintenance(
    fleetOwnerId: string,
    daysAhead: number = 30
  ): Promise<MaintenanceAlert[]> {
    try {
      // Get all trucks for the fleet owner
      const trucks = await prisma.truck.findMany({
        where: { fleetOwnerId },
      });

      const alerts: MaintenanceAlert[] = [];

      for (const truck of trucks) {
        // Mock maintenance scheduling based on truck age and mileage
        const registrationDate = new Date(truck.registrationDate);
        const daysSinceRegistration = Math.floor((Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Schedule different types of maintenance
        const maintenanceTypes = [
          { type: 'Oil Change', interval: 90, cost: 1500 },
          { type: 'Tire Inspection', interval: 180, cost: 3000 },
          { type: 'Annual Inspection', interval: 365, cost: 5000 },
          { type: 'Brake Service', interval: 120, cost: 4000 },
        ];

        for (const maintenance of maintenanceTypes) {
          const lastService = Math.floor(daysSinceRegistration / maintenance.interval) * maintenance.interval;
          const nextServiceDays = lastService + maintenance.interval;
          const nextServiceDate = addDays(registrationDate, nextServiceDays);

          if (nextServiceDate <= addDays(new Date(), daysAhead)) {
            const alert = await this.scheduleMaintenanceAlert(
              truck.id,
              maintenance.type,
              nextServiceDate,
              maintenance.cost,
              `${maintenance.type} due for ${truck.make} ${truck.model}`
            );
            alerts.push(alert);
          }
        }
      }

      // Sort by priority and due date
      return alerts.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return a.dueDate.getTime() - b.dueDate.getTime();
      });
    } catch (error) {
      console.error('Error getting upcoming maintenance:', error);
      throw error;
    }
  }

  // Vehicle Performance Analytics
  async getVehiclePerformance(
    truckId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<VehiclePerformance> {
    try {
      const truck = await prisma.truck.findUnique({
        where: { id: truckId },
        include: {
          assignments: {
            include: {
              booking: true,
            },
            where: {
              assignedAt: {
                gte: fromDate,
                lte: toDate,
              },
            },
          },
        },
      });

      if (!truck) {
        throw new Error('Truck not found');
      }

      // Calculate performance metrics
      const totalTrips = truck.assignments.length;
      const completedBookings = truck.assignments.filter(a => a.booking.status === 'COMPLETED');
      const totalRevenue = completedBookings.reduce((sum, a) => sum + a.booking.totalPrice, 0);
      
      // Mock calculations for other metrics
      const totalDistance = totalTrips * 25; // Average 25km per trip
      const averageFuelConsumption = totalDistance * 0.35; // 35L per 100km
      const maintenanceCost = Math.floor(Math.random() * 5000) + 1000; // Mock maintenance cost
      const utilizationRate = Math.min((totalTrips * 2) / 30, 1); // Based on 30 days, 15 trips = 100%
      const safetyScore = Math.max(100 - (Math.random() * 20), 80); // Mock safety score

      return {
        truckId,
        totalTrips,
        totalDistance,
        averageFuelConsumption,
        maintenanceCost,
        revenue: totalRevenue,
        utilizationRate,
        safetyScore,
        period: {
          from: fromDate,
          to: toDate,
        },
      };
    } catch (error) {
      console.error('Error getting vehicle performance:', error);
      throw error;
    }
  }

  // Driver Compliance Management
  async getDriverComplianceStatus(driverId: string): Promise<DriverComplianceStatus> {
    try {
      const driver = await prisma.driverProfile.findUnique({
        where: { id: driverId },
        include: {
          user: true,
          safetyReports: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!driver) {
        throw new Error('Driver not found');
      }

      // Calculate compliance status
      const licenseExpiryDate = new Date(driver.licenseExpiryDate);
      const daysUntilExpiry = Math.ceil((licenseExpiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      let licenseStatus: 'valid' | 'expiring' | 'expired' = 'valid';
      if (daysUntilExpiry < 0) {
        licenseStatus = 'expired';
      } else if (daysUntilExpiry <= 30) {
        licenseStatus = 'expiring';
      }

      // Mock other compliance data
      const safetyIncidents = driver.safetyReports.length;
      const safetyRating = Math.max(100 - (safetyIncidents * 5), 50);
      const complianceScore = licenseStatus === 'valid' ? 
        Math.max(safetyRating - (safetyIncidents * 2), 60) : 
        Math.max(safetyRating - 20, 40);

      return {
        driverId,
        licenseStatus,
        licenseExpiryDate,
        medicalCertificate: 'valid', // Mock
        trainingStatus: 'current', // Mock
        backgroundCheckStatus: 'cleared', // Mock
        safetyRating,
        lastSafetyTraining: subDays(new Date(), 90), // Mock
        complianceScore,
      };
    } catch (error) {
      console.error('Error getting driver compliance status:', error);
      throw error;
    }
  }

  // Safety Incident Reporting
  async reportSafetyIncident(
    driverId: string,
    incidentData: {
      truckId?: string;
      bookingId?: string;
      incidentType: string;
      severity: 'minor' | 'moderate' | 'severe' | 'critical';
      location: string;
      description: string;
      actionsTaken: string;
    }
  ): Promise<SafetyIncident> {
    try {
      // Create safety report
      const safetyReport = await prisma.safetyReport.create({
        data: {
          driverId,
          type: incidentData.incidentType,
          severity: incidentData.severity,
          location: incidentData.location,
          description: incidentData.description,
          actionsTaken: incidentData.actionsTaken,
          followUpRequired: incidentData.severity === 'severe' || incidentData.severity === 'critical',
          status: 'REPORTED',
        },
      });

      const incident: SafetyIncident = {
        id: safetyReport.id,
        driverId,
        truckId: incidentData.truckId,
        bookingId: incidentData.bookingId,
        incidentType: incidentData.incidentType,
        severity: incidentData.severity,
        location: incidentData.location,
        description: incidentData.description,
        actionsTaken: incidentData.actionsTaken,
        followUpRequired: safetyReport.followUpRequired,
        reportedAt: safetyReport.createdAt,
      };

      // Auto-escalate critical incidents
      if (incidentData.severity === 'critical') {
        await this.escalateIncident(incident.id);
      }

      console.log(`🚨 Safety incident reported: ${incident.id}`);
      return incident;
    } catch (error) {
      console.error('Error reporting safety incident:', error);
      throw error;
    }
  }

  // Fleet-wide safety analytics
  async getFleetSafetyAnalytics(
    fleetOwnerId: string,
    period: { from: Date; to: Date }
  ): Promise<{
    totalIncidents: number;
    incidentsByType: Record<string, number>;
    incidentsBySeverity: Record<string, number>;
    averageSafetyScore: number;
    trendsData: Array<{
      date: string;
      incidents: number;
      safetyScore: number;
    }>;
  }> {
    try {
      // Get all drivers for the fleet
      const fleet = await prisma.fleetOwner.findUnique({
        where: { id: fleetOwnerId },
        include: {
          trucks: {
            include: {
              assignments: {
                include: {
                  driver: {
                    include: {
                      safetyReports: {
                        where: {
                          createdAt: {
                            gte: period.from,
                            lte: period.to,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!fleet) {
        throw new Error('Fleet not found');
      }

      // Aggregate safety data
      const allIncidents = fleet.trucks.flatMap(truck => 
        truck.assignments.flatMap(assignment => 
          assignment.driver.safetyReports
        )
      );

      const totalIncidents = allIncidents.length;
      
      const incidentsByType = allIncidents.reduce((acc, incident) => {
        acc[incident.type] = (acc[incident.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const incidentsBySeverity = allIncidents.reduce((acc, incident) => {
        acc[incident.severity] = (acc[incident.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate average safety score
      const driverCount = new Set(fleet.trucks.flatMap(truck => 
        truck.assignments.map(assignment => assignment.driverId)
      )).size;

      const averageSafetyScore = driverCount > 0 ? 
        Math.max(100 - (totalIncidents / driverCount * 5), 60) : 100;

      // Generate trends data (weekly)
      const trendsData = [];
      const startDate = new Date(period.from);
      const endDate = new Date(period.to);
      
      while (startDate <= endDate) {
        const weekEnd = addDays(startDate, 7);
        const weekIncidents = allIncidents.filter(incident => 
          incident.createdAt >= startDate && incident.createdAt < weekEnd
        ).length;

        trendsData.push({
          date: format(startDate, 'yyyy-MM-dd'),
          incidents: weekIncidents,
          safetyScore: Math.max(100 - (weekIncidents * 10), 50),
        });

        startDate.setDate(startDate.getDate() + 7);
      }

      return {
        totalIncidents,
        incidentsByType,
        incidentsBySeverity,
        averageSafetyScore,
        trendsData,
      };
    } catch (error) {
      console.error('Error getting fleet safety analytics:', error);
      throw error;
    }
  }

  // Insurance tracking
  async checkInsuranceStatus(truckId: string): Promise<{
    isValid: boolean;
    expiryDate: Date;
    daysUntilExpiry: number;
    provider: string;
    policyNumber: string;
    status: 'valid' | 'expiring' | 'expired';
  }> {
    try {
      const truck = await prisma.truck.findUnique({
        where: { id: truckId },
      });

      if (!truck) {
        throw new Error('Truck not found');
      }

      // Mock insurance data (would come from truck insurance fields)
      const expiryDate = addDays(new Date(), Math.floor(Math.random() * 365));
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      let status: 'valid' | 'expiring' | 'expired' = 'valid';
      if (daysUntilExpiry < 0) {
        status = 'expired';
      } else if (daysUntilExpiry <= 30) {
        status = 'expiring';
      }

      return {
        isValid: status !== 'expired',
        expiryDate,
        daysUntilExpiry,
        provider: 'Santam Insurance', // Mock
        policyNumber: `POL${truck.registrationNumber}`, // Mock
        status,
      };
    } catch (error) {
      console.error('Error checking insurance status:', error);
      throw error;
    }
  }

  // Escalate critical incidents
  private async escalateIncident(incidentId: string): Promise<void> {
    try {
      console.log(`🚨 CRITICAL INCIDENT ESCALATED: ${incidentId}`);
      // In production: send alerts to fleet managers, safety officers
      // Integration with emergency services if needed
    } catch (error) {
      console.error('Error escalating incident:', error);
    }
  }

  // Get fleet overview dashboard data
  async getFleetOverview(fleetOwnerId: string): Promise<{
    totalTrucks: number;
    activeTrucks: number;
    maintenanceAlerts: number;
    safetyIncidents: number;
    complianceIssues: number;
    averageUtilization: number;
    monthlyRevenue: number;
  }> {
    try {
      const fleet = await prisma.fleetOwner.findUnique({
        where: { id: fleetOwnerId },
        include: {
          trucks: {
            include: {
              assignments: {
                include: {
                  booking: true,
                  driver: {
                    include: {
                      safetyReports: {
                        where: {
                          createdAt: {
                            gte: subDays(new Date(), 30),
                          },
                        },
                      },
                    },
                  },
                },
                where: {
                  assignedAt: {
                    gte: subDays(new Date(), 30),
                  },
                },
              },
            },
          },
        },
      });

      if (!fleet) {
        throw new Error('Fleet not found');
      }

      const totalTrucks = fleet.trucks.length;
      const activeTrucks = fleet.trucks.filter(truck => 
        truck.assignments.some(assignment => 
          assignment.status === 'ACTIVE'
        )
      ).length;

      const maintenanceAlerts = await this.getUpcomingMaintenance(fleetOwnerId, 30);
      const safetyIncidents = fleet.trucks.flatMap(truck => 
        truck.assignments.flatMap(assignment => assignment.driver.safetyReports)
      ).length;

      // Mock compliance issues (drivers with expiring licenses, etc.)
      const complianceIssues = Math.floor(totalTrucks * 0.1); // 10% of fleet

      const totalRevenue = fleet.trucks.flatMap(truck => 
        truck.assignments.map(assignment => assignment.booking.totalPrice)
      ).reduce((sum, price) => sum + price, 0);

      const averageUtilization = activeTrucks / totalTrucks;

      return {
        totalTrucks,
        activeTrucks,
        maintenanceAlerts: maintenanceAlerts.length,
        safetyIncidents,
        complianceIssues,
        averageUtilization,
        monthlyRevenue: totalRevenue,
      };
    } catch (error) {
      console.error('Error getting fleet overview:', error);
      throw error;
    }
  }
}

export const fleetManagementService = new FleetManagementService();
