// Mock Stripe functionality for development

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'succeeded' | 'failed' | 'pending'
  createdAt: Date
}

export interface PaymentResult {
  success: boolean
  paymentIntent?: PaymentIntent
  error?: string
}

class MockStripe {
  private payments: Map<string, PaymentIntent> = new Map()

  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentIntent> {
    const paymentIntent: PaymentIntent = {
      id: `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      status: 'pending',
      createdAt: new Date()
    }

    this.payments.set(paymentIntent.id, paymentIntent)
    return paymentIntent
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    const paymentIntent = this.payments.get(paymentIntentId)
    
    if (!paymentIntent) {
      return {
        success: false,
        error: 'Payment intent not found'
      }
    }

    // Simulate payment success/failure (90% success rate)
    const success = Math.random() > 0.1

    if (success) {
      paymentIntent.status = 'succeeded'
      this.payments.set(paymentIntentId, paymentIntent)
      
      return {
        success: true,
        paymentIntent
      }
    } else {
      paymentIntent.status = 'failed'
      this.payments.set(paymentIntentId, paymentIntent)
      
      return {
        success: false,
        error: 'Payment failed'
      }
    }
  }

  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent | null> {
    return this.payments.get(paymentIntentId) || null
  }

  async refundPayment(paymentIntentId: string): Promise<PaymentResult> {
    const paymentIntent = this.payments.get(paymentIntentId)
    
    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      return {
        success: false,
        error: 'Cannot refund this payment'
      }
    }

    // Create a refund record (in a real app, this would be separate)
    return {
      success: true,
      paymentIntent: {
        ...paymentIntent,
        status: 'succeeded' // Keep original status, refund would be separate
      }
    }
  }
}

export const mockStripe = new MockStripe()

// Helper function to calculate commission
export function calculateCommission(amount: number, rate: number = 0.05) {
  const commission = Math.round(amount * rate * 100) / 100
  const netAmount = Math.round((amount - commission) * 100) / 100
  
  return {
    commission,
    netAmount,
    totalAmount: amount
  }
}