import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import Stripe from 'stripe';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
});

// Validation schemas
const createPaymentIntentSchema = z.object({
  bookingId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default('ZAR'),
  paymentMethod: z.enum(['CARD', 'YOCO', 'APPLE_PAY', 'GOOGLE_PAY']),
});

const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1),
  paymentMethodId: z.string().min(1),
});

// Create payment intent
router.post('/create-intent', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const validatedData = createPaymentIntentSchema.parse(req.body);

    // Verify booking belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.bookingId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to pay for this booking' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ error: 'Booking is not in pending status' });
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findFirst({
      where: {
        bookingId: validatedData.bookingId,
        status: {
          in: ['PENDING', 'PROCESSING', 'COMPLETED']
        }
      }
    });

    if (existingPayment) {
      return res.status(400).json({ error: 'Payment already exists for this booking' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(validatedData.amount * 100), // Convert to cents
      currency: validatedData.currency.toLowerCase(),
      metadata: {
        bookingId: validatedData.bookingId,
        userId: userId,
        userEmail: booking.user.email,
        userName: `${booking.user.firstName} ${booking.user.lastName}`,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId: validatedData.bookingId,
        userId: userId,
        amount: validatedData.amount,
        currency: validatedData.currency,
        method: validatedData.paymentMethod,
        status: 'PENDING',
        transactionId: paymentIntent.id,
      }
    });

    return res.json({
      payment,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input data', details: error.errors });
    }
    console.error('Create payment intent error:', error);
    return res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Confirm payment
router.post('/confirm', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { paymentIntentId } = req.body;

    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return res.status(404).json({ error: 'Payment intent not found' });
    }

    // Update payment status based on Stripe status
    const payment = await prisma.payment.findFirst({
      where: {
        transactionId: paymentIntentId,
        userId: userId,
      },
      include: {
        booking: true
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    let newStatus = 'PENDING';
    let completedAt = null;

    switch (paymentIntent.status) {
      case 'succeeded':
        newStatus = 'COMPLETED';
        completedAt = new Date();
        break;
      case 'processing':
        newStatus = 'PROCESSING';
        break;
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        newStatus = 'PENDING';
        break;
      case 'canceled':
        newStatus = 'FAILED';
        break;
      default:
        newStatus = 'PENDING';
    }

    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus as any,
        completedAt,
      }
    });

    // If payment succeeded, update booking status
    if (newStatus === 'COMPLETED') {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' }
      });
    }

    return res.json({
      payment: updatedPayment,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    return res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            },
            vehicle: {
              select: {
                name: true,
                type: true
              }
            }
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to view this payment' });
    }

    return res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    return res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Get user's payments
router.get('/user/payments', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { status, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    let whereClause: any = { userId };

    if (status) {
      whereClause.status = status;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        include: {
          booking: {
            include: {
              vehicle: {
                select: {
                  name: true,
                  type: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take,
      }),
      prisma.payment.count({
        where: whereClause
      })
    ]);

    return res.json({
      payments,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    return res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Refund payment
router.post('/:id/refund', async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { reason, amount } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: true
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to refund this payment' });
    }

    if (payment.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Only completed payments can be refunded' });
    }

    // Check if booking can be refunded (not in progress or completed)
    if (['IN_PROGRESS', 'COMPLETED'].includes(payment.booking.status)) {
      return res.status(400).json({ error: 'Cannot refund payment for booking in progress or completed' });
    }

    const refundAmount = amount || payment.amount;

    if (refundAmount > payment.amount) {
      return res.status(400).json({ error: 'Refund amount cannot exceed payment amount' });
    }

    try {
      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        payment_intent: payment.transactionId!,
        amount: Math.round(refundAmount * 100), // Convert to cents
        reason: 'requested_by_customer',
        metadata: {
          bookingId: payment.bookingId,
          userId: userId,
          refundReason: reason || 'Customer requested refund',
        },
      });

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id },
        data: {
          status: 'REFUNDED',
        }
      });

      // Update booking status to cancelled
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CANCELLED' }
      });

      return res.json({
        message: 'Refund processed successfully',
        payment: updatedPayment,
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          currency: refund.currency,
          status: refund.status,
        }
      });
    } catch (stripeError) {
      console.error('Stripe refund error:', stripeError);
      return res.status(400).json({ error: 'Failed to process refund with payment provider' });
    }
  } catch (error) {
    console.error('Refund payment error:', error);
    return res.status(500).json({ error: 'Failed to process refund' });
  }
});

// Webhook endpoint for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    return res.status(400).send('Missing signature or webhook secret');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update payment status
        await prisma.payment.updateMany({
          where: {
            transactionId: paymentIntent.id,
            status: {
              in: ['PENDING', 'PROCESSING']
            }
          },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          }
        });

        // Update booking status
        const bookingId = paymentIntent.metadata?.bookingId;
        if (bookingId) {
          await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'CONFIRMED' }
          });
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        
        await prisma.payment.updateMany({
          where: {
            transactionId: failedPayment.id,
          },
          data: {
            status: 'FAILED',
          }
        });
        break;

      case 'charge.dispute.created':
        // Handle dispute/chargeback
        const dispute = event.data.object as Stripe.Dispute;
        console.log('Dispute created:', dispute.id);
        // Add custom logic here
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).send('Webhook processing failed');
  }
});

// Get payment statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const userId = (req as any).userId;

    const [
      totalPayments,
      completedPayments,
      totalAmount,
      pendingPayments,
      failedPayments
    ] = await Promise.all([
      prisma.payment.count({
        where: { userId }
      }),
      prisma.payment.count({
        where: { userId, status: 'COMPLETED' }
      }),
      prisma.payment.aggregate({
        where: { userId, status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.payment.count({
        where: { userId, status: 'PENDING' }
      }),
      prisma.payment.count({
        where: { userId, status: 'FAILED' }
      })
    ]);

    return res.json({
      stats: {
        totalPayments,
        completedPayments,
        totalAmount: totalAmount._sum.amount || 0,
        pendingPayments,
        failedPayments,
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch payment statistics' });
  }
});

// Get Stripe publishable key (for frontend)
router.get('/config/stripe', async (req, res) => {
  try {
    return res.json({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    });
  } catch (error) {
    console.error('Get Stripe config error:', error);
    return res.status(500).json({ error: 'Failed to fetch payment configuration' });
  }
});

export default router;
