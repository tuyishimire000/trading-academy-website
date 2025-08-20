# Environment Variables Setup Guide

This guide lists all the environment variables you need to configure for your Trading Academy application.

## 🔧 Required Environment Variables

Add these variables to your `.env` file in the root directory of your project.

## 📧 Email Service (SMTP)

### Gmail SMTP (Recommended for Development)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password
SMTP_FROM=noreply@tradingacademy.com
```

### Outlook/Hotmail SMTP
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password-or-app-password
SMTP_FROM=noreply@tradingacademy.com
```

### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_FROM=noreply@tradingacademy.com
```

## 📱 SMS Service (Mista - Recommended)

### Mista SMS Service
```env
SMS_PROVIDER=mista
MISTA_API_URL=https://your-mista-api-endpoint.com
MISTA_API_KEY=your_mista_api_key_here
MISTA_SENDER_ID=your_sender_id_here
```

### Alternative SMS Providers

#### Twilio
```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
SMS_FROM_NUMBER=+1234567890
```

#### AWS SNS
```env
SMS_PROVIDER=aws-sns
SMS_API_KEY=your_aws_access_key_id
SMS_API_SECRET=your_aws_secret_access_key
AWS_REGION=us-east-1
SMS_FROM_NUMBER=+1234567890
```

#### Vonage
```env
SMS_PROVIDER=vonage
SMS_API_KEY=your_vonage_api_key
SMS_API_SECRET=your_vonage_api_secret
SMS_FROM_NUMBER=+1234567890
```

#### Custom SMS Provider
```env
SMS_PROVIDER=custom
SMS_API_KEY=your_api_key_here
SMS_CUSTOM_ENDPOINT=https://your-sms-service.com/api/send
SMS_FROM_NUMBER=+1234567890
```

## 🗄️ Database Configuration

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=trading_academy
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

## 🌐 Application Configuration

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 🔐 JWT Configuration

```env
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
```

## 📋 Complete Example .env File

Here's a complete example of what your `.env` file should look like:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=trading_academy
DB_USER=root
DB_PASSWORD=your_password

# Email Service (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password
SMTP_FROM=noreply@tradingacademy.com

# SMS Service (Mista)
SMS_PROVIDER=mista
MISTA_API_URL=https://your-mista-api-endpoint.com
MISTA_API_KEY=your_mista_api_key_here
MISTA_SENDER_ID=your_sender_id_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
```

## 🚀 Quick Setup Instructions

1. **Copy the example above** and create a `.env` file in your project root
2. **Replace the placeholder values** with your actual credentials
3. **Restart your development server** after making changes
4. **Test the services** using the forgot password functionality

## 🔒 Security Notes

- **Never commit your `.env` file** to version control
- **Use strong, unique passwords** for all services
- **Enable 2-Factor Authentication** where possible
- **Use app passwords** instead of regular passwords for email services
- **Keep your API keys secure** and rotate them regularly

## 🧪 Testing

After setting up your environment variables:

1. **Test Email Service**:
   - Go to `/forgot-password`
   - Select "Email" method
   - Enter an email from your database
   - Check console for reset URL (development mode)

2. **Test SMS Service**:
   - Go to `/forgot-password`
   - Select "SMS" method
   - Enter a phone number from your database
   - Check console for reset code (development mode)

## 📞 Support

If you need help setting up any of these services:

1. **Email Setup**: See `EMAIL_SERVICE_SETUP.md`
2. **SMS Setup**: See `SMS_SERVICE_SETUP.md`
3. **Database Setup**: Check your MySQL/Sequelize documentation
4. **General Issues**: Check the application logs for error messages
