# Bank Transfer Payment Setup Guide

This guide provides step-by-step instructions to set up Bank Transfer payments using Flutterwave's Pay With Bank Transfer (PWBT) feature in your Trading Academy application.

## 📋 Overview

Pay With Bank Transfer (PWBT) allows customers to make payments via bank transfers into virtual bank accounts. Each payment generates a unique virtual account that expires after use, making it secure and traceable.

**Supported Currencies:**
- NGN (Nigerian Naira)
- GHS (Ghanaian Cedi)

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
   - Complete account verification
   - Enable Bank Transfer feature in your account

2. **Get API Keys**
   - Navigate to Settings > API Keys
   - Copy your Public Key and Secret Key
   - Add them to your `.env` file

3. **Configure Webhooks**
   - Go to Settings > Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/flutterwave`
   - Set webhook secret (save this as `FLUTTERWAVE_WEBHOOK_SECRET`)
   - Select events: `charge.completed`, `charge.failed`

4. **Enable Bank Transfer**
   - Contact Flutterwave support to enable PWBT for your account
   - Ensure your account supports NGN and/or GHS currencies

### 2. Payment Flow

1. **User selects Bank Transfer** on subscription page
2. **System calls Flutterwave API** to create virtual account
3. **User receives transfer details** (bank name, account number, reference)
4. **User completes transfer** using their banking app/website
5. **Flutterwave sends webhook** when payment is confirmed
6. **System activates subscription** automatically

### 3. API Endpoints

- **Bank Transfer Initiation**: `POST /api/user/subscription/activate`
- **Webhook Handler**: `POST /api/webhooks/flutterwave`
- **Transfer Details Page**: `/payment/bank-transfer-details`

## 💻 Implementation Details

### Bank Transfer Processing

The system uses Flutterwave's `/v3/charges?type=bank_transfer` endpoint to create virtual accounts:

```typescript
// Request payload
{
  "tx_ref": "TA_1234567890_abc123",
  "amount": 1000,
  "currency": "NGN",
  "email": "customer@example.com",
  "bank_transfer_options": {
    "expires": 3600 // 1 hour expiration
  },
  "meta": {
    "subscription_id": "subscription_uuid",
    "payment_method": "bank_transfer",
    "customer_name": "John Doe"
  }
}
```

### Response Handling

Successful bank transfer initiation returns:

```typescript
{
  "status": "success",
  "message": "Charge initiated",
  "data": {
    "id": 407347576,
    "tx_ref": "TA_1234567890_abc123",
    "flw_ref": "FLW-REFERENCE",
    "status": "pending"
  },
  "meta": {
    "authorization": {
      "transfer_reference": "FLW-TRANSFER-REFERENCE",
      "transfer_account": "1234567890",
      "transfer_bank": "GT Bank",
      "account_expiration": "2024-01-01T12:00:00Z",
      "transfer_note": "Please make a bank transfer to FLW Devs",
      "transfer_amount": 1000,
      "mode": "banktransfer"
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
    "amount": 1000,
    "currency": "NGN",
    "status": "successful",
    "payment_type": "bank_transfer",
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

2. **Test Bank Transfer Flow**
   - Select Bank Transfer on subscription page
   - Verify transfer details are displayed correctly
   - Test copy functionality for account details
   - Verify webhook processing (use ngrok for local testing)

3. **Test Scenarios**
   - Successful bank transfer
   - Expired virtual account
   - Insufficient funds
   - Invalid account details

### Test Data

```typescript
// Test bank transfer details
{
  "transferReference": "FLW-TEST-REF-123",
  "transferAccount": "1234567890",
  "transferBank": "Test Bank",
  "accountExpiration": "2024-01-01T12:00:00Z",
  "transferNote": "Test transfer to Trading Academy",
  "transferAmount": 100
}
```

## 🚀 Deployment Checklist

- [ ] Set up Flutterwave production account
- [ ] Configure production API keys
- [ ] Set up production webhook URL
- [ ] Test bank transfer flow in production
- [ ] Monitor webhook delivery
- [ ] Set up error logging and monitoring
- [ ] Configure backup webhook endpoints

## 🔒 Security Considerations

1. **Webhook Verification**
   - Always verify webhook signatures
   - Use HTTPS for webhook endpoints
   - Validate webhook payload structure

2. **Virtual Account Security**
   - Virtual accounts expire automatically
   - Each transaction uses unique account
   - Monitor for suspicious activity

3. **Data Protection**
   - Encrypt sensitive data in transit
   - Log payment events securely
   - Implement rate limiting

## 📊 Monitoring & Analytics

1. **Track Key Metrics**
   - Bank transfer success rate
   - Average processing time
   - Failed transfer reasons
   - Virtual account expiration rate

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

1. **Virtual Account Not Generated**
   - Check API key permissions
   - Verify currency support
   - Check account status

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
  "message": "Currency not supported",
  "data": null
}

{
  "status": "error",
  "message": "Virtual account creation failed",
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
   - Implement local bank integrations
   - Handle regulatory requirements

## 📚 Additional Resources

- [Flutterwave Documentation](https://developer.flutterwave.com/docs)
- [Flutterwave Support](https://support.flutterwave.com)
- [Bank Transfer API Reference](https://developer.flutterwave.com/docs/pay-with-bank-transfer)
- [Webhook Documentation](https://developer.flutterwave.com/docs/webhooks)

## 🎯 Next Steps

1. **Set up your Flutterwave account**
2. **Configure environment variables**
3. **Test the integration**
4. **Deploy to production**
5. **Monitor and optimize**

For additional support, refer to the main [PAYMENT_INTEGRATION.md](./PAYMENT_INTEGRATION.md) guide.

