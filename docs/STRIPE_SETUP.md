# Stripe Payment Setup Guide

This guide provides step-by-step instructions to set up Stripe payments in your Trading Academy application using the official Stripe API.

## 📋 Overview

Stripe is a leading payment processor that provides secure, reliable payment processing for businesses worldwide. This integration uses Stripe's Payment Intents API for handling complex payment flows, including authentication and dynamic payment methods.

**Supported Features:**
- Secure payment processing with PCI DSS compliance
- Real-time payment confirmation via webhooks
- Multiple currency support
- 3D Secure authentication
- Automatic payment method detection
- Customer management
- Refund processing
- Comprehensive error handling

## 🔧 Environment Variables

Add these variables to your `.env` file:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend Environment Variables (add to .env.local)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

**Important**: Make sure to add both `STRIPE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to your environment file. The `NEXT_PUBLIC_` prefix is required for the frontend to access the publishable key.

## 🚀 Setup Instructions

### 1. Stripe Account Setup

1. **Create Stripe Account**
   - Visit [Stripe Dashboard](https://dashboard.stripe.com/register)
   - Sign up and complete account verification
   - Complete KYC (Know Your Customer) requirements

2. **Get API Keys**
   - Navigate to Developers > API Keys in your Stripe Dashboard
   - Copy your **Publishable Key** and **Secret Key**
   - Use test keys during development, live keys for production
   - Add them to your `.env` file

3. **Configure Webhooks**
   - Go to Developers > Webhooks in your Stripe Dashboard
   - Click "Add endpoint"
   - Set webhook URL: `https://yourdomain.com/api/webhooks/stripe`
   - Select events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`
     - `charge.refunded`
   - Copy the webhook signing secret and add it to your `.env` file

### 2. Payment Flow

1. **User selects Stripe** on subscription page
2. **System creates Payment Intent** with Stripe API
3. **User enters card details** using Stripe Elements
4. **System confirms payment** with payment method
5. **Stripe processes payment** and sends webhook
6. **System activates subscription** automatically

### 3. API Endpoints

- **Payment Intent Creation**: `POST /api/payments/stripe/create-payment-intent`
- **Webhook Handler**: `POST /api/webhooks/stripe`
- **Subscription Activation**: `POST /api/user/subscription/activate`

## 💻 Implementation Details

### Payment Intent Creation

The system creates a Payment Intent with Stripe:

```typescript
// Request payload
{
  "amount": 2999, // Amount in cents
  "currency": "usd",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "description": "Trading Academy Subscription - Pro Plan",
  "metadata": {
    "subscription_id": "subscription_uuid",
    "payment_method": "stripe"
  }
}
```

### Response Handling

Successful Payment Intent creation returns:

```typescript
{
  "success": true,
  "paymentIntentId": "pi_1234567890abcdef",
  "clientSecret": "pi_1234567890abcdef_secret_abcdef1234567890",
  "message": "Payment intent created successfully",
  "requiresAction": false,
  "nextAction": null
}
```

### Webhook Processing

The webhook handler processes various Stripe events:

```typescript
// Webhook payload
{
  "id": "evt_1234567890abcdef",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890abcdef",
      "amount": 2999,
      "currency": "usd",
      "status": "succeeded",
      "metadata": {
        "subscription_id": "subscription_uuid"
      }
    }
  }
}
```

## 🧪 Testing

### Test Environment

1. **Use Stripe Test Mode**
   - Set `NODE_ENV=development` in your `.env`
   - Use test API keys from Stripe dashboard
   - Test with small amounts (e.g., $1.00)

2. **Test Stripe Payment Flow**
   - Select Stripe on subscription page
   - Enter test card details
   - Verify payment intent creation
   - Test webhook processing
   - Verify subscription activation

3. **Test Scenarios**
   - Successful payment
   - Failed payment
   - 3D Secure authentication
   - Network errors
   - Invalid card details

### Test Card Details

Stripe provides test card numbers for different scenarios:

```typescript
// Successful payments
"4242424242424242" // Visa
"5555555555554444" // Mastercard
"378282246310005"  // American Express

// Failed payments
"4000000000000002" // Declined
"4000000000009995" // Insufficient funds

// 3D Secure authentication
"4000002500003155" // Requires authentication
"4000008400001629" // Requires authentication (US)
```

### Test Data

```typescript
// Test Stripe payment data
{
  "method": "stripe",
  "amount": 29.99,
  "currency": "USD",
  "description": "Trading Academy Subscription - Pro Plan",
  "customerEmail": "test@example.com",
  "customerName": "Test User",
  "subscriptionId": "test-subscription-uuid"
}
```

## 🚀 Deployment Checklist

- [ ] Set up Stripe production account
- [ ] Configure production API keys
- [ ] Set up production webhook URL
- [ ] Test Stripe payment flow in production
- [ ] Monitor webhook delivery
- [ ] Set up error logging and monitoring
- [ ] Configure backup webhook endpoints
- [ ] Verify PCI DSS compliance
- [ ] Test 3D Secure authentication

## 🔒 Security Considerations

1. **PCI DSS Compliance**
   - Stripe handles PCI DSS compliance
   - Never store actual card data
   - Use Stripe Elements for secure input
   - Implement proper access controls

2. **Webhook Verification**
   - Always verify webhook signatures
   - Use HTTPS for webhook endpoints
   - Validate webhook payload structure

3. **API Key Security**
   - Store API keys in environment variables
   - Never expose secret keys in client-side code
   - Use different keys for test and production

4. **Data Protection**
   - Encrypt sensitive data in transit
   - Log payment events securely
   - Implement rate limiting
   - Monitor for suspicious activity

## 📊 Monitoring & Analytics

1. **Track Key Metrics**
   - Stripe payment success rate
   - Average processing time
   - Failed payment reasons
   - 3D Secure completion rate
   - User adoption rate

2. **Set Up Alerts**
   - Failed webhook deliveries
   - High failure rates
   - Unusual transaction patterns
   - Security incidents

3. **Logging**
   - Payment intent creation events
   - Webhook processing events
   - Error conditions
   - User interactions
   - Security events

## 🛠️ Troubleshooting

### Common Issues

1. **Stripe Payment Not Available**
   - Check Stripe account status
   - Verify API keys are correct
   - Check currency support
   - Verify account verification status

2. **Webhook Not Received**
   - Verify webhook URL is accessible
   - Check webhook secret configuration
   - Test webhook endpoint manually
   - Check Stripe dashboard for webhook status

3. **Payment Not Confirmed**
   - Check webhook processing logs
   - Verify subscription ID in metadata
   - Check database connection
   - Verify payment intent status

4. **3D Secure Issues**
   - Ensure proper redirect handling
   - Check authentication flow
   - Verify user completion

### Error Handling

```typescript
// Common error responses
{
  "error": "card_declined",
  "message": "Your card was declined."
}

{
  "error": "insufficient_funds",
  "message": "Your card has insufficient funds."
}

{
  "error": "expired_card",
  "message": "Your card has expired."
}

{
  "error": "incorrect_cvc",
  "message": "Your card's security code is incorrect."
}

{
  "error": "processing_error",
  "message": "An error occurred while processing your card."
}
```

## 📈 Scaling Considerations

1. **High Volume**
   - Implement webhook queuing
   - Use database transactions
   - Set up load balancing
   - Optimize payment processing

2. **Multiple Currencies**
   - Support additional currencies
   - Implement currency conversion
   - Handle exchange rate fluctuations

3. **Geographic Expansion**
   - Support additional countries
   - Implement local payment methods
   - Handle regulatory requirements

## 🌍 Supported Countries

Stripe is available in most countries worldwide. Check the [Stripe documentation](https://stripe.com/global) for the most up-to-date list of supported countries and currencies.

**Major Supported Regions:**
- United States
- United Kingdom
- Canada
- Australia
- European Union
- Japan
- Singapore
- Hong Kong
- And many more...

## 💳 Payment Method Support

### Supported Methods

- **Credit Cards**: Visa, Mastercard, American Express, Discover
- **Debit Cards**: All major networks
- **Digital Wallets**: Apple Pay, Google Pay
- **Local Payment Methods**: Varies by country

### Card Types

- **Credit Cards**: All major networks
- **Debit Cards**: All major networks
- **Prepaid Cards**: Varies by network
- **Virtual Cards**: Supported where available

## 📚 Additional Resources

- [Stripe Documentation](https://docs.stripe.com/)
- [Stripe API Reference](https://docs.stripe.com/api)
- [Stripe Support](https://support.stripe.com/)
- [Stripe Testing Guide](https://docs.stripe.com/testing)
- [Stripe Webhooks](https://docs.stripe.com/webhooks)
- [Stripe Security Best Practices](https://docs.stripe.com/security)

## 🎯 Next Steps

1. **Set up your Stripe account**
2. **Configure environment variables**
3. **Test the integration**
4. **Deploy to production**
5. **Monitor and optimize**

For additional support, refer to the main [PAYMENT_INTEGRATION.md](./PAYMENT_INTEGRATION.md) guide.

## 🔄 Integration with Other Payment Methods

Stripe integrates seamlessly with other payment methods in the Trading Academy platform:

- **Mobile Money**: For users in Africa
- **Bank Transfer**: For traditional banking
- **Crypto**: For cryptocurrency payments
- **Google Pay**: For Android users
- **Apple Pay**: For iOS users
- **OPay**: For Nigerian users

This provides users with multiple payment options while maintaining a consistent user experience across all payment methods.

## ⚠️ Important Notes

1. **PCI DSS Compliance**
   - Stripe handles PCI DSS compliance automatically
   - Never store actual card data
   - Use Stripe Elements for secure input
   - Implement proper security measures

2. **3D Secure Authentication**
   - Some cards require 3D Secure authentication
   - Implement proper redirect handling
   - Provide clear user instructions
   - Handle authentication failures gracefully

3. **Currency Handling**
   - Stripe supports 135+ currencies
   - Implement currency conversion if needed
   - Handle exchange rate fluctuations
   - Display prices in local currency

4. **User Experience**
   - Provide clear error messages
   - Show payment progress
   - Handle network timeouts
   - Offer alternative payment methods

## 🔧 Technical Implementation

### Frontend Integration

The frontend uses Stripe Elements for secure card input:

```typescript
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const CheckoutForm = () => {
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    })

    if (error) {
      console.log(error.message)
    } else {
      // Send paymentMethod.id to your server
      console.log('PaymentMethod:', paymentMethod)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>Pay</button>
    </form>
  )
}
```

### Backend Processing

The backend handles payment intent creation and confirmation:

```typescript
// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2999, // Amount in cents
  currency: 'usd',
  description: 'Trading Academy Subscription',
  metadata: {
    subscription_id: subscriptionId
  }
})

// Confirm payment intent
const confirmedIntent = await stripe.paymentIntents.confirm(
  paymentIntent.id,
  {
    payment_method: paymentMethodId
  }
)
```

This comprehensive Stripe integration provides a secure, reliable, and user-friendly payment experience that follows industry best practices and compliance standards.
