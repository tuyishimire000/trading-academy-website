# SMS Service Setup Guide

This guide will help you configure SMS services for password reset functionality in your Trading Academy application.

## 🔧 Supported SMS Providers

The application supports multiple SMS providers:

1. **Mista** (Recommended for production)
2. **Twilio** (Alternative option)
3. **AWS SNS** (Amazon Simple Notification Service)
4. **Vonage** (formerly Nexmo)
5. **Custom Provider** (for your own SMS service)

## 📋 Required Environment Variables

Add these environment variables to your `.env` file:

### For Mista (Recommended)
```env
SMS_PROVIDER=mista
MISTA_API_URL=your_mista_api_url_here
MISTA_API_KEY=your_mista_api_key_here
MISTA_SENDER_ID=your_sender_id_here
```

### For Twilio (Alternative)
```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
SMS_FROM_NUMBER=+1234567890
```

### For AWS SNS
```env
SMS_PROVIDER=aws-sns
SMS_API_KEY=your_aws_access_key_id
SMS_API_SECRET=your_aws_secret_access_key
AWS_REGION=us-east-1
SMS_FROM_NUMBER=+1234567890
```

### For Vonage
```env
SMS_PROVIDER=vonage
SMS_API_KEY=your_vonage_api_key
SMS_API_SECRET=your_vonage_api_secret
SMS_FROM_NUMBER=+1234567890
```

### For Custom Provider
```env
SMS_PROVIDER=custom
SMS_API_KEY=your_api_key_here
SMS_CUSTOM_ENDPOINT=https://your-sms-service.com/api/send
SMS_FROM_NUMBER=+1234567890
```

## 🚀 Setup Instructions

### 1. Mista Setup (Recommended)

1. **Get Your Mista Credentials**
   - Contact your Mista service provider
   - Get your API URL, API Key, and Sender ID

2. **Configure Environment Variables**
   ```env
   SMS_PROVIDER=mista
   MISTA_API_URL=https://your-mista-api-endpoint.com
   MISTA_API_KEY=your_mista_api_key_here
   MISTA_SENDER_ID=your_sender_id_here
   ```

### 2. Twilio Setup (Alternative)

1. **Create a Twilio Account**
   - Go to [twilio.com](https://www.twilio.com)
   - Sign up for a free account
   - Verify your phone number

2. **Get Your Credentials**
   - Go to your Twilio Console
   - Copy your Account SID and Auth Token
   - Get a phone number for sending SMS

3. **Configure Environment Variables**
   ```env
   SMS_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
   TWILIO_AUTH_TOKEN=your_auth_token_here
   SMS_FROM_NUMBER=+1234567890
   ```

### 3. AWS SNS Setup

1. **Create AWS Account**
   - Go to [aws.amazon.com](https://aws.amazon.com)
   - Create an account if you don't have one

2. **Set Up IAM User**
   - Go to IAM Console
   - Create a new user with SNS permissions
   - Generate Access Key and Secret Key

3. **Configure Environment Variables**
   ```env
   SMS_PROVIDER=aws-sns
   SMS_API_KEY=AKIAIOSFODNN7EXAMPLE
   SMS_API_SECRET=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   AWS_REGION=us-east-1
   SMS_FROM_NUMBER=+1234567890
   ```

### 4. Vonage Setup

1. **Create Vonage Account**
   - Go to [vonage.com](https://www.vonage.com)
   - Sign up for an account
   - Get your API credentials

2. **Configure Environment Variables**
   ```env
   SMS_PROVIDER=vonage
   SMS_API_KEY=your_vonage_api_key
   SMS_API_SECRET=your_vonage_api_secret
   SMS_FROM_NUMBER=+1234567890
   ```

### 5. Custom Provider Setup

If you have your own SMS service:

1. **Set up your SMS endpoint**
   - Your endpoint should accept POST requests
   - Expected payload: `{ to, message, from }`

2. **Configure Environment Variables**
   ```env
   SMS_PROVIDER=custom
   SMS_API_KEY=your_api_key_here
   SMS_CUSTOM_ENDPOINT=https://your-sms-service.com/api/send
   SMS_FROM_NUMBER=+1234567890
   ```

## 🧪 Testing Your Setup

### 1. Test with Development Mode

In development mode, SMS codes are logged to the console instead of being sent:

1. Go to `/forgot-password`
2. Select "SMS" method
3. Enter a phone number from your database
4. Check the console for the reset code

### 2. Test with Real SMS

1. Set up your SMS provider credentials
2. Use a real phone number
3. Test the password reset flow

## 📱 Phone Number Format

Phone numbers should be in international format:
- ✅ `+1234567890` (US)
- ✅ `+447911123456` (UK)
- ✅ `+61412345678` (Australia)
- ❌ `1234567890` (missing country code)
- ❌ `(123) 456-7890` (wrong format)

## 🔒 Security Considerations

1. **Environment Variables**: Never commit SMS credentials to version control
2. **Rate Limiting**: Implement rate limiting for SMS requests
3. **Phone Verification**: Consider verifying phone numbers before allowing SMS reset
4. **Code Expiration**: SMS codes expire after 10 minutes
5. **Logging**: In production, avoid logging sensitive SMS data

## 🐛 Troubleshooting

### Common Issues

1. **"SMS configuration incomplete"**
   - Check that all required environment variables are set
   - Verify your SMS provider credentials

2. **"SMS sending failed"**
   - Check your SMS provider account balance
   - Verify the phone number format
   - Check provider-specific error messages

3. **"Invalid phone number"**
   - Ensure phone numbers include country code
   - Use international format (e.g., +1234567890)

### Provider-Specific Issues

#### Mista
- Verify your Mista account is active
- Check that your API credentials are correct
- Ensure you have sufficient credits
- Verify your sender ID is approved

#### Twilio
- Verify your Twilio account is active
- Check that your phone number is verified
- Ensure you have sufficient credits

#### AWS SNS
- Verify IAM permissions include SNS access
- Check that your AWS region is correct
- Ensure your AWS account is not in sandbox mode

#### Vonage
- Verify your Vonage account is active
- Check that your API credentials are correct
- Ensure you have sufficient credits

## 📞 Support

If you need help setting up SMS services:

1. Check your SMS provider's documentation
2. Verify your environment variables
3. Test with development mode first
4. Check the application logs for error messages

## 🎯 Next Steps

Once SMS is configured:

1. **Test the complete flow**: Forgot password → SMS code → Reset password
2. **Monitor usage**: Track SMS costs and usage
3. **Implement rate limiting**: Prevent abuse
4. **Add phone verification**: Verify phone numbers during registration
5. **Set up monitoring**: Monitor SMS delivery rates and failures
