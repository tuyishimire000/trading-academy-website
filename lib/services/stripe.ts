import Stripe from 'stripe'

// Initialize Stripe with secret key (only if available)
let stripe: Stripe | null = null

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  })
}

export interface StripePaymentData {
  amount: number
  currency: string
  customerEmail: string
  customerName: string
  description: string
  metadata?: {
    [key: string]: string
  }
}

export interface StripeCustomerData {
  email: string
  name: string
  phone?: string
  metadata?: {
    [key: string]: string
  }
}

export interface StripePaymentMethodData {
  type: 'card'
  card: {
    token?: string
    payment_method_id?: string
  }
  billing_details?: {
    name: string
    email: string
  }
}

export interface StripePaymentResult {
  success: boolean
  paymentIntentId?: string
  clientSecret?: string
  customerId?: string
  paymentMethodId?: string
  message: string
  error?: string
  requiresAction?: boolean
  nextAction?: {
    type: string
    url?: string
  }
}

class StripeService {
  /**
   * Create a customer in Stripe
   */
  async createCustomer(data: StripeCustomerData): Promise<Stripe.Customer> {
    try {
      if (!stripe) {
        throw new Error('Stripe is not initialized. Please check your environment variables.')
      }
      
      const customer = await stripe.customers.create({
        email: data.email,
        name: data.name,
        phone: data.phone,
        metadata: data.metadata,
      })
      return customer
    } catch (error) {
      console.error('Stripe create customer error:', error)
      throw new Error('Failed to create Stripe customer')
    }
  }

  /**
   * Create a payment method
   */
  async createPaymentMethod(data: StripePaymentMethodData): Promise<Stripe.PaymentMethod> {
    try {
      if (!stripe) {
        throw new Error('Stripe is not initialized. Please check your environment variables.')
      }
      
      const paymentMethod = await stripe.paymentMethods.create({
        type: data.type,
        card: data.card,
        billing_details: data.billing_details,
      })
      return paymentMethod
    } catch (error) {
      console.error('Stripe create payment method error:', error)
      throw new Error('Failed to create payment method')
    }
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(data: StripePaymentData): Promise<StripePaymentResult> {
    try {
      if (!stripe) {
        return {
          success: false,
          message: 'Stripe is not initialized. Please check your environment variables.',
          error: 'Stripe not configured'
        }
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        metadata: data.metadata,
        automatic_payment_methods: {
          enabled: true,
        },
        receipt_email: data.customerEmail,
      })

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        message: 'Payment intent created successfully',
        requiresAction: paymentIntent.status === 'requires_action',
        nextAction: paymentIntent.next_action ? {
          type: paymentIntent.next_action.type,
          url: paymentIntent.next_action.redirect_to_url?.url,
        } : undefined,
      }
    } catch (error) {
      console.error('Stripe create payment intent error:', error)
      return {
        success: false,
        message: 'Failed to create payment intent',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<StripePaymentResult> {
    try {
      if (!stripe) {
        return {
          success: false,
          message: 'Stripe is not initialized. Please check your environment variables.',
          error: 'Stripe not configured'
        }
      }
      
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      })

      return {
        success: paymentIntent.status === 'succeeded',
        paymentIntentId: paymentIntent.id,
        message: paymentIntent.status === 'succeeded' 
          ? 'Payment confirmed successfully' 
          : 'Payment requires additional action',
        requiresAction: paymentIntent.status === 'requires_action',
        nextAction: paymentIntent.next_action ? {
          type: paymentIntent.next_action.type,
          url: paymentIntent.next_action.redirect_to_url?.url,
        } : undefined,
      }
    } catch (error) {
      console.error('Stripe confirm payment intent error:', error)
      return {
        success: false,
        message: 'Failed to confirm payment',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Retrieve a payment intent
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      if (!stripe) {
        throw new Error('Stripe is not initialized. Please check your environment variables.')
      }
      
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      return paymentIntent
    } catch (error) {
      console.error('Stripe retrieve payment intent error:', error)
      throw new Error('Failed to retrieve payment intent')
    }
  }

  /**
   * Cancel a payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      if (!stripe) {
        throw new Error('Stripe is not initialized. Please check your environment variables.')
      }
      
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId)
      return paymentIntent
    } catch (error) {
      console.error('Stripe cancel payment intent error:', error)
      throw new Error('Failed to cancel payment intent')
    }
  }

  /**
   * Create a refund
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  ): Promise<Stripe.Refund> {
    try {
      if (!stripe) {
        throw new Error('Stripe is not initialized. Please check your environment variables.')
      }
      
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
        reason,
      })
      return refund
    } catch (error) {
      console.error('Stripe create refund error:', error)
      throw new Error('Failed to create refund')
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): Stripe.Event {
    try {
      if (!stripe) {
        throw new Error('Stripe is not initialized. Please check your environment variables.')
      }
      
      const event = stripe.webhooks.constructEvent(payload, signature, secret)
      return event
    } catch (error) {
      console.error('Stripe webhook signature verification failed:', error)
      throw new Error('Webhook signature verification failed')
    }
  }

  /**
   * Generate test card token (for testing purposes)
   */
  async createTestCardToken(): Promise<string> {
    try {
      if (!stripe) {
        throw new Error('Stripe is not initialized. Please check your environment variables.')
      }
      
      const token = await stripe.tokens.create({
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2025,
          cvc: '123',
        },
      })
      return token.id
    } catch (error) {
      console.error('Stripe create test token error:', error)
      throw new Error('Failed to create test card token')
    }
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods(): string[] {
    return [
      'card',
      'sepa_debit',
      'sofort',
      'ideal',
      'bancontact',
      'eps',
      'giropay',
      'p24',
    ]
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): string[] {
    return [
      'usd',
      'eur',
      'gbp',
      'cad',
      'aud',
      'jpy',
      'chf',
      'sek',
      'nok',
      'dkk',
      'pln',
      'czk',
      'huf',
      'ron',
      'bgn',
      'hrk',
      'rsd',
      'isk',
      'try',
      'brl',
      'mxn',
      'ars',
      'clp',
      'cop',
      'pen',
      'uyu',
      'inr',
      'sgd',
      'hkd',
      'twd',
      'krw',
      'thb',
      'myr',
      'php',
      'idr',
      'vnd',
      'ngn',
      'zar',
      'egp',
      'mad',
      'aed',
      'qar',
      'sar',
      'kwd',
      'bhd',
      'omr',
      'jod',
      'lbp',
      'ils',
    ]
  }
}

export const stripeService = new StripeService()
export default stripeService
