# Payment Integration Guide

This guide explains how to integrate real payment APIs into the Trading Academy subscription system.

## Overview

The subscription system currently supports 8 payment methods:
- **Cryptocurrency** (USDT, BTC, USDC, TRX, ETH, BNB, DAI, BUSD)
- **Stripe** (Visa, Mastercard, American Express)
- **Mobile Money** (MTN, Vodafone, AirtelTigo, M-Pesa - via Flutterwave)
- **Bank Transfer** (Pay With Bank Transfer - via Flutterwave)
- **Bank Transfer** (Direct bank transfers)
- **Card Payment** (Visa, Mastercard, Verve)
- **Google Pay**
- **Apple Pay**
- **OPay**

## ✅ **Mobile Money Integration (Flutterwave) - COMPLETED**

The Mobile Money payment method has been fully integrated with Flutterwave's API and is ready for production deployment.

## ✅ **Bank Transfer Integration (Flutterwave) - COMPLETED**

The Bank Transfer payment method has been fully integrated with Flutterwave's Pay With Bank Transfer (PWBT) API and is ready for production deployment.

## Current Implementation

The system uses a mock payment service (`lib/services/payment.ts`) that simulates payment processing. Each payment method has its own processing function that you can replace with real API calls.

## Integration Steps

### 1. Choose Your Payment Providers

#### For Mobile Money:
- **MTN Mobile Money API**: https://developers.mtn.com/
- **Airtel Money API**: https://developers.airtel.com/
- **Vodafone Cash API**: https://developers.vodafone.com/

#### For Bank Transfers:
- **Paystack**: https://paystack.com/docs/
- **Flutterwave**: https://flutterwave.com/docs/
- **Stripe**: https://stripe.com/docs

#### For Stripe:
- **Stripe**: https://stripe.com/docs
- **Stripe Elements**: https://stripe.com/docs/stripe-js
- **Stripe Payment Intents**: https://stripe.com/docs/payments/payment-intents

#### For Card Payments:
- **Paystack**: https://paystack.com/docs/
- **Flutterwave**: https://flutterwave.com/docs

#### For Cryptocurrency:
- **Coinbase Commerce**: https://commerce.coinbase.com/docs/
- **BTCPay Server**: https://docs.btcpayserver.org/
- **CoinGate**: https://developer.coingate.com/
- **CoinPayments**: https://www.coinpayments.net/merchant-tools-api

#### For Digital Wallets:
- **Google Pay**: https://developers.google.com/pay/api
- **Apple Pay**: https://developer.apple.com/apple-pay/
- **OPay**: https://developers.opay.com/

### 2. Environment Variables

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Cryptocurrency Payment APIs
COINBASE_COMMERCE_API_KEY=your_coinbase_commerce_api_key
COINBASE_COMMERCE_WEBHOOK_SECRET=your_coinbase_webhook_secret

BTCPAY_SERVER_URL=your_btcpay_server_url
BTCPAY_API_KEY=your_btcpay_api_key

COINGATE_API_KEY=your_coingate_api_key
COINGATE_SANDBOX=true

# Payment Provider API Keys
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key

FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key

# Flutterwave Configuration (Mobile Money)
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_WEBHOOK_SECRET=your_flutterwave_webhook_secret

# Mobile Money APIs (Alternative providers)
MTN_API_KEY=your_mtn_api_key
MTN_API_URL=https://api.mtn.com/v1

AIRTEL_API_KEY=your_airtel_api_key
AIRTEL_API_URL=https://api.airtel.com/v1

# OPay
OPAY_API_KEY=your_opay_api_key
OPAY_API_URL=https://api.opay.com/v1
```

### 3. Install Required Packages

```bash
# For Stripe
npm install stripe @stripe/stripe-js

# For Cryptocurrency
npm install coinbase-commerce-node
npm install btcpay-node
npm install coingate

# For Paystack
npm install paystack

# For Flutterwave (Mobile Money)
npm install flutterwave-node-v3 axios

# For HTTP requests
npm install axios
```

### 4. Update Payment Service

Replace the mock functions in `lib/services/payment.ts` with real API calls:

#### Example: Stripe Integration

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export class PaymentService {
  static async processStripe(data: StripePaymentData): Promise<PaymentResult> {
    try {
      // Create a PaymentMethod (in real implementation, use Stripe Elements)
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          token: data.paymentMethodId, // From Stripe Elements
        },
        billing_details: {
          name: data.cardholderName,
          email: data.customerEmail,
        },
      })

      // Create PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency,
        description: data.description,
        payment_method: paymentMethod.id,
        confirm: true,
        metadata: {
          customerEmail: data.customerEmail,
          customerName: data.customerName,
          subscriptionId: data.subscriptionId,
        },
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      })

      return {
        success: true,
        transactionId: paymentIntent.id,
        message: "Stripe payment processed successfully"
      }
    } catch (error) {
      return {
        success: false,
        message: "Stripe payment failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }
}
```

#### Example: Coinbase Commerce Integration

```typescript
import { Client } from 'coinbase-commerce-node'

const client = new Client({ apiKey: process.env.COINBASE_COMMERCE_API_KEY! })

export class PaymentService {
  static async processCrypto(data: CryptoPaymentData): Promise<PaymentResult> {
    try {
      // Create a charge for crypto payment
      const charge = await client.charges.create({
        name: 'Trading Academy Subscription',
        description: data.description,
        local_price: {
          amount: data.amount.toString(),
          currency: 'USD'
        },
        pricing_type: 'fixed_price',
        metadata: {
          customerEmail: data.customerEmail,
          customerName: data.customerName,
          subscriptionId: data.subscriptionId,
          selectedCrypto: data.selectedCrypto
        }
      })

      return {
        success: true,
        transactionId: charge.id,
        message: "Crypto payment charge created successfully",
        paymentUrl: charge.hosted_url
      }
    } catch (error) {
      return {
        success: false,
        message: "Crypto payment failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }
}
```

#### Example: Flutterwave Mobile Money Integration

#### Example: Flutterwave Bank Transfer Integration

```typescript
// lib/services/payment.ts - Bank Transfer Processing
static async processBankTransfer(data: PaymentData): Promise<PaymentResult> {
  try {
    const { flutterwaveService } = await import('./flutterwave')
    
    // Generate transaction reference
    const txRef = flutterwaveService.generateTransactionRef()
    
    // Prepare Flutterwave bank transfer charge data
    const chargeData = {
      tx_ref: txRef,
      amount: data.amount,
      currency: data.currency,
      email: data.customerEmail,
      bank_transfer_options: {
        expires: 3600 // 1 hour expiration
      },
      meta: {
        subscription_id: data.subscriptionId,
        payment_method: 'bank_transfer',
        customer_name: data.customerName
      }
    }

    // Initiate bank transfer with Flutterwave
    const response = await flutterwaveService.initiateBankTransferPayment(chargeData)
    
    if (response.status === 'success') {
      const transferDetails = response.meta?.authorization
      return {
        success: true,
        transactionId: response.data.flw_ref,
        message: "Bank transfer initiated successfully. Please use the provided account details to complete your payment.",
        transferDetails: {
          transferReference: transferDetails?.transfer_reference,
          transferAccount: transferDetails?.transfer_account,
          transferBank: transferDetails?.transfer_bank,
          accountExpiration: transferDetails?.account_expiration,
          transferNote: transferDetails?.transfer_note,
          transferAmount: transferDetails?.transfer_amount
        },
        txRef: txRef
      }
    }
  } catch (error) {
    // Error handling
  }
}
```

#### Flutterwave Bank Transfer Flow

1. **User selects Bank Transfer** on subscription page
2. **System generates virtual account** via Flutterwave API
3. **User receives transfer details** (bank name, account number, reference)
4. **User completes transfer** using their banking app/website
5. **Flutterwave sends webhook** when payment is confirmed
6. **System activates subscription** automatically

```typescript
import { flutterwaveService } from '@/lib/services/flutterwave'

export class PaymentService {
  static async processMobileMoney(data: MobileMoneyPaymentData): Promise<PaymentResult> {
    try {
      // Generate transaction reference
      const txRef = flutterwaveService.generateTransactionRef()
      
      // Prepare Flutterwave charge data
      const chargeData = {
        tx_ref: txRef,
        amount: data.amount,
        currency: data.currency,
        country: data.countryCode,
        email: data.customerEmail,
        phone_number: data.phoneNumber,
        fullname: data.customerName,
        redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        meta: {
          subscription_id: data.subscriptionId,
          payment_method: 'mobile_money',
          provider: data.provider,
          network: data.network
        }
      }

      // Initiate payment with Flutterwave
      const response = await flutterwaveService.initiateMobileMoneyPayment(chargeData)
      
      if (response.status === 'success') {
        return {
          success: true,
          transactionId: response.data.flw_ref,
          message: "Mobile Money payment initiated successfully. Please check your phone for payment prompt.",
          paymentUrl: response.data.charge_response?.link || null,
          txRef: txRef
        }
      } else {
        return {
          success: false,
          message: response.message || "Mobile Money payment failed",
          error: "Payment initiation failed"
        }
      }
    } catch (error) {
      return {
        success: false,
        message: "Mobile Money payment failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }
}
```

#### Example: Paystack Integration

```typescript
import axios from 'axios'

export class PaymentService {
  static async processBankTransfer(data: PaymentData): Promise<PaymentResult> {
    try {
      const response = await axios.post(
        'https://api.paystack.co/transfer',
        {
          source: 'balance',
          amount: data.amount * 100,
          recipient: data.recipientCode,
          reason: data.description,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )

      return {
        success: true,
        transactionId: response.data.data.reference,
        message: "Bank transfer initiated successfully"
      }
    } catch (error) {
      return {
        success: false,
        message: "Bank transfer failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }
}
```

### 5. Update Frontend Payment Forms

The subscription page (`app/subscription/page.tsx`) already has forms for each payment method. You may need to:

1. **Add payment method tokens** for card payments
2. **Add webhook handling** for payment confirmations
3. **Add payment status checking** for pending payments

#### Example: Stripe Integration with Elements

```typescript
// In the subscription page
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)

const handleStripePayment = async () => {
  const stripe = await stripePromise
  const elements = stripe?.elements()
  
  if (!stripe || !elements) {
    throw new Error('Stripe failed to load')
  }

  // Create payment method using Stripe Elements
  const { error, paymentMethod } = await stripe.createPaymentMethod({
    type: 'card',
    card: elements.getElement(CardElement)!,
    billing_details: {
      name: paymentFormData.cardholderName,
      email: user.email,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  // Send to backend
  const response = await fetch('/api/payments/process', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentMethodId: paymentMethod.id,
      amount: userSubscription.plan.price,
      currency: 'usd',
      method: 'stripe',
      cardholderName: paymentFormData.cardholderName,
      // ... other data
    }),
  })
}
```

### 6. Add Webhook Handling

Create webhook endpoints to handle payment confirmations:

#### Flutterwave Webhook (Mobile Money)

```typescript
// app/api/webhooks/flutterwave/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('verif-hash')

    // Verify webhook signature
    if (process.env.FLUTTERWAVE_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.FLUTTERWAVE_WEBHOOK_SECRET)
        .update(body)
        .digest('hex')

      if (signature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(body)

    switch (event.event) {
      case 'charge.completed':
        await handlePaymentSuccess(event.data)
        break
      
      case 'charge.failed':
        await handlePaymentFailure(event.data)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
```

#### Stripe Webhook

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      // Update subscription status
      await updateSubscriptionStatus(paymentIntent.metadata.subscriptionId, 'active')
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
```

### 7. Payment Flow

1. **User selects payment method** on subscription page
2. **User fills payment form** with required details
3. **Frontend validates form** and sends payment data
4. **Backend processes payment** using selected provider API
5. **Payment provider confirms** payment via webhook
6. **Subscription is activated** and user redirected to dashboard

### 8. Error Handling

Implement proper error handling for:
- **Invalid payment details**
- **Insufficient funds**
- **Network errors**
- **API rate limits**
- **Payment provider downtime**

### 9. Security Considerations

- **Never store sensitive payment data** (card numbers, CVV)
- **Use HTTPS** for all payment communications
- **Validate webhook signatures**
- **Implement proper authentication**
- **Log payment activities** for audit trails

### 10. Testing

- **Use test API keys** during development
- **Test all payment methods** thoroughly
- **Test error scenarios** (declined cards, network issues)
- **Test webhook handling** with test events

## Example Integration: Complete Stripe Setup

### 1. Install Stripe
```bash
npm install stripe @stripe/stripe-js
```

### 2. Environment Variables
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Update Payment Service
```typescript
// lib/services/payment.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export class PaymentService {
  static async processCardPayment(data: PaymentData): Promise<PaymentResult> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100),
        currency: data.currency,
        description: data.description,
        metadata: {
          customerEmail: data.customerEmail,
          customerName: data.customerName,
          subscriptionId: data.subscriptionId,
        },
        payment_method: data.paymentMethodId,
        confirm: true,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      })

      return {
        success: true,
        transactionId: paymentIntent.id,
        message: "Payment processed successfully"
      }
    } catch (error) {
      return {
        success: false,
        message: "Payment failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }
  }
}
```

### 4. Create Payment API
```typescript
// app/api/payments/process/route.ts
import { PaymentService } from '@/lib/services/payment'

export async function POST(request: NextRequest) {
  try {
    const { paymentMethodId, amount, currency, method, ...paymentData } = await request.json()
    
    const result = await PaymentService.processPayment({
      method,
      amount,
      currency,
      description: `Trading Academy Subscription`,
      customerEmail: paymentData.customerEmail,
      customerName: paymentData.customerName,
      paymentMethodId,
      ...paymentData,
    })

    if (result.success) {
      // Update subscription status
      await updateSubscriptionStatus(paymentData.subscriptionId, 'active')
      
      return NextResponse.json({
        success: true,
        transactionId: result.transactionId,
        message: result.message,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Payment processing failed",
    }, { status: 500 })
  }
}
```

## Support

For specific payment provider integration help:
- **Stripe**: https://support.stripe.com/
- **Paystack**: https://paystack.com/support
- **Flutterwave**: https://flutterwave.com/support
- **MTN**: https://developers.mtn.com/support

## Next Steps

1. Choose your preferred payment providers
2. Set up developer accounts and get API keys
3. Implement the payment service methods
4. Test thoroughly with test credentials
5. Deploy with production API keys
6. Monitor payment processing and handle issues

The system is designed to be easily extensible, so you can add more payment methods or switch providers as needed.
