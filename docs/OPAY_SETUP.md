# OPay Payment Setup Guide

This guide provides step-by-step instructions to set up OPay payments using Flutterwave's OPay integration in your Trading Academy application.

## 📋 Overview

**⚠️ IMPORTANT: OPay is available exclusively for Nigerian users and transactions in Nigerian Naira (NGN) only.**

OPay allows Nigerian customers to make secure payments using their OPay wallet. The integration uses Flutterwave's OPay API to process payments securely and efficiently.

**Supported Features:**
- Secure payment processing
- Real-time payment confirmation
- Webhook notifications
- Nigerian Naira (NGN) currency only
- Nigerian phone number validation
- OPay wallet integration

## 🔧 Environment Variables

Add these variables to your `.env` file:

```env
# Flutterwave Configuration
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_WEBHOOK_SECRET=your_flutterwave_webhook_secret
```

## 🚀 Setup Instructions

### 1. Flutterwave Dashboard Setup

1. **Create Flutterwave Account**
   - Sign up at [Flutterwave Dashboard](https://dashboard.flutterwave.com)
   - Complete account verification and KYC
   - Enable OPay feature in your account

2. **Get API Keys**
   - Navigate to Settings > API Keys
   - Copy your Public Key and Secret Key
   - Add them to your `.env` file

3. **Configure Webhooks**
   - Go to Settings > Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/flutterwave`
   - Set webhook secret (save this as `FLUTTERWAVE_WEBHOOK_SECRET`)
   - Select events: `charge.completed`, `charge.failed`

4. **Enable OPay**
   - Contact Flutterwave support to enable OPay for your account
   - Ensure your account supports NGN currency
   - Verify OPay integration is active

### 2. Payment Flow

1. **User selects OPay** on subscription page
2. **User enters Nigerian phone number** with +234 country code
3. **System calls Flutterwave API** to initiate OPay payment
4. **User is redirected** to OPay authorization page
5. **User logs into OPay account** and authorizes payment
6. **Flutterwave sends webhook** when payment is confirmed
7. **System activates subscription** automatically

### 3. API Endpoints

- **OPay Initiation**: `POST /api/user/subscription/activate`
- **Webhook Handler**: `POST /api/webhooks/flutterwave`
- **Payment Success Page**: `/payment/success`

## 💻 Implementation Details

### OPay Processing

The system uses Flutterwave's `/v3/charges?type=opay` endpoint to initiate OPay payments:

```typescript
// Request payload
{
  "tx_ref": "TA_1234567890_abc123",
  "amount": "5000",
  "currency": "NGN",
  "email": "customer@example.com",
  "fullname": "John Doe",
  "phone_number": "+2348012345678",
  "redirect_url": "https://yourdomain.com/payment/success",
  "meta": {
    "subscription_id": "subscription_uuid",
    "payment_method": "opay",
    "customer_name": "John Doe"
  }
}
```

### Response Handling

Successful OPay initiation returns:

```typescript
{
  "status": "success",
  "message": "Charge initiated",
  "data": {
    "id": 407347576,
    "tx_ref": "TA_1234567890_abc123",
    "flw_ref": "FLW-REFERENCE",
    "status": "pending",
    "auth_url": "https://opay.flutterwave.com?reference=FLW-REFERENCE",
    "payment_type": "opay",
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
    "amount": 5000,
    "currency": "NGN",
    "status": "successful",
    "payment_type": "opay",
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
   - Test with small amounts (e.g., 100 NGN)

2. **Test OPay Flow**
   - Select OPay on subscription page
   - Enter valid Nigerian phone number
   - Verify payment initiation works correctly
   - Test webhook processing (use ngrok for local testing)
   - Verify subscription activation

3. **Test Scenarios**
   - Successful OPay payment
   - Failed payment
   - Cancelled payment
   - Network errors
   - Invalid phone number format

### Test Data

```typescript
// Test OPay payment data
{
  "method": "opay",
  "amount": 5000,
  "currency": "NGN",
  "description": "Trading Academy Subscription - Pro Plan",
  "customerEmail": "test@example.com",
  "customerName": "Test User",
  "phoneNumber": "+2348012345678",
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
- [ ] Test OPay flow in production
- [ ] Monitor webhook delivery
- [ ] Set up error logging and monitoring
- [ ] Configure backup webhook endpoints
- [ ] Verify Nigerian phone number validation

## 🔒 Security Considerations

1. **Webhook Verification**
   - Always verify webhook signatures
   - Use HTTPS for webhook endpoints
   - Validate webhook payload structure

2. **Payment Security**
   - OPay uses secure wallet authentication
   - Never store actual payment card information
   - Implement proper error handling

3. **Phone Number Validation**
   - Validate Nigerian phone number format
   - Ensure +234 country code is present
   - Implement proper input sanitization

4. **Data Protection**
   - Encrypt sensitive data in transit
   - Log payment events securely
   - Implement rate limiting

## 📊 Monitoring & Analytics

1. **Track Key Metrics**
   - OPay success rate
   - Average processing time
   - Failed payment reasons
   - User adoption rate
   - Phone number validation errors

2. **Set Up Alerts**
   - Failed webhook deliveries
   - High failure rates
   - Unusual transaction patterns
   - Invalid phone number attempts

3. **Logging**
   - Payment initiation events
   - Webhook processing events
   - Error conditions
   - User interactions
   - Phone number validation logs

## 🛠️ Troubleshooting

### Common Issues

1. **OPay Not Available**
   - Check Flutterwave account status
   - Verify OPay is enabled
   - Check NGN currency support
   - Verify account KYC completion

2. **Webhook Not Received**
   - Verify webhook URL is accessible
   - Check webhook secret configuration
   - Test webhook endpoint manually

3. **Payment Not Confirmed**
   - Check webhook processing logs
   - Verify subscription ID in metadata
   - Check database connection

4. **Phone Number Issues**
   - Ensure Nigerian phone number format
   - Verify +234 country code
   - Check phone number validation

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
  "message": "OPay not supported",
  "data": null
}

{
  "status": "error",
  "message": "Payment initiation failed",
  "data": null
}

{
  "status": "error",
  "message": "Invalid phone number format",
  "data": null
}
```

## 📈 Scaling Considerations

1. **High Volume**
   - Implement webhook queuing
   - Use database transactions
   - Set up load balancing

2. **Geographic Expansion**
   - OPay is Nigeria-specific
   - Consider other payment methods for other regions
   - Implement region-based payment method display

3. **Currency Handling**
   - OPay only supports NGN
   - Implement currency conversion if needed
   - Handle exchange rate fluctuations

## 🇳🇬 Nigerian Market Focus

### Regional Availability

OPay is available exclusively in Nigeria and supports:
- **Country**: Nigeria only
- **Currency**: Nigerian Naira (NGN) only
- **Phone Numbers**: +234 country code required
- **Language**: English and local languages

### User Requirements

- **OPay Wallet**: Users must have an active OPay wallet account
- **Phone Number**: Valid Nigerian phone number with +234 country code
- **KYC**: Users must complete OPay KYC verification
- **Internet**: Stable internet connection for payment processing

### Market Considerations

- **High Adoption**: OPay is widely used in Nigeria
- **Mobile-First**: Primarily mobile-based payments
- **Trust**: Well-established and trusted payment method
- **Regulation**: Compliant with Nigerian financial regulations

## 📚 Additional Resources

- [Flutterwave Documentation](https://developer.flutterwave.com/docs)
- [Flutterwave Support](https://support.flutterwave.com)
- [OPay Official Website](https://opayweb.com)
- [OPay Developer Documentation](https://developer.opay.com)
- [Nigerian Financial Regulations](https://www.cbn.gov.ng)

## 🎯 Next Steps

1. **Set up your Flutterwave account**
2. **Configure environment variables**
3. **Test the integration**
4. **Deploy to production**
5. **Monitor and optimize**

For additional support, refer to the main [PAYMENT_INTEGRATION.md](./PAYMENT_INTEGRATION.md) guide.

## 🔄 Integration with Other Payment Methods

OPay integrates seamlessly with other payment methods in the Trading Academy platform:

- **Mobile Money**: For users in other African countries
- **Bank Transfer**: For traditional banking
- **Crypto**: For cryptocurrency payments
- **Stripe**: For card payments
- **Google Pay**: For Android users
- **Apple Pay**: For iOS users

This provides users with multiple payment options while maintaining a consistent user experience across all payment methods.

## ⚠️ Important Notes

1. **Nigerian Exclusivity**
   - OPay is only available for Nigerian users
   - Implement region-based payment method display
   - Provide alternative payment methods for non-Nigerian users

2. **Currency Limitation**
   - OPay only supports NGN transactions
   - Implement currency conversion if needed
   - Handle exchange rate fluctuations

3. **Phone Number Requirements**
   - Nigerian phone number with +234 country code required
   - Implement proper validation
   - Provide clear error messages for invalid formats

4. **User Education**
   - Inform users about OPay requirements
   - Provide clear instructions for payment process
   - Offer support for OPay-related issues
