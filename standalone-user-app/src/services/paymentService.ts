import { Stripe } from '@stripe/stripe-react-native';
import RELOConnectAPI from './enhancedAPI';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay';
  card?: {
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  };
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret: string;
  bookingId: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
  booking?: any;
}

export class RELOPaymentService {
  private static stripe: Stripe | null = null;
  private static isInitialized = false;

  // Initialize Stripe
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.stripe = new Stripe();
      await this.stripe.initPaymentSheet({
        merchantDisplayName: 'RELOConnect',
        allowsDelayedPaymentMethods: true,
      });
      this.isInitialized = true;
      console.log('✅ Stripe initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Stripe:', error);
      throw error;
    }
  }

  // Payment Methods Management
  static async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      // In a real implementation, this would fetch from your backend
      // which communicates with Stripe
      const response = await RELOConnectAPI.get(`/payments/payment-methods/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      return [];
    }
  }

  static async addPaymentMethod(): Promise<PaymentMethod | null> {
    if (!this.stripe || !this.isInitialized) {
      await this.initialize();
    }

    try {
      const { paymentMethod, error } = await this.stripe!.createPaymentMethod({
        paymentMethodType: 'Card',
      });

      if (error) {
        throw new Error(error.message);
      }

      // Save to backend
      const response = await RELOConnectAPI.post('/payments/payment-methods', {
        paymentMethodId: paymentMethod.id,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to add payment method:', error);
      return null;
    }
  }

  static async removePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      await RELOConnectAPI.delete(`/payments/payment-methods/${paymentMethodId}`);
      return true;
    } catch (error) {
      console.error('Failed to remove payment method:', error);
      return false;
    }
  }

  static async setDefaultPaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      await RELOConnectAPI.patch(`/payments/payment-methods/${paymentMethodId}/default`);
      return true;
    } catch (error) {
      console.error('Failed to set default payment method:', error);
      return false;
    }
  }

  // Booking Payments
  static async createPaymentIntent(bookingId: string): Promise<PaymentIntent> {
    try {
      const response = await RELOConnectAPI.createPaymentIntent(bookingId);
      return {
        id: response.paymentIntentId,
        amount: response.amount,
        currency: response.currency,
        status: 'requires_payment_method',
        clientSecret: response.clientSecret,
        bookingId,
      };
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw error;
    }
  }

  static async processPayment(
    paymentIntent: PaymentIntent,
    paymentMethodId?: string
  ): Promise<PaymentResult> {
    if (!this.stripe || !this.isInitialized) {
      await this.initialize();
    }

    try {
      // Initialize payment sheet
      const { error: initError } = await this.stripe!.initPaymentSheet({
        merchantDisplayName: 'RELOConnect',
        paymentIntentClientSecret: paymentIntent.clientSecret,
        defaultBillingDetails: {
          name: 'Customer', // This would come from user profile
        },
        allowsDelayedPaymentMethods: true,
        returnURL: 'reloconnect://payment-return',
      });

      if (initError) {
        return {
          success: false,
          error: initError.message,
        };
      }

      // Present payment sheet
      const { error: presentError } = await this.stripe!.presentPaymentSheet();

      if (presentError) {
        return {
          success: false,
          error: presentError.message,
        };
      }

      // Confirm payment on backend
      const result = await RELOConnectAPI.confirmPayment(paymentIntent.id);

      if (result.status === 'succeeded') {
        return {
          success: true,
          paymentIntent: {
            ...paymentIntent,
            status: 'succeeded',
          },
          booking: result.booking,
        };
      } else {
        return {
          success: false,
          error: 'Payment processing failed',
        };
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown payment error',
      };
    }
  }

  // Quick payment for regular customers
  static async quickPay(
    bookingId: string,
    paymentMethodId?: string
  ): Promise<PaymentResult> {
    try {
      // Create payment intent
      const paymentIntent = await this.createPaymentIntent(bookingId);

      // Process payment
      return await this.processPayment(paymentIntent, paymentMethodId);
    } catch (error) {
      console.error('Quick payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Quick payment failed',
      };
    }
  }

  // Apple Pay integration
  static async isApplePaySupported(): Promise<boolean> {
    if (!this.stripe || !this.isInitialized) {
      await this.initialize();
    }

    try {
      return await this.stripe!.isApplePaySupported();
    } catch (error) {
      console.error('Failed to check Apple Pay support:', error);
      return false;
    }
  }

  static async processApplePay(
    bookingId: string,
    amount: number,
    currency: string = 'ZAR'
  ): Promise<PaymentResult> {
    if (!this.stripe || !this.isInitialized) {
      await this.initialize();
    }

    try {
      const { error } = await this.stripe!.confirmApplePayPayment(paymentIntent.clientSecret);

      if (error) {
        return {
          success: false,
          error: error.message,
        };
      }

      // Confirm on backend
      const result = await RELOConnectAPI.confirmPayment(paymentIntent.id);

      return {
        success: result.status === 'succeeded',
        booking: result.booking,
      };
    } catch (error) {
      console.error('Apple Pay error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Apple Pay failed',
      };
    }
  }

  // Google Pay integration
  static async isGooglePaySupported(): Promise<boolean> {
    if (!this.stripe || !this.isInitialized) {
      await this.initialize();
    }

    try {
      return await this.stripe!.isGooglePaySupported();
    } catch (error) {
      console.error('Failed to check Google Pay support:', error);
      return false;
    }
  }

  // Payment validation
  static validatePaymentAmount(amount: number, currency: string = 'ZAR'): boolean {
    if (currency === 'ZAR') {
      return amount >= 50 && amount <= 100000; // R50 to R100,000
    }
    return amount > 0;
  }

  // Error handling
  static getPaymentErrorMessage(error: any): string {
    if (!error) return 'Unknown payment error';

    // Stripe-specific errors
    if (error.type) {
      switch (error.type) {
        case 'card_error':
          return error.message || 'Your card was declined';
        case 'validation_error':
          return 'Invalid payment information';
        case 'api_error':
          return 'Payment service temporarily unavailable';
        default:
          return error.message || 'Payment processing failed';
      }
    }

    return error.message || 'Payment processing failed';
  }

  // Refunds (Admin/Support function)
  static async requestRefund(
    bookingId: string,
    amount?: number,
    reason?: string
  ): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      const response = await RELOConnectAPI.post('/payments/refunds', {
        bookingId,
        amount,
        reason,
      });

      return {
        success: true,
        refundId: response.data.refundId,
      };
    } catch (error) {
      console.error('Refund request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund request failed',
      };
    }
  }

  // Payment history
  static async getPaymentHistory(userId: string): Promise<any[]> {
    try {
      const response = await RELOConnectAPI.get(`/payments/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      return [];
    }
  }
}

// React Hook for payment management
import { useState, useEffect } from 'react';

export function usePaymentMethods(customerId: string) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, [customerId]);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await RELOPaymentService.getPaymentMethods(customerId);
      setPaymentMethods(methods);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async () => {
    try {
      const newMethod = await RELOPaymentService.addPaymentMethod();
      if (newMethod) {
        setPaymentMethods(prev => [...prev, newMethod]);
      }
      return newMethod;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add payment method');
      return null;
    }
  };

  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      const success = await RELOPaymentService.removePaymentMethod(paymentMethodId);
      if (success) {
        setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove payment method');
      return false;
    }
  };

  return {
    paymentMethods,
    loading,
    error,
    addPaymentMethod,
    removePaymentMethod,
    refresh: loadPaymentMethods,
  };
}

// Enhanced Payment Service with Stripe and Yoco integration
export class EnhancedPaymentService {
  // Create Yoco payment intent (South African local payments)
  static async createYocoPaymentIntent(
    bookingId: string,
    amount: number
  ): Promise<PaymentIntent> {
    try {
      const response = await RELOConnectAPI.post('/payments/yoco/create-intent', {
        bookingId,
        amount,
      });

      if (response.data.success) {
        return response.data.paymentIntent;
      } else {
        throw new Error(response.data.error || 'Failed to create Yoco payment intent');
      }
    } catch (error: any) {
      console.error('Yoco payment intent creation failed:', error);
      throw new Error(error.response?.data?.details || 'Failed to create Yoco payment intent');
    }
  }

  // Calculate commission for booking
  static async calculateCommission(
    bookingId: string,
    vehicleType: string,
    totalAmount: number
  ): Promise<{ commission: number; driverPayout: number; platformFee: number }> {
    try {
      const response = await RELOConnectAPI.post('/payments/calculate-commission', {
        bookingId,
        vehicleType,
        totalAmount,
      });

      if (response.data.success) {
        return response.data.commission;
      } else {
        throw new Error(response.data.error || 'Failed to calculate commission');
      }
    } catch (error: any) {
      console.error('Commission calculation failed:', error);
      throw new Error(error.response?.data?.details || 'Failed to calculate commission');
    }
  }

  // Generate invoice for booking
  static async generateInvoice(bookingId: string): Promise<any> {
    try {
      const response = await RELOConnectAPI.get(`/payments/invoice/${bookingId}`);

      if (response.data.success) {
        return response.data.invoice;
      } else {
        throw new Error(response.data.error || 'Failed to generate invoice');
      }
    } catch (error: any) {
      console.error('Invoice generation failed:', error);
      throw new Error(error.response?.data?.details || 'Failed to generate invoice');
    }
  }

  // Process refund
  static async processRefund(
    paymentIntentId: string,
    amount?: number,
    reason: string = 'requested_by_customer'
  ): Promise<any> {
    try {
      const response = await RELOConnectAPI.post('/payments/enhanced-refund', {
        paymentIntentId,
        amount,
        reason,
      });

      if (response.data.success) {
        return response.data.refund;
      } else {
        throw new Error(response.data.error || 'Failed to process refund');
      }
    } catch (error: any) {
      console.error('Refund processing failed:', error);
      throw new Error(error.response?.data?.details || 'Failed to process refund');
    }
  }

  // Get payment status for booking
  static async getPaymentStatus(bookingId: string): Promise<any> {
    try {
      const response = await RELOConnectAPI.get(`/payments/status/${bookingId}`);

      if (response.data.success) {
        return response.data.payment;
      } else {
        throw new Error(response.data.error || 'Failed to get payment status');
      }
    } catch (error: any) {
      console.error('Get payment status failed:', error);
      throw new Error(error.response?.data?.details || 'Failed to get payment status');
    }
  }

  // Format currency for South African context
  static formatCurrency(amount: number, currency: string = 'ZAR'): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  // Get commission rates by vehicle type
  static getCommissionRates(): Record<string, number> {
    return {
      'BIKE': 0.15,
      'CAR': 0.18,
      'BAKKIE': 0.20,
      'SMALL_TRUCK': 0.22,
      'LARGE_TRUCK': 0.25,
      'CRANE_TRUCK': 0.25,
    };
  }

  // Calculate estimated commission locally (for quick estimates)
  static calculateEstimatedCommission(
    vehicleType: string,
    totalAmount: number
  ): { commission: number; driverPayout: number; platformFee: number } {
    const rates = this.getCommissionRates();
    const commissionRate = rates[vehicleType] || 0.20;
    const commission = totalAmount * commissionRate;
    const driverPayout = totalAmount - commission;
    const platformFee = commission * 0.1;

    return {
      commission,
      driverPayout,
      platformFee,
    };
  }

  // Get local payment methods for South Africa
  static getSouthAfricanPaymentMethods(): Array<{
    id: string;
    name: string;
    description: string;
    supported: boolean;
    icon: string;
  }> {
    return [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, Amex',
        supported: true,
        icon: '💳',
      },
      {
        id: 'instant_eft',
        name: 'Instant EFT',
        description: 'Direct bank transfer',
        supported: true,
        icon: '🏦',
      },
      {
        id: 'yoco_wallet',
        name: 'Yoco Wallet',
        description: 'South African digital wallet',
        supported: true,
        icon: '💰',
      },
      {
        id: 'apple_pay',
        name: 'Apple Pay',
        description: 'Quick and secure payments',
        supported: true,
        icon: '🍎',
      },
      {
        id: 'google_pay',
        name: 'Google Pay',
        description: 'Tap to pay',
        supported: true,
        icon: '🔍',
      },
    ];
  }
}

export default RELOPaymentService;
