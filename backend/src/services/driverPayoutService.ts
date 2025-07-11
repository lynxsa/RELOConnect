import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16',
});

// Validation schemas
const DriverAccountSchema = z.object({
  driverId: z.string().uuid(),
  email: z.string().email(),
  country: z.string().min(2).max(2), // ISO country code
  businessType: z.enum(['individual', 'company']),
  bankAccount: z.object({
    accountNumber: z.string(),
    routingNumber: z.string().optional(),
    currency: z.string().min(3).max(3),
  }),
  personalInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.object({
      day: z.number().min(1).max(31),
      month: z.number().min(1).max(12),
      year: z.number().min(1900).max(new Date().getFullYear() - 18),
    }),
    address: z.object({
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
      country: z.string().min(2).max(2),
    }),
    phone: z.string(),
    ssn: z.string().optional(), // For US accounts
  }),
});

const PayoutRequestSchema = z.object({
  driverId: z.string().uuid(),
  amount: z.number().min(1),
  currency: z.string().min(3).max(3),
  description: z.string().optional(),
});

export interface DriverAccount {
  stripeAccountId: string;
  accountStatus: 'pending' | 'active' | 'restricted' | 'rejected';
  requirementsNeeded: string[];
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
}

export interface PayoutResult {
  payoutId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled';
  arrivalDate: Date;
  failureCode?: string;
  failureMessage?: string;
}

export interface EarningsCalculation {
  totalEarnings: number;
  platformFee: number;
  netAmount: number;
  trips: number;
  period: {
    start: Date;
    end: Date;
  };
}

class DriverPayoutService {
  
  /**
   * Create Stripe Connect account for driver
   */
  async createDriverAccount(data: z.infer<typeof DriverAccountSchema>): Promise<DriverAccount> {
    try {
      const validatedData = DriverAccountSchema.parse(data);
      
      // Check if driver already has a Stripe account
      const existingDriver = await prisma.user.findUnique({
        where: { id: validatedData.driverId },
        select: { stripeAccountId: true },
      });
      
      if (existingDriver?.stripeAccountId) {
        throw new Error('Driver already has a Stripe account');
      }
      
      // Create Stripe Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country: validatedData.country,
        email: validatedData.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: validatedData.businessType,
        individual: validatedData.businessType === 'individual' ? {
          first_name: validatedData.personalInfo.firstName,
          last_name: validatedData.personalInfo.lastName,
          email: validatedData.email,
          phone: validatedData.personalInfo.phone,
          dob: validatedData.personalInfo.dateOfBirth,
          address: validatedData.personalInfo.address,
          ssn_last_4: validatedData.personalInfo.ssn?.slice(-4),
        } : undefined,
        external_account: {
          object: 'bank_account',
          country: validatedData.country,
          currency: validatedData.bankAccount.currency,
          account_number: validatedData.bankAccount.accountNumber,
          routing_number: validatedData.bankAccount.routingNumber,
        },
        tos_acceptance: {
          date: Math.floor(Date.now() / 1000),
          ip: '127.0.0.1', // Should be replaced with actual IP
        },
      });
      
      // Update driver record
      await prisma.user.update({
        where: { id: validatedData.driverId },
        data: {
          stripeAccountId: account.id,
          payoutAccountStatus: 'pending',
        },
      });
      
      return {
        stripeAccountId: account.id,
        accountStatus: 'pending',
        requirementsNeeded: account.requirements?.currently_due || [],
        payoutsEnabled: account.payouts_enabled || false,
        chargesEnabled: account.charges_enabled || false,
      };
      
    } catch (error) {
      console.error('Error creating driver account:', error);
      throw new Error(`Failed to create driver account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Generate account link for driver onboarding
   */
  async createAccountLink(driverId: string): Promise<string> {
    try {
      const driver = await prisma.user.findUnique({
        where: { id: driverId },
        select: { stripeAccountId: true },
      });
      
      if (!driver?.stripeAccountId) {
        throw new Error('Driver does not have a Stripe account');
      }
      
      const accountLink = await stripe.accountLinks.create({
        account: driver.stripeAccountId,
        refresh_url: `${process.env.FRONTEND_URL}/driver/account/refresh`,
        return_url: `${process.env.FRONTEND_URL}/driver/account/complete`,
        type: 'account_onboarding',
      });
      
      return accountLink.url;
      
    } catch (error) {
      console.error('Error creating account link:', error);
      throw new Error(`Failed to create account link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Check driver account status
   */
  async getAccountStatus(driverId: string): Promise<DriverAccount> {
    try {
      const driver = await prisma.user.findUnique({
        where: { id: driverId },
        select: { stripeAccountId: true },
      });
      
      if (!driver?.stripeAccountId) {
        throw new Error('Driver does not have a Stripe account');
      }
      
      const account = await stripe.accounts.retrieve(driver.stripeAccountId);
      
      // Determine account status
      let status: DriverAccount['accountStatus'] = 'pending';
      if (account.charges_enabled && account.payouts_enabled) {
        status = 'active';
      } else if (account.requirements?.disabled_reason) {
        status = 'restricted';
      }
      
      // Update local status
      await prisma.user.update({
        where: { id: driverId },
        data: {
          payoutAccountStatus: status,
          payoutsEnabled: account.payouts_enabled,
        },
      });
      
      return {
        stripeAccountId: account.id,
        accountStatus: status,
        requirementsNeeded: account.requirements?.currently_due || [],
        payoutsEnabled: account.payouts_enabled || false,
        chargesEnabled: account.charges_enabled || false,
      };
      
    } catch (error) {
      console.error('Error getting account status:', error);
      throw new Error(`Failed to get account status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Calculate driver earnings for a period
   */
  async calculateEarnings(driverId: string, startDate: Date, endDate: Date): Promise<EarningsCalculation> {
    try {
      // Get completed bookings for the period
      const bookings = await prisma.booking.findMany({
        where: {
          driverId,
          status: 'COMPLETED',
          completedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          totalAmount: true,
          commission: true,
          driverEarnings: true,
        },
      });
      
      const totalEarnings = bookings.reduce((sum: number, booking: any) => sum + (booking.driverEarnings || 0), 0);
      const platformFee = bookings.reduce((sum: number, booking: any) => sum + (booking.commission || 0), 0);
      const netAmount = totalEarnings;
      
      return {
        totalEarnings,
        platformFee,
        netAmount,
        trips: bookings.length,
        period: {
          start: startDate,
          end: endDate,
        },
      };
      
    } catch (error) {
      console.error('Error calculating earnings:', error);
      throw new Error(`Failed to calculate earnings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Process payout to driver
   */
  async processPayout(data: z.infer<typeof PayoutRequestSchema>): Promise<PayoutResult> {
    try {
      const validatedData = PayoutRequestSchema.parse(data);
      
      // Get driver's Stripe account
      const driver = await prisma.user.findUnique({
        where: { id: validatedData.driverId },
        select: { 
          stripeAccountId: true,
          payoutsEnabled: true,
          payoutAccountStatus: true,
        },
      });
      
      if (!driver?.stripeAccountId) {
        throw new Error('Driver does not have a Stripe account');
      }
      
      if (!driver.payoutsEnabled || driver.payoutAccountStatus !== 'active') {
        throw new Error('Driver account is not eligible for payouts');
      }
      
      // Check available balance (in a real app, you'd track this)
      const earnings = await this.calculateEarnings(
        validatedData.driverId,
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        new Date()
      );
      
      if (validatedData.amount > earnings.netAmount) {
        throw new Error('Insufficient balance for payout');
      }
      
      // Create transfer to driver account
      const transfer = await stripe.transfers.create({
        amount: Math.round(validatedData.amount * 100), // Convert to cents
        currency: validatedData.currency,
        destination: driver.stripeAccountId,
        description: validatedData.description || `Payout for driver ${validatedData.driverId}`,
      });
      
      // Record payout in database
      const payout = await prisma.driverPayout.create({
        data: {
          driverId: validatedData.driverId,
          stripeTransferId: transfer.id,
          amount: validatedData.amount,
          currency: validatedData.currency,
          status: 'pending',
          description: validatedData.description,
        },
      });
      
      return {
        payoutId: payout.id,
        amount: validatedData.amount,
        currency: validatedData.currency,
        status: 'pending',
        arrivalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Estimate 2 days
      };
      
    } catch (error) {
      console.error('Error processing payout:', error);
      throw new Error(`Failed to process payout: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get payout history for driver
   */
  async getPayoutHistory(driverId: string, limit: number = 20, offset: number = 0) {
    try {
      const payouts = await prisma.driverPayout.findMany({
        where: { driverId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          driver: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
      
      const total = await prisma.driverPayout.count({
        where: { driverId },
      });
      
      return {
        payouts,
        total,
        hasMore: offset + limit < total,
      };
      
    } catch (error) {
      console.error('Error getting payout history:', error);
      throw new Error(`Failed to get payout history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Handle Stripe webhook for payout updates
   */
  async handlePayoutWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'transfer.created':
        case 'transfer.updated': {
          const transfer = event.data.object as Stripe.Transfer;
          
          await prisma.driverPayout.updateMany({
            where: { stripeTransferId: transfer.id },
            data: {
              status: 'pending',
              updatedAt: new Date(),
            },
          });
          break;
        }
        
        case 'account.updated': {
          const account = event.data.object as Stripe.Account;
          
          // Update driver account status
          await prisma.user.updateMany({
            where: { stripeAccountId: account.id },
            data: {
              payoutsEnabled: account.payouts_enabled,
              payoutAccountStatus: account.charges_enabled && account.payouts_enabled ? 'active' : 'pending',
            },
          });
          break;
        }
      }
      
    } catch (error) {
      console.error('Error handling payout webhook:', error);
      throw error;
    }
  }
  
  /**
   * Map Stripe transfer status to our payout status
   */
  private mapStripeTransferStatus(stripeStatus: string): string {
    switch (stripeStatus) {
      case 'pending':
        return 'pending';
      case 'in_transit':
        return 'in_transit';
      case 'paid':
        return 'paid';
      case 'failed':
        return 'failed';
      case 'canceled':
        return 'canceled';
      default:
        return 'pending';
    }
  }
  
  /**
   * Generate dashboard metrics for admin
   */
  async getPayoutMetrics(startDate: Date, endDate: Date) {
    try {
      const metrics = await prisma.driverPayout.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      });
      
      const totalPayouts = await prisma.driverPayout.aggregate({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
      });
      
      return {
        byStatus: metrics,
        total: totalPayouts,
        period: {
          start: startDate,
          end: endDate,
        },
      };
      
    } catch (error) {
      console.error('Error getting payout metrics:', error);
      throw new Error(`Failed to get payout metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new DriverPayoutService();
