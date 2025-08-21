# Apple Pay Payment Setup Guide

This guide provides step-by-step instructions to set up Apple Pay payments using Flutterwave's Apple Pay integration in your Trading Academy application.

## 📋 Overview

Apple Pay allows customers to make secure payments using their Apple Pay account. The integration uses Flutterwave's Apple Pay API to process payments securely and efficiently.

**Supported Features:**
- Secure payment processing
- Real-time payment confirmation
- Webhook notifications
- Safari browser support (required)
- Multiple currency support
- iOS and macOS compatibility

## 🔧 Environment Variables

Add these variables to your `.env` file:

```env
# Flutterwave Configuration
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_WEBHOOK_SECRET=your_flutterwave_webhook_secret

# Apple Pay Configuration (if using direct Apple Pay API)
APPLE_PAY_MERCHANT_ID=your_apple_pay_merchant_id
APPLE_PAY_MERCHANT_NAME=your_merchant_name
```

## 🚀 Setup Instructions

### 1. Flutterwave Dashboard Setup

1. **Create Flutterwave Account**
   - Sign up at [Flutterwave Dashboard](https://dashboard.flutterwave.com)
   - Complete account verification
   - Enable Apple Pay feature in your account

2. **Get API Keys**
   - Navigate to Settings > API Keys
   - Copy your Public Key and Secret Key
   - Add them to your `.env` file

3. **Configure Webhooks**
   - Go to Settings > Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/flutterwave`
   - Set webhook secret (save this as `FLUTTERWAVE_WEBHOOK_SECRET`)
   - Select events: `charge.completed`, `charge.failed`

4. **Enable Apple Pay**
   - Contact Flutterwave support to enable Apple Pay for your account
   - Ensure your account supports USD currency for Apple Pay
   - Verify Safari browser compatibility

### 2. Apple Pay Merchant Setup (Optional - for direct integration)

1. **Apple Developer Account**
   - Sign up for [Apple Developer Program](https://developer.apple.com/programs/)
   - Complete your business profile
   - Accept Apple Pay API Terms of Service

2. **Configure Payment Processing**
   - Set up your payment processor (Flutterwave)
   - Configure supported payment methods
   - Set up your merchant account

### 3. Payment Flow

1. **User selects Apple Pay** on subscription page
2. **System calls Flutterwave API** to initiate Apple Pay payment
3. **User is redirected** to Apple Pay payment page (Safari required)
4. **User completes payment** using their Apple Pay account
5. **Flutterwave sends webhook** when payment is confirmed
6. **System activates subscription** automatically

### 4. API Endpoints

- **Apple Pay Initiation**: `POST /api/user/subscription/activate`
- **Webhook Handler**: `POST /api/webhooks/flutterwave`
- **Payment Success Page**: `/payment/success`

## 💻 Implementation Details

### Apple Pay Processing

The system uses Flutterwave's `/v3/charges?type=applepay` endpoint to initiate Apple Pay payments:

```typescript
// Request payload
{
  "tx_ref": "TA_1234567890_abc123",
  "amount": 29.99,
  "currency": "USD",
  "email": "customer@example.com",
  "fullname": "John Doe",
  "redirect_url": "https://yourdomain.com/payment/success",
  "payment_options": "applepay",
  "meta": {
    "subscription_id": "subscription_uuid",
    "payment_method": "apple_pay",
    "customer_name": "John Doe"
  }
}
```

### Response Handling

Successful Apple Pay initiation returns:

```typescript
{
  "status": "success",
  "message": "Charge initiated",
  "data": {
    "id": 407347576,
    "tx_ref": "TA_1234567890_abc123",
    "flw_ref": "FLW-REFERENCE",
    "status": "pending",
    "auth_url": "https://applepay.flutterwave.com?reference=FLW-REFERENCE",
    "payment_type": "applepay",
    "customer": {
      "id": 254967086,
      "email": "customer@example.com",
      "name": "John Doe"
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
    "payment_type": "applepay",
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

2. **Test Apple Pay Flow**
   - Select Apple Pay on subscription page
   - Verify payment initiation works correctly
   - Test webhook processing (use ngrok for local testing)
   - Verify subscription activation

3. **Test Scenarios**
   - Successful Apple Pay payment
   - Failed payment
   - Cancelled payment
   - Network errors

### Test Data

```typescript
// Test Apple Pay payment data
{
  "method": "apple_pay",
  "amount": 29.99,
  "currency": "USD",
  "description": "Trading Academy Subscription - Pro Plan",
  "customerEmail": "test@example.com",
  "customerName": "Test User",
  "subscriptionId": "test-subscription-uuid"
}
```

### Mock Testing

Flutterwave provides mock testing capabilities:

- **Successful Transaction**: Append `_success_mock` to your `tx_ref`
- **Failed Transaction**: Append `_failed_mock` to your `tx_ref`

Example:
```typescript
// Successful mock payment
"tx_ref": "TA_1234567890_abc123_success_mock"

// Failed mock payment
"tx_ref": "TA_1234567890_abc123_failed_mock"
```

## 🚀 Deployment Checklist

- [ ] Set up Flutterwave production account
- [ ] Configure production API keys
- [ ] Set up production webhook URL
- [ ] Test Apple Pay flow in production
- [ ] Monitor webhook delivery
- [ ] Set up error logging and monitoring
- [ ] Configure backup webhook endpoints
- [ ] Verify Safari browser compatibility

## 🔒 Security Considerations

1. **Webhook Verification**
   - Always verify webhook signatures
   - Use HTTPS for webhook endpoints
   - Validate webhook payload structure

2. **Payment Security**
   - Apple Pay uses tokenized payment data
   - Never store actual payment card information
   - Implement proper error handling

3. **Browser Security**
   - Apple Pay requires Safari browser
   - Implement browser detection
   - Provide fallback payment methods

4. **Data Protection**
   - Encrypt sensitive data in transit
   - Log payment events securely
   - Implement rate limiting

## 📊 Monitoring & Analytics

1. **Track Key Metrics**
   - Apple Pay success rate
   - Average processing time
   - Failed payment reasons
   - User adoption rate
   - Browser compatibility issues

2. **Set Up Alerts**
   - Failed webhook deliveries
   - High failure rates
   - Unusual transaction patterns
   - Safari browser errors

3. **Logging**
   - Payment initiation events
   - Webhook processing events
   - Error conditions
   - User interactions
   - Browser compatibility logs

## 🛠️ Troubleshooting

### Common Issues

1. **Apple Pay Not Available**
   - Check Flutterwave account status
   - Verify Apple Pay is enabled
   - Check currency support
   - Verify Safari browser requirement

2. **Webhook Not Received**
   - Verify webhook URL is accessible
   - Check webhook secret configuration
   - Test webhook endpoint manually

3. **Payment Not Confirmed**
   - Check webhook processing logs
   - Verify subscription ID in metadata
   - Check database connection

4. **Browser Compatibility**
   - Ensure user is using Safari browser
   - Check Apple Pay availability in user's region
   - Verify device compatibility

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
  "message": "Apple Pay not supported",
  "data": null
}

{
  "status": "error",
  "message": "Payment initiation failed",
  "data": null
}

{
  "status": "error",
  "message": "Safari browser required",
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

Apple Pay is available in 60+ countries worldwide. Check the [Apple Pay availability page](https://support.apple.com/en-us/HT207957) for the most up-to-date list.

**Major Supported Regions:**
- United States
- United Kingdom
- Canada
- Australia
- Germany
- France
- Japan
- Singapore
- Hong Kong
- And many more...

## 📱 Device Requirements

### iOS Devices
- iPhone 6 or later
- iOS 11.0 or later
- Apple Pay set up in Wallet app

### macOS Devices
- Mac with Touch ID or Apple T1/T2 chip
- macOS Sierra or later
- Safari browser

### Web Requirements
- Safari browser (required)
- macOS or iOS device
- Apple Pay enabled in Safari

## 📚 Additional Resources

- [Flutterwave Documentation](https://developer.flutterwave.com/docs)
- [Flutterwave Support](https://support.flutterwave.com)
- [Apple Pay API Documentation](https://developer.apple.com/apple-pay/)
- [Apple Developer Program](https://developer.apple.com/programs/)
- [Apple Pay Web Integration](https://developer.apple.com/documentation/apple_pay_on_the_web)

## 🎯 Next Steps

1. **Set up your Flutterwave account**
2. **Configure environment variables**
3. **Test the integration**
4. **Deploy to production**
5. **Monitor and optimize**

For additional support, refer to the main [PAYMENT_INTEGRATION.md](./PAYMENT_INTEGRATION.md) guide.

## 🔄 Integration with Other Payment Methods

Apple Pay integrates seamlessly with other payment methods in the Trading Academy platform:

- **Mobile Money**: For users in Africa
- **Bank Transfer**: For traditional banking
- **Crypto**: For cryptocurrency payments
- **Stripe**: For card payments
- **Google Pay**: For Android users

This provides users with multiple payment options while maintaining a consistent user experience across all payment methods.

## ⚠️ Important Notes

1. **Safari Browser Requirement**
   - Apple Pay only works in Safari browser
   - Implement browser detection and fallback
   - Provide alternative payment methods for non-Safari users

2. **Device Compatibility**
   - Apple Pay requires compatible iOS/macOS devices
   - Check device compatibility before offering Apple Pay
   - Provide fallback options for incompatible devices

3. **Regional Availability**
   - Apple Pay availability varies by region
   - Implement region-based payment method display
   - Provide alternative payment methods for unsupported regions
