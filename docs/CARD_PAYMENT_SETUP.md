# Card Payment Setup Guide

This guide provides step-by-step instructions to set up card payments using Flutterwave's Card API in your Trading Academy application.

## 📋 Overview

Card payments allow customers to make secure payments using their credit or debit cards. The integration uses Flutterwave's Card API to process payments securely and efficiently, following PCI DSS compliance standards.

**Supported Card Networks:**
- Visa
- Mastercard
- American Express
- Verve
- Afrigo

**Supported Features:**
- Secure payment processing
- Real-time payment confirmation
- Webhook notifications
- Multiple currency support
- 3D Secure authentication
- PCI DSS compliance
- Customer and payment method management

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
   - Enable card payment feature in your account

2. **Get API Keys**
   - Navigate to Settings > API Keys
   - Copy your Public Key and Secret Key
   - Add them to your `.env` file

3. **Configure Webhooks**
   - Go to Settings > Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/flutterwave`
   - Set webhook secret (save this as `FLUTTERWAVE_WEBHOOK_SECRET`)
   - Select events: `charge.completed`, `charge.failed`

4. **Enable Card Payments**
   - Contact Flutterwave support to enable card payments for your account
   - Ensure your account supports the currencies you need
   - Verify PCI DSS compliance status

### 2. Payment Flow

1. **User selects Card Payment** on subscription page
2. **User enters card details** (securely encrypted)
3. **System creates customer** in Flutterwave
4. **System creates payment method** with encrypted card data
5. **System initiates charge** with customer and payment method IDs
6. **User completes 3D Secure** authentication if required
7. **Flutterwave sends webhook** when payment is confirmed
8. **System activates subscription** automatically

### 3. API Endpoints

- **Card Payment Initiation**: `POST /api/user/subscription/activate`
- **Webhook Handler**: `POST /api/webhooks/flutterwave`
- **Payment Success Page**: `/payment/success`

## 💻 Implementation Details

### Card Payment Processing

The system follows Flutterwave's recommended flow:

#### Step 1: Create Customer

```typescript
// Request payload
{
  "email": "customer@example.com",
  "name": "John Doe",
  "phone_number": "+1234567890"
}
```

#### Step 2: Create Payment Method

```typescript
// Request payload
{
  "type": "card",
  "card": {
    "encrypted_card_number": "ENCRYPTED_CARD_NUMBER",
    "encrypted_expiry_month": "ENCRYPTED_EXPIRY_MONTH",
    "encrypted_expiry_year": "ENCRYPTED_EXPIRY_YEAR",
    "encrypted_cvv": "ENCRYPTED_CVV",
    "nonce": "RANDOMLY_GENERATED_NONCE"
  }
}
```

#### Step 3: Initiate Charge

```typescript
// Request payload
{
  "tx_ref": "TA_1234567890_abc123",
  "amount": 29.99,
  "currency": "USD",
  "email": "customer@example.com",
  "fullname": "John Doe",
  "phone_number": "+1234567890",
  "redirect_url": "https://yourdomain.com/payment/success",
  "customer_id": "CUSTOMER_ID",
  "payment_method_id": "PAYMENT_METHOD_ID",
  "meta": {
    "subscription_id": "subscription_uuid",
    "payment_method": "card",
    "customer_name": "John Doe"
  }
}
```

### Response Handling

Successful card payment initiation returns:

```typescript
{
  "status": "success",
  "message": "Charge initiated",
  "data": {
    "id": 407347576,
    "tx_ref": "TA_1234567890_abc123",
    "flw_ref": "FLW-REFERENCE",
    "status": "pending",
    "auth_url": "https://checkout.flutterwave.com/v3/hosted/pay/FLW-REFERENCE",
    "payment_type": "card",
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
    "payment_type": "card",
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

2. **Test Card Payment Flow**
   - Select Card Payment on subscription page
   - Enter test card details
   - Verify payment initiation works correctly
   - Test webhook processing (use ngrok for local testing)
   - Verify subscription activation

3. **Test Scenarios**
   - Successful card payment
   - Failed payment
   - 3D Secure authentication
   - Network errors
   - Invalid card details

### Test Card Details

Flutterwave provides test card details for successful payments:

```typescript
// Test card details
{
  "cardNumber": "5531886652142950",
  "cvv": "564",
  "expiryDate": "09/32",
  "pin": "3310",
  "otp": "12345"
}
```

### Test Data

```typescript
// Test card payment data
{
  "method": "card",
  "amount": 29.99,
  "currency": "USD",
  "description": "Trading Academy Subscription - Pro Plan",
  "customerEmail": "test@example.com",
  "customerName": "Test User",
  "cardDetails": {
    "encryptedCardNumber": "encrypted_card_number",
    "encryptedExpiryMonth": "encrypted_expiry_month",
    "encryptedExpiryYear": "encrypted_expiry_year",
    "encryptedCvv": "encrypted_cvv",
    "nonce": "randomly_generated_nonce"
  },
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
- [ ] Test card payment flow in production
- [ ] Monitor webhook delivery
- [ ] Set up error logging and monitoring
- [ ] Configure backup webhook endpoints
- [ ] Verify PCI DSS compliance
- [ ] Test 3D Secure authentication

## 🔒 Security Considerations

1. **PCI DSS Compliance**
   - Never store actual card data
   - Use encryption for all card details
   - Implement proper access controls
   - Regular security audits

2. **Webhook Verification**
   - Always verify webhook signatures
   - Use HTTPS for webhook endpoints
   - Validate webhook payload structure

3. **Card Data Security**
   - Encrypt card details before transmission
   - Use secure communication channels
   - Implement proper error handling
   - Log security events

4. **Data Protection**
   - Encrypt sensitive data in transit
   - Log payment events securely
   - Implement rate limiting
   - Monitor for suspicious activity

## 📊 Monitoring & Analytics

1. **Track Key Metrics**
   - Card payment success rate
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
   - Payment initiation events
   - Webhook processing events
   - Error conditions
   - User interactions
   - Security events

## 🛠️ Troubleshooting

### Common Issues

1. **Card Payment Not Available**
   - Check Flutterwave account status
   - Verify card payments are enabled
   - Check currency support
   - Verify PCI DSS compliance

2. **Webhook Not Received**
   - Verify webhook URL is accessible
   - Check webhook secret configuration
   - Test webhook endpoint manually

3. **Payment Not Confirmed**
   - Check webhook processing logs
   - Verify subscription ID in metadata
   - Check database connection

4. **3D Secure Issues**
   - Ensure proper redirect handling
   - Check authentication flow
   - Verify user completion

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
  "message": "Card payment not supported",
  "data": null
}

{
  "status": "error",
  "message": "Payment initiation failed",
  "data": null
}

{
  "status": "error",
  "message": "Invalid card details",
  "data": null
}

{
  "status": "error",
  "message": "3D Secure authentication required",
  "data": null
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

Card payments are available in most countries worldwide. Check the [Flutterwave documentation](https://developer.flutterwave.com/docs) for the most up-to-date list of supported countries and currencies.

**Major Supported Regions:**
- United States
- United Kingdom
- Canada
- Australia
- European Union
- Nigeria
- Ghana
- Kenya
- South Africa
- And many more...

## 💳 Card Network Support

### Supported Networks

- **Visa**: Worldwide acceptance
- **Mastercard**: Worldwide acceptance
- **American Express**: Limited to specific regions
- **Verve**: Nigeria and some African countries
- **Afrigo**: African countries

### Card Types

- **Credit Cards**: All major networks
- **Debit Cards**: All major networks
- **Prepaid Cards**: Varies by network
- **Virtual Cards**: Supported where available

## 📚 Additional Resources

- [Flutterwave Documentation](https://developer.flutterwave.com/docs)
- [Flutterwave Support](https://support.flutterwave.com)
- [PCI DSS Standards](https://www.pcisecuritystandards.org/)
- [3D Secure Documentation](https://developer.flutterwave.com/docs/3d-secure)
- [Card Payment Best Practices](https://developer.flutterwave.com/docs/card-payment-best-practices)

## 🎯 Next Steps

1. **Set up your Flutterwave account**
2. **Configure environment variables**
3. **Test the integration**
4. **Deploy to production**
5. **Monitor and optimize**

For additional support, refer to the main [PAYMENT_INTEGRATION.md](./PAYMENT_INTEGRATION.md) guide.

## 🔄 Integration with Other Payment Methods

Card payments integrate seamlessly with other payment methods in the Trading Academy platform:

- **Mobile Money**: For users in Africa
- **Bank Transfer**: For traditional banking
- **Crypto**: For cryptocurrency payments
- **Google Pay**: For Android users
- **Apple Pay**: For iOS users
- **OPay**: For Nigerian users

This provides users with multiple payment options while maintaining a consistent user experience across all payment methods.

## ⚠️ Important Notes

1. **PCI DSS Compliance**
   - Card payments require PCI DSS compliance
   - Never store actual card data
   - Use encryption for all sensitive data
   - Implement proper security measures

2. **3D Secure Authentication**
   - Some cards require 3D Secure authentication
   - Implement proper redirect handling
   - Provide clear user instructions
   - Handle authentication failures gracefully

3. **Card Validation**
   - Implement proper card number validation
   - Validate expiry dates and CVV
   - Check for expired cards
   - Handle invalid card details

4. **User Experience**
   - Provide clear error messages
   - Show payment progress
   - Handle network timeouts
   - Offer alternative payment methods
