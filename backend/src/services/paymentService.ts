import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
});

// Yoco configuration (South African payments)
const YOCO_API_URL = 'https://online.yoco.com/v1';
const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface PayoutDetails {
  id: string;
  amount: number;
  currency: string;
  destination: string;
  status: string;
  arrivalDate?: Date;
}

export class PaymentService {
  // Stripe Payment Processing
  async createStripePaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: any = {}
  ): Promise<PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret || undefined,
      };
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Yoco Payment Processing (South African)
  async createYocoPaymentIntent(
    amount: number,
    currency: string = 'ZAR',
    metadata: any = {}
  ): Promise<PaymentIntent> {
    try {
      const response = await fetch(`${YOCO_API_URL}/charges`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error((data as any).message || 'Yoco payment failed');
      }

      return {
        id: (data as any).id,
        amount: (data as any).amount / 100,
        currency: (data as any).currency,
        status: (data as any).status,
      };
    } catch (error) {
      console.error('Yoco payment intent creation failed:', error);
      throw new Error('Failed to create Yoco payment intent');
    }
  }

  // Commission Calculation Engine
  async calculateCommission(
    bookingId: string,
    vehicleType: string,
    totalAmount: number
  ): Promise<{ commission: number; driverPayout: number; platformFee: number }> {
    // Commission rates by vehicle type (15-25%)
    const commissionRates: Record<string, number> = {
      'BIKE': 0.15,
      'CAR': 0.18,
      'BAKKIE': 0.20,
      'SMALL_TRUCK': 0.22,
      'LARGE_TRUCK': 0.25,
      'CRANE_TRUCK': 0.25,
    };

    const commissionRate = commissionRates[vehicleType] || 0.20;
    const commission = totalAmount * commissionRate;
    const driverPayout = totalAmount - commission;
    const platformFee = commission * 0.1; // 10% platform fee

    // Store commission record - commenting out until schema is fixed
    /*
    await prisma.commission.create({
      data: {
        bookingId,
        totalAmount,
        commissionRate,
        commissionAmount: commission,
        driverPayout,
        platformFee,
        status: 'PENDING',
      },
    });
    */

    return {
      commission,
      driverPayout,
      platformFee,
    };
  }

  // Simple payment method management
  async savePaymentMethod(
    userId: string,
    paymentMethodId: string,
    isDefault: boolean = false
  ): Promise<void> {
    try {
      // Get payment method details from Stripe
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

      // For now, store basic info until schema is fixed
      console.log(`Saving payment method ${paymentMethodId} for user ${userId}`);
    } catch (error) {
      console.error('Failed to save payment method:', error);
      throw new Error('Failed to save payment method');
    }
  }

  // Invoice Generation with SA Tax Compliance
  async generateInvoice(bookingId: string): Promise<any> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
        },
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      const vatRate = 0.15; // 15% VAT for South Africa
      const subtotal = booking.totalPrice;
      const vatAmount = subtotal * vatRate;
      const totalWithVat = subtotal + vatAmount;

      const invoice = {
        invoiceNumber: `REL-${bookingId.slice(-8).toUpperCase()}`,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        customer: {
          name: `${booking.user.firstName} ${booking.user.lastName}`,
          email: booking.user.email,
          phone: booking.user.phone,
        },
        services: [
          {
            description: `Relocation Service - ${booking.serviceType}`,
            quantity: 1,
            unitPrice: subtotal,
            total: subtotal,
          },
        ],
        subtotal,
        vatRate,
        vatAmount,
        total: totalWithVat,
        companyDetails: {
          name: 'RELOConnect (Pty) Ltd',
          vatNumber: 'VAT-REG-123456789',
          address: 'Cape Town, South Africa',
          email: 'billing@reloconnect.co.za',
        },
      };

      return invoice;
    } catch (error) {
      console.error('Invoice generation failed:', error);
      throw new Error('Failed to generate invoice');
    }
  }

  // Refund Processing
  async processRefund(
    paymentIntentId: string,
    amount?: number,
    reason: string = 'requested_by_customer'
  ): Promise<any> {
    try {
      // Attempt Stripe refund first
      try {
        const refund = await stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount: amount ? Math.round(amount * 100) : undefined,
          reason: reason as any,
        });

        return {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          reason: refund.reason,
        };
      } catch (stripeError) {
        console.log('Stripe refund failed, trying Yoco...');
        
        // Fallback to Yoco refund
        const response = await fetch(`${YOCO_API_URL}/refunds`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            charge_id: paymentIntentId,
            amount: amount ? Math.round(amount * 100) : undefined,
            reason,
          }),
        });

        const refund = await response.json();
        return {
          id: (refund as any).id,
          amount: (refund as any).amount / 100,
          status: (refund as any).status,
          reason,
        };
      }
    } catch (error) {
      console.error('Refund processing failed:', error);
      throw new Error('Failed to process refund');
    }
  }
}

export const paymentService = new PaymentService();
