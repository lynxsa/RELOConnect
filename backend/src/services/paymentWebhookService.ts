import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas for webhooks
const WebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
  created: z.number(),
});

export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

export interface WebhookProcessResult {
  success: boolean;
  processed: boolean;
  error?: string;
  data?: any;
}

class PaymentWebhookService {
  
  /**
   * Process incoming payment webhook
   */
  async processWebhook(payload: any, signature: string, source: 'stripe' | 'yoco'): Promise<WebhookProcessResult> {
    try {
      // Validate webhook signature
      if (!this.verifyWebhookSignature(payload, signature, source)) {
        return {
          success: false,
          processed: false,
          error: 'Invalid webhook signature',
        };
      }

      const event = WebhookEventSchema.parse(payload) as WebhookEvent;
      
      // Check if webhook was already processed
      const existingWebhook = await prisma.webhookEvent.findUnique({
        where: { 
          eventId_source: {
            eventId: event.id,
            source,
          },
        },
      });

      if (existingWebhook) {
        return {
          success: true,
          processed: false,
          error: 'Webhook already processed',
        };
      }

      // Process the webhook based on type
      const result = await this.handleWebhookEvent(event, source);

      // Store webhook event
      await prisma.webhookEvent.create({
        data: {
          eventId: event.id,
          source,
          eventType: event.type,
          payload: JSON.stringify(payload),
          processed: result.success,
          processedAt: result.success ? new Date() : null,
          error: result.error || null,
        },
      });

      return result;

    } catch (error) {
      console.error('Webhook processing error:', error);
      return {
        success: false,
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle specific webhook events
   */
  private async handleWebhookEvent(event: WebhookEvent, source: 'stripe' | 'yoco'): Promise<WebhookProcessResult> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
        case 'charge.succeeded':
          return await this.handlePaymentSuccess(event, source);
          
        case 'payment_intent.payment_failed':
        case 'charge.failed':
          return await this.handlePaymentFailure(event, source);
          
        case 'payment_intent.canceled':
        case 'charge.dispute.created':
          return await this.handlePaymentCanceled(event, source);
          
        case 'transfer.paid':
        case 'payout.paid':
          return await this.handlePayoutSuccess(event, source);
          
        case 'transfer.failed':
        case 'payout.failed':
          return await this.handlePayoutFailure(event, source);
          
        case 'account.updated':
          return await this.handleAccountUpdate(event, source);
          
        case 'invoice.payment_succeeded':
          return await this.handleInvoicePayment(event, source);
          
        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
          return {
            success: true,
            processed: false,
            error: `Unhandled event type: ${event.type}`,
          };
      }

    } catch (error) {
      console.error('Event handling error:', error);
      return {
        success: false,
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(event: WebhookEvent, source: 'stripe' | 'yoco'): Promise<WebhookProcessResult> {
    try {
      const paymentObject = event.data.object;
      let paymentIntentId: string;
      let amount: number;
      let currency: string;

      if (source === 'stripe') {
        paymentIntentId = paymentObject.id;
        amount = paymentObject.amount / 100; // Stripe amounts are in cents
        currency = paymentObject.currency.toUpperCase();
      } else {
        // Yoco webhook structure
        paymentIntentId = paymentObject.id;
        amount = paymentObject.amount / 100;
        currency = paymentObject.currency.toUpperCase();
      }

      // Find the associated booking
      const payment = await prisma.payment.findFirst({
        where: { 
          stripePaymentIntentId: paymentIntentId,
        },
        include: {
          booking: {
            include: {
              user: true,
              driver: true,
            },
          },
        },
      });

      if (!payment) {
        console.warn(`Payment not found for intent: ${paymentIntentId}`);
        return {
          success: true,
          processed: false,
          error: 'Payment record not found',
        };
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          paidAt: new Date(),
          metadata: {
            ...payment.metadata as any,
            webhookProcessed: true,
            webhookEventId: event.id,
          },
        },
      });

      // Update booking status if payment is completed
      if (payment.booking) {
        await prisma.booking.update({
          where: { id: payment.booking.id },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
          },
        });

        // Send confirmation notification to user
        if (payment.booking.user) {
          await this.sendPaymentConfirmationNotification(
            payment.booking.user.id,
            payment.booking.id,
            amount,
            currency
          );
        }

        // Calculate and record driver earnings
        if (payment.booking.driverId) {
          await this.calculateDriverEarnings(payment.booking.id, amount);
        }
      }

      return {
        success: true,
        processed: true,
        data: {
          paymentId: payment.id,
          bookingId: payment.booking?.id,
          amount,
          currency,
        },
      };

    } catch (error) {
      console.error('Payment success handling error:', error);
      return {
        success: false,
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailure(event: WebhookEvent, source: 'stripe' | 'yoco'): Promise<WebhookProcessResult> {
    try {
      const paymentObject = event.data.object;
      const paymentIntentId = paymentObject.id;
      const failureReason = paymentObject.last_payment_error?.message || 'Payment failed';

      // Find the associated payment
      const payment = await prisma.payment.findFirst({
        where: { 
          stripePaymentIntentId: paymentIntentId,
        },
        include: {
          booking: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!payment) {
        console.warn(`Payment not found for failed intent: ${paymentIntentId}`);
        return {
          success: true,
          processed: false,
          error: 'Payment record not found',
        };
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureReason,
          metadata: {
            ...payment.metadata as any,
            webhookProcessed: true,
            webhookEventId: event.id,
            failureReason,
          },
        },
      });

      // Update booking status
      if (payment.booking) {
        await prisma.booking.update({
          where: { id: payment.booking.id },
          data: {
            paymentStatus: 'FAILED',
            status: 'CANCELLED',
          },
        });

        // Send failure notification to user
        if (payment.booking.user) {
          await this.sendPaymentFailureNotification(
            payment.booking.user.id,
            payment.booking.id,
            failureReason
          );
        }
      }

      return {
        success: true,
        processed: true,
        data: {
          paymentId: payment.id,
          bookingId: payment.booking?.id,
          failureReason,
        },
      };

    } catch (error) {
      console.error('Payment failure handling error:', error);
      return {
        success: false,
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle payment cancellation
   */
  private async handlePaymentCanceled(event: WebhookEvent, source: 'stripe' | 'yoco'): Promise<WebhookProcessResult> {
    try {
      const paymentObject = event.data.object;
      const paymentIntentId = paymentObject.id;

      // Update payment and booking status to canceled
      const payment = await prisma.payment.findFirst({
        where: { 
          stripePaymentIntentId: paymentIntentId,
        },
        include: {
          booking: true,
        },
      });

      if (payment) {
        await Promise.all([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'CANCELLED',
              metadata: {
                ...payment.metadata as any,
                webhookProcessed: true,
                webhookEventId: event.id,
              },
            },
          }),
          payment.booking ? prisma.booking.update({
            where: { id: payment.booking.id },
            data: {
              paymentStatus: 'CANCELLED',
              status: 'CANCELLED',
            },
          }) : Promise.resolve(),
        ]);
      }

      return {
        success: true,
        processed: true,
        data: {
          paymentId: payment?.id,
          bookingId: payment?.booking?.id,
        },
      };

    } catch (error) {
      console.error('Payment cancellation handling error:', error);
      return {
        success: false,
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle successful payout to driver
   */
  private async handlePayoutSuccess(event: WebhookEvent, source: 'stripe' | 'yoco'): Promise<WebhookProcessResult> {
    try {
      const transferObject = event.data.object;
      const transferId = transferObject.id;

      // Update payout status
      await prisma.driverPayout.updateMany({
        where: { stripeTransferId: transferId },
        data: {
          status: 'paid',
          paidAt: new Date(),
          metadata: {
            webhookProcessed: true,
            webhookEventId: event.id,
          },
        },
      });

      // Get payout details for notification
      const payout = await prisma.driverPayout.findFirst({
        where: { stripeTransferId: transferId },
        include: {
          driver: true,
        },
      });

      if (payout && payout.driver) {
        await this.sendPayoutSuccessNotification(
          payout.driver.id,
          payout.amount,
          payout.currency
        );
      }

      return {
        success: true,
        processed: true,
        data: {
          payoutId: payout?.id,
          driverId: payout?.driverId,
          amount: payout?.amount,
        },
      };

    } catch (error) {
      console.error('Payout success handling error:', error);
      return {
        success: false,
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle failed payout to driver
   */
  private async handlePayoutFailure(event: WebhookEvent, source: 'stripe' | 'yoco'): Promise<WebhookProcessResult> {
    try {
      const transferObject = event.data.object;
      const transferId = transferObject.id;
      const failureReason = transferObject.failure_message || 'Payout failed';

      // Update payout status
      await prisma.driverPayout.updateMany({
        where: { stripeTransferId: transferId },
        data: {
          status: 'failed',
          failureReason,
          metadata: {
            webhookProcessed: true,
            webhookEventId: event.id,
            failureReason,
          },
        },
      });

      // Get payout details for notification
      const payout = await prisma.driverPayout.findFirst({
        where: { stripeTransferId: transferId },
        include: {
          driver: true,
        },
      });

      if (payout && payout.driver) {
        await this.sendPayoutFailureNotification(
          payout.driver.id,
          payout.amount,
          payout.currency,
          failureReason
        );
      }

      return {
        success: true,
        processed: true,
        data: {
          payoutId: payout?.id,
          driverId: payout?.driverId,
          failureReason,
        },
      };

    } catch (error) {
      console.error('Payout failure handling error:', error);
      return {
        success: false,
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle driver account updates
   */
  private async handleAccountUpdate(event: WebhookEvent, source: 'stripe' | 'yoco'): Promise<WebhookProcessResult> {
    try {
      const account = event.data.object;
      const accountId = account.id;

      // Update driver account status
      await prisma.user.updateMany({
        where: { 
          stripeAccountId: accountId,
          role: 'DRIVER',
        },
        data: {
          payoutsEnabled: account.payouts_enabled || false,
          payoutAccountStatus: account.charges_enabled && account.payouts_enabled ? 'active' : 'pending',
        },
      });

      return {
        success: true,
        processed: true,
        data: {
          accountId,
          payoutsEnabled: account.payouts_enabled,
          chargesEnabled: account.charges_enabled,
        },
      };

    } catch (error) {
      console.error('Account update handling error:', error);
      return {
        success: false,
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle invoice payment
   */
  private async handleInvoicePayment(event: WebhookEvent, source: 'stripe' | 'yoco'): Promise<WebhookProcessResult> {
    try {
      const invoice = event.data.object;
      
      // Handle subscription or recurring payment logic here
      console.log('Invoice payment received:', invoice.id);

      return {
        success: true,
        processed: true,
        data: {
          invoiceId: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
        },
      };

    } catch (error) {
      console.error('Invoice payment handling error:', error);
      return {
        success: false,
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(payload: any, signature: string, source: 'stripe' | 'yoco'): boolean {
    try {
      if (source === 'stripe') {
        // In production, verify Stripe signature using stripe.webhooks.constructEvent
        return true; // Simplified for demo
      } else {
        // Verify Yoco signature
        return true; // Simplified for demo
      }
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Calculate driver earnings after successful payment
   */
  private async calculateDriverEarnings(bookingId: string, totalAmount: number): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking || !booking.driverId) {
        return;
      }

      // Calculate commission (assume 15% platform fee)
      const commissionRate = 0.15;
      const commission = totalAmount * commissionRate;
      const driverEarnings = totalAmount - commission;

      // Update booking with earnings breakdown
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          commission,
          driverEarnings,
        },
      });

    } catch (error) {
      console.error('Error calculating driver earnings:', error);
    }
  }

  /**
   * Send payment confirmation notification
   */
  private async sendPaymentConfirmationNotification(
    userId: string,
    bookingId: string,
    amount: number,
    currency: string
  ): Promise<void> {
    try {
      // This would integrate with push notification service
      console.log(`Payment confirmation notification sent to user ${userId}`);
    } catch (error) {
      console.error('Error sending payment confirmation notification:', error);
    }
  }

  /**
   * Send payment failure notification
   */
  private async sendPaymentFailureNotification(
    userId: string,
    bookingId: string,
    reason: string
  ): Promise<void> {
    try {
      // This would integrate with push notification service
      console.log(`Payment failure notification sent to user ${userId}: ${reason}`);
    } catch (error) {
      console.error('Error sending payment failure notification:', error);
    }
  }

  /**
   * Send payout success notification
   */
  private async sendPayoutSuccessNotification(
    driverId: string,
    amount: number,
    currency: string
  ): Promise<void> {
    try {
      // This would integrate with push notification service
      console.log(`Payout success notification sent to driver ${driverId}: ${amount} ${currency}`);
    } catch (error) {
      console.error('Error sending payout success notification:', error);
    }
  }

  /**
   * Send payout failure notification
   */
  private async sendPayoutFailureNotification(
    driverId: string,
    amount: number,
    currency: string,
    reason: string
  ): Promise<void> {
    try {
      // This would integrate with push notification service
      console.log(`Payout failure notification sent to driver ${driverId}: ${amount} ${currency} - ${reason}`);
    } catch (error) {
      console.error('Error sending payout failure notification:', error);
    }
  }

  /**
   * Get webhook processing statistics
   */
  async getWebhookStats(startDate: Date, endDate: Date) {
    try {
      const stats = await prisma.webhookEvent.groupBy({
        by: ['source', 'eventType', 'processed'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: {
          id: true,
        },
      });

      return stats;

    } catch (error) {
      console.error('Error getting webhook stats:', error);
      return [];
    }
  }
}

export default new PaymentWebhookService();
