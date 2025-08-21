# Google Pay Payment Setup Guide

This guide provides step-by-step instructions to set up Google Pay payments using Flutterwave's Google Pay integration in your Trading Academy application.

## 📋 Overview

Google Pay allows customers to make secure payments using their Google Pay account. The integration uses Flutterwave's Google Pay API to process payments securely and efficiently.

**Supported Features:**
- Secure payment processing
- Real-time payment confirmation
- Webhook notifications
- Mobile and web support
- Multiple currency support

## 🔧 Environment Variables

Add these variables to your `.env` file:

```env
# Flutterwave Configuration
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_WEBHOOK_SECRET=your_flutterwave_webhook_secret

# Google Pay Configuration (if using direct Google Pay API)
GOOGLE_PAY_MERCHANT_ID=your_google_pay_merchant_id
GOOGLE_PAY_MERCHANT_NAME=your_merchant_name
```

## 🚀 Setup Instructions

### 1. Flutterwave Dashboard Setup

1. **Create Flutterwave Account**
   - Sign up at [Flutterwave Dashboard](https://dashboard.flutterwave.com)
   - Complete account verification
   - Enable Google Pay feature in your account

2. **Get API Keys**
   - Navigate to Settings > API Keys
   - Copy your Public Key and Secret Key
   - Add them to your `.env` file

3. **Configure Webhooks**
   - Go to Settings > Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/flutterwave`
   - Set webhook secret (save this as `FLUTTERWAVE_WEBHOOK_SECRET`)
   - Select events: `charge.completed`, `charge.failed`

4. **Enable Google Pay**
   - Contact Flutterwave support to enable Google Pay for your account
   - Ensure your account supports USD currency for Google Pay

### 2. Google Pay Merchant Setup (Optional - for direct integration)

1. **Google Pay & Wallet Console**
   - Visit [Google Pay & Wallet Console](https://support.google.com/console/answer/10914884?hl=en)
   - Sign in with your Google account
   - Complete your business profile
   - Accept Google Pay API Terms of Service

2. **Configure Payment Processing**
   - Set up your payment processor (Flutterwave)
   - Configure supported payment methods
   - Set up your merchant account

### 3. Payment Flow

1. **User selects Google Pay** on subscription page
2. **System calls Flutterwave API** to initiate Google Pay payment
3. **User is redirected** to Google Pay payment page
4. **User completes payment** using their Google Pay account
5. **Flutterwave sends webhook** when payment is confirmed
6. **System activates subscription** automatically

### 4. API Endpoints

- **Google Pay Initiation**: `POST /api/user/subscription/activate`
- **Webhook Handler**: `POST /api/webhooks/flutterwave`
- **Payment Success Page**: `/payment/success`

## 💻 Implementation Details

### Google Pay Processing

The system uses Flutterwave's `/v3/charges?type=googlepay` endpoint to initiate Google Pay payments:

```typescript
// Request payload
{
  "tx_ref": "TA_1234567890_abc123",
  "amount": 29.99,
  "currency": "USD",
  "email": "customer@example.com",
  "fullname": "John Doe",
  "redirect_url": "https://yourdomain.com/payment/success",
  "payment_options": "googlepay",
  "meta": {
    "subscription_id": "subscription_uuid",
    "payment_method": "google_pay",
    "customer_name": "John Doe"
  }
}
```

### Response Handling

Successful Google Pay initiation returns:

```typescript
{
  "status": "success",
  "message": "Charge initiated",
  "data": {
    "id": 407347576,
    "tx_ref": "TA_1234567890_abc123",
    "flw_ref": "FLW-REFERENCE",
    "status": "pending",
    "charge_response": {
      "link": "https://checkout.flutterwave.com/v3/hosted/pay/FLW-REFERENCE"
    }
  }
}
```

### Webhook Processing

The webhook handler processes `charge.completed` events:

```typescript
// Webhook payload
{
  "event": "charge.completed",
  "data": {
    "id": 407347576,
    "tx_ref": "TA_1234567890_abc123",
    "flw_ref": "FLW-REFERENCE",
    "amount": 29.99,
    "currency": "USD",
    "status": "successful",
    "payment_type": "googlepay",
    "customer": {
      "id": 254967086,
      "email": "customer@example.com"
    },
    "meta": {
      "subscription_id": "subscription_uuid"
    }
  }
}
```

## 🧪 Testing

### Test Environment

1. **Use Flutterwave Test Mode**
   - Set `NODE_ENV=development` in your `.env`
   - Use test API keys from Flutterwave dashboard
   - Test with small amounts (e.g., $1.00)

2. **Test Google Pay Flow**
   - Select Google Pay on subscription page
   - Verify payment initiation works correctly
   - Test webhook processing (use ngrok for local testing)
   - Verify subscription activation

3. **Test Scenarios**
   - Successful Google Pay payment
   - Failed payment
   - Cancelled payment
   - Network errors

### Test Data

```typescript
// Test Google Pay payment data
{
  "method": "google_pay",
  "amount": 29.99,
  "currency": "USD",
  "description": "Trading Academy Subscription - Pro Plan",
  "customerEmail": "test@example.com",
  "customerName": "Test User",
  "subscriptionId": "test-subscription-uuid"
}
```

## 🚀 Deployment Checklist

- [ ] Set up Flutterwave production account
- [ ] Configure production API keys
- [ ] Set up production webhook URL
- [ ] Test Google Pay flow in production
- [ ] Monitor webhook delivery
- [ ] Set up error logging and monitoring
- [ ] Configure backup webhook endpoints

## 🔒 Security Considerations

1. **Webhook Verification**
   - Always verify webhook signatures
   - Use HTTPS for webhook endpoints
   - Validate webhook payload structure

2. **Payment Security**
   - Google Pay uses tokenized payment data
   - Never store actual payment card information
   - Implement proper error handling

3. **Data Protection**
   - Encrypt sensitive data in transit
   - Log payment events securely
   - Implement rate limiting

## 📊 Monitoring & Analytics

1. **Track Key Metrics**
   - Google Pay success rate
   - Average processing time
   - Failed payment reasons
   - User adoption rate

2. **Set Up Alerts**
   - Failed webhook deliveries
   - High failure rates
   - Unusual transaction patterns

3. **Logging**
   - Payment initiation events
   - Webhook processing events
   - Error conditions
   - User interactions

## 🛠️ Troubleshooting

### Common Issues

1. **Google Pay Not Available**
   - Check Flutterwave account status
   - Verify Google Pay is enabled
   - Check currency support

2. **Webhook Not Received**
   - Verify webhook URL is accessible
   - Check webhook secret configuration
   - Test webhook endpoint manually

3. **Payment Not Confirmed**
   - Check webhook processing logs
   - Verify subscription ID in metadata
   - Check database connection

### Error Handling

```typescript
// Common error responses
{
  "status": "error",
  "message": "Invalid API key",
  "data": null
}

{
  "status": "error", 
  "message": "Google Pay not supported",
  "data": null
}

{
  "status": "error",
  "message": "Payment initiation failed",
  "data": null
}
```

## 📈 Scaling Considerations

1. **High Volume**
   - Implement webhook queuing
   - Use database transactions
   - Set up load balancing

2. **Multiple Currencies**
   - Support additional currencies
   - Implement currency conversion
   - Handle exchange rate fluctuations

3. **Geographic Expansion**
   - Support additional countries
   - Implement local payment methods
   - Handle regulatory requirements

## 🌍 Supported Countries

Google Pay is available in 95+ countries worldwide. Check the [Google Pay availability page](https://pay.google.com/about/where-to-use/) for the most up-to-date list.

**Major Supported Regions:**
- United States
- United Kingdom
- Canada
- Australia
- Germany
- France
- Japan
- India
- And many more...

## 📚 Additional Resources

- [Flutterwave Documentation](https://developer.flutterwave.com/docs)
- [Flutterwave Support](https://support.flutterwave.com)
- [Google Pay API Documentation](https://developers.google.com/pay/api/web/overview)
- [Google Pay & Wallet Console](https://support.google.com/console/answer/10914884?hl=en)
- [Google Pay API Reference](https://developers.google.com/pay/api/web/reference)

## 🎯 Next Steps

1. **Set up your Flutterwave account**
2. **Configure environment variables**
3. **Test the integration**
4. **Deploy to production**
5. **Monitor and optimize**

For additional support, refer to the main [PAYMENT_INTEGRATION.md](./PAYMENT_INTEGRATION.md) guide.

## 🔄 Integration with Other Payment Methods

Google Pay integrates seamlessly with other payment methods in the Trading Academy platform:

- **Mobile Money**: For users in Africa
- **Bank Transfer**: For traditional banking
- **Crypto**: For cryptocurrency payments
- **Stripe**: For card payments
- **Apple Pay**: For iOS users

This provides users with multiple payment options while maintaining a consistent user experience across all payment methods.
