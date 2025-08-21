# NOWPayments Cryptocurrency Payment Integration

This document provides a comprehensive guide for setting up NOWPayments cryptocurrency payment processing in your Trading Academy application.

## 🚀 Overview

NOWPayments is a leading cryptocurrency payment processor that allows businesses to accept payments in 100+ cryptocurrencies. This integration provides:

- **Real-time exchange rates** for accurate pricing
- **Automatic payment confirmation** via webhooks
- **Support for 100+ cryptocurrencies** including Bitcoin, Ethereum, USDT, and more
- **Secure blockchain transactions** with no personal data required
- **Professional payment interface** with real-time status monitoring

## 🔧 Environment Variables

Add these variables to your `.env` file:

```env
# NOWPayments Configuration
NOWPAYMENTS_API_KEY=your_api_key_here
NOWPAYMENTS_BASE_URL=https://api.nowpayments.io/v1
NOWPAYMENTS_IPN_SECRET_KEY=your_ipn_secret_key_here

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🚀 Setup Instructions

### 1. NOWPayments Account Setup

1. **Register an Account**
   - Visit [NOWPayments website](https://nowpayments.io/)
   - Click "Sign Up" and create your account
   - Verify your email address

2. **Complete KYC Verification**
   - Log in to your NOWPayments dashboard
   - Complete the Know Your Customer (KYC) verification process
   - This is required for receiving payments

3. **Add Payout Wallet**
   - Navigate to Dashboard > Settings > Payments > Payout wallets
   - Add the cryptocurrency wallet where you want to receive payments
   - Verify the wallet address

4. **Generate API Key**
   - Go to Dashboard > Settings > Payments > API keys
   - Create a new API key
   - Copy the API key and add it to your environment variables

5. **Generate IPN Secret Key**
   - Go to Dashboard > Settings > Payments > IPN settings
   - Generate a new IPN secret key
   - Copy the secret key and add it to your environment variables

### 2. Webhook Configuration

1. **Set Webhook URL**
   - In your NOWPayments dashboard, go to Settings > Payments > IPN settings
   - Set the IPN callback URL to: `https://yourdomain.com/api/webhooks/nowpayments`
   - Enable IPN notifications for all payment statuses

2. **Test Webhook**
   - Use NOWPayments sandbox environment for testing
   - Create test payments to verify webhook functionality
   - Check your server logs for webhook notifications

### 3. API Integration

The integration includes the following API endpoints:

#### Get Available Currencies
```typescript
GET /api/payments/nowpayments/currencies
```

#### Get Price Estimate
```typescript
POST /api/payments/nowpayments/estimate
{
  "amount": 100,
  "currency_from": "usd",
  "currency_to": "btc",
  "is_fixed_rate": false
}
```

#### Create Payment
```typescript
POST /api/payments/nowpayments/create-payment
{
  "price_amount": 100,
  "price_currency": "usd",
  "pay_currency": "btc",
  "pay_amount": 0.0025,
  "ipn_callback_url": "https://yourdomain.com/api/webhooks/nowpayments",
  "order_id": "subscription_123",
  "order_description": "Trading Academy Subscription",
  "customer_email": "user@example.com",
  "customer_name": "John Doe"
}
```

#### Check Payment Status
```typescript
GET /api/payments/nowpayments/payment-status?payment_id=payment_id_here
```

### 4. Frontend Integration

The NOWPayments component (`NOWPaymentsCryptoElement`) provides:

- **Cryptocurrency Selection**: Popular cryptocurrencies and full list
- **Real-time Price Estimation**: Live exchange rates
- **Payment Creation**: Secure payment generation
- **Status Monitoring**: Automatic payment status checking
- **User-friendly Interface**: Professional payment experience

## 🔒 Security Features

### IPN Signature Verification
All webhook notifications are verified using HMAC-SHA512 signatures:

```typescript
const expectedSignature = crypto
  .createHmac('sha512', ipnSecretKey)
  .update(payload)
  .digest('hex')

const isValid = crypto.timingSafeEqual(
  Buffer.from(signature, 'hex'),
  Buffer.from(expectedSignature, 'hex')
)
```

### Payment Status Validation
- All payment statuses are validated against NOWPayments API
- Automatic retry mechanisms for failed status checks
- Comprehensive error handling and logging

## 📊 Payment Statuses

NOWPayments provides the following payment statuses:

- **waiting**: Payment is waiting for confirmation
- **confirming**: Payment is being confirmed on the blockchain
- **confirmed**: Payment has been confirmed (1-3 confirmations)
- **finished**: Payment is complete and subscription is activated
- **failed**: Payment has failed
- **expired**: Payment has expired

## 🎯 Supported Cryptocurrencies

The integration supports 100+ cryptocurrencies including:

### Popular Cryptocurrencies
- **Bitcoin (BTC)**: ₿
- **Ethereum (ETH)**: Ξ
- **Tether (USDT)**: ₮
- **USD Coin (USDC)**: 💲
- **BNB (BNB)**: 🟡
- **Cardano (ADA)**: ₳
- **Solana (SOL)**: ◎
- **Polkadot (DOT)**: ●
- **Dogecoin (DOGE)**: Ð
- **Litecoin (LTC)**: Ł

### Stablecoins
- **Tether (USDT)**: Stable
- **USD Coin (USDC)**: Stable
- **Dai (DAI)**: Stable
- **Binance USD (BUSD)**: Stable

## 🔄 Payment Flow

1. **User Selection**: User selects cryptocurrency from the interface
2. **Price Estimation**: Real-time price estimate is fetched from NOWPayments
3. **Payment Creation**: Payment is created with unique payment address
4. **User Payment**: User sends cryptocurrency to the provided address
5. **Status Monitoring**: System polls for payment status every 10 seconds
6. **Webhook Notification**: NOWPayments sends IPN when payment is confirmed
7. **Subscription Activation**: Subscription is automatically activated

## 🛠️ Testing

### Sandbox Environment
1. Use NOWPayments sandbox for testing: `https://sandbox.nowpayments.io/`
2. Create test payments with small amounts
3. Verify webhook functionality
4. Test all payment statuses

### Test Cryptocurrencies
- Use testnet cryptocurrencies for testing
- Bitcoin Testnet, Ethereum Goerli, etc.
- Verify payment confirmations

## 📈 Monitoring and Analytics

### Payment Tracking
- All payments are logged with unique payment IDs
- Payment status history is maintained
- Failed payments are tracked for analysis

### Error Handling
- Comprehensive error logging
- Automatic retry mechanisms
- User-friendly error messages

## 🔧 Configuration Options

### Rate Limiting
```typescript
// Configure polling intervals
const POLLING_INTERVAL = 10000 // 10 seconds
const MAX_RETRIES = 3
```

### Currency Preferences
```typescript
// Popular cryptocurrencies for quick selection
const popularCryptos = [
  { code: 'btc', name: 'Bitcoin', icon: '₿' },
  { code: 'eth', name: 'Ethereum', icon: 'Ξ' },
  // ... more currencies
]
```

## 🚨 Troubleshooting

### Common Issues

1. **API Key Issues**
   - Verify API key is correct
   - Check API key permissions
   - Ensure account is verified

2. **Webhook Issues**
   - Verify webhook URL is accessible
   - Check IPN secret key
   - Monitor webhook logs

3. **Payment Status Issues**
   - Check network connectivity
   - Verify payment address
   - Monitor blockchain confirmations

### Debug Mode
Enable debug logging by setting:
```env
DEBUG_NOWPAYMENTS=true
```

## 📞 Support

- **NOWPayments Support**: [support@nowpayments.io](mailto:support@nowpayments.io)
- **Documentation**: [NOWPayments API Docs](https://documenter.getpostman.com/view/7907941/T1LSCRHC)
- **Status Page**: [NOWPayments Status](https://status.nowpayments.io/)

## 🔄 Updates and Maintenance

### Regular Maintenance
- Monitor API rate limits
- Update cryptocurrency support
- Review security configurations
- Backup payment data

### Version Updates
- Keep NOWPayments SDK updated
- Monitor API changes
- Test new features
- Update documentation

## 📋 Checklist

- [ ] NOWPayments account created and verified
- [ ] API key generated and configured
- [ ] IPN secret key generated and configured
- [ ] Webhook URL configured
- [ ] Environment variables set
- [ ] API endpoints tested
- [ ] Webhook functionality verified
- [ ] Payment flow tested
- [ ] Error handling tested
- [ ] Security measures implemented
- [ ] Documentation updated
- [ ] Team trained on new payment method

## 🎉 Benefits

### For Users
- **Multiple Payment Options**: 100+ cryptocurrencies supported
- **Real-time Rates**: Accurate pricing with live exchange rates
- **Secure Transactions**: Blockchain-level security
- **No Personal Data**: Privacy-focused payments
- **Global Access**: Available worldwide

### For Business
- **Lower Fees**: Reduced payment processing costs
- **Global Reach**: Accept payments from anywhere
- **Instant Settlements**: Faster payment processing
- **Reduced Chargebacks**: No chargeback risk with crypto
- **Modern Payment Method**: Appeal to crypto-savvy users

This integration provides a comprehensive, secure, and user-friendly cryptocurrency payment solution for your Trading Academy platform! 🚀
