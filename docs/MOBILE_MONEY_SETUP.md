# Mobile Money Payment Setup Guide

This guide provides step-by-step instructions to set up Mobile Money payments using Flutterwave in your Trading Academy application.

## ✅ **Status: Ready for Production**

The Mobile Money payment system has been fully integrated and is ready for deployment.

## 🚀 **Quick Start**

### 1. Environment Variables

Add these to your `.env` file:

```env
# Flutterwave Configuration
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_WEBHOOK_SECRET=your_flutterwave_webhook_secret

# Base URL for redirects
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 2. Flutterwave Dashboard Setup

1. **Create Flutterwave Account**
   - Sign up at [Flutterwave Dashboard](https://dashboard.flutterwave.com)
   - Complete KYC verification

2. **Get API Keys**
   - Go to Settings → API Keys
   - Copy your Public Key and Secret Key
   - Use test keys for development, live keys for production

3. **Configure Webhooks**
   - Go to Settings → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/flutterwave`
   - Set webhook secret (save this as `FLUTTERWAVE_WEBHOOK_SECRET`)

4. **Enable Mobile Money**
   - Go to Settings → Business Preferences → Payment Methods
   - Enable Mobile Money for your target countries

## 🌍 **Supported Countries & Providers**

### Ghana
- **MTN Mobile Money** (MTN)
- **Vodafone Cash** (VOD)
- **AirtelTigo Money** (TGO)

### Kenya
- **M-Pesa** (MPZ)
- **Airtel Money** (AIRTEL)

### Tanzania
- **M-Pesa** (MPS)

### Uganda
- **M-Pesa** (MPU)

### Rwanda
- **M-Pesa** (MPR)

## 🔧 **Technical Implementation**

### Payment Flow

1. **User selects Mobile Money** on subscription page
2. **User chooses provider** (MTN, Vodafone, etc.)
3. **User enters phone number** with country code
4. **System initiates payment** via Flutterwave API
5. **User receives payment prompt** on their phone
6. **User enters PIN** to authorize payment
7. **Payment is processed** and webhook is triggered
8. **Subscription is activated** automatically
9. **User is redirected** to dashboard

### API Endpoints

- **Payment Initiation**: `POST /api/user/subscription/activate`
- **Payment Verification**: `POST /api/payments/verify`
- **Webhook Handler**: `POST /api/webhooks/flutterwave`
- **Success Page**: `/payment/success`

### Database Updates

The system automatically:
- Creates pending subscription records
- Updates subscription status to 'active' on payment success
- Sets subscription period dates
- Stores payment metadata

## 🧪 **Testing**

### Test Phone Numbers

Use these test numbers for development:

**Ghana:**
- MTN: `+233 24 123 4567`
- Vodafone: `+233 50 123 4567`
- AirtelTigo: `+233 27 123 4567`

**Kenya:**
- M-Pesa: `+254 700 123 456`
- Airtel: `+254 730 123 456`

### Test Amounts

- Use small amounts (e.g., 1 GHS, 10 KES) for testing
- Flutterwave provides test environments for development

## 🚀 **Deployment Checklist**

### Pre-Deployment
- [ ] Set up Flutterwave production account
- [ ] Configure production API keys
- [ ] Set up webhook URL for production
- [ ] Test payment flow in sandbox
- [ ] Verify webhook signature validation

### Production Environment Variables
```env
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-X
FLUTTERWAVE_WEBHOOK_SECRET=your_webhook_secret_here
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Post-Deployment
- [ ] Test live payment with small amount
- [ ] Verify webhook receives payment confirmations
- [ ] Check subscription activation works
- [ ] Monitor payment success rates
- [ ] Set up error monitoring

## 🔒 **Security Considerations**

### Webhook Security
- Always verify webhook signatures
- Use HTTPS for webhook URLs
- Validate payment amounts and currencies
- Log all webhook events for audit

### Data Protection
- Never log sensitive payment data
- Encrypt stored payment metadata
- Use secure session management
- Implement rate limiting

## 📊 **Monitoring & Analytics**

### Key Metrics to Track
- Payment success rate
- Average payment processing time
- Failed payment reasons
- User drop-off points

### Error Handling
- Network timeouts
- Invalid phone numbers
- Insufficient funds
- User cancellation

## 🆘 **Troubleshooting**

### Common Issues

**Payment Not Initiated**
- Check API keys are correct
- Verify phone number format
- Ensure provider is supported

**Webhook Not Received**
- Check webhook URL is accessible
- Verify webhook secret matches
- Check server logs for errors

**Subscription Not Activated**
- Verify webhook signature
- Check database connection
- Review webhook handler logs

### Support Resources
- [Flutterwave Documentation](https://developer.flutterwave.com/docs)
- [Flutterwave Support](https://support.flutterwave.com)
- [Mobile Money API Reference](https://developer.flutterwave.com/v4.0.0/docs/mobile-money)

## 📈 **Scaling Considerations**

### Performance
- Implement payment queuing for high volume
- Use database transactions for subscription updates
- Cache provider lists and rates
- Monitor API rate limits

### Reliability
- Implement retry logic for failed payments
- Use circuit breakers for external APIs
- Set up fallback payment methods
- Monitor system health

## 🎯 **Next Steps**

1. **Set up your Flutterwave account**
2. **Configure environment variables**
3. **Test the payment flow**
4. **Deploy to production**
5. **Monitor and optimize**

The Mobile Money payment system is now fully integrated and ready to accept real payments from your users!

