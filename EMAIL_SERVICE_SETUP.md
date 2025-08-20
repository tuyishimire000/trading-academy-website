# Email Service Setup Guide

This guide will help you configure SMTP email services for password reset functionality in your Trading Academy application.

## 🔧 Supported Email Providers

The application uses SMTP for sending emails. You can use any SMTP provider:

1. **Gmail SMTP** (Recommended for development)
2. **Outlook/Hotmail SMTP**
3. **Yahoo SMTP**
4. **Custom SMTP Server**
5. **Email Service Providers** (SendGrid, Mailgun, etc.)

## 📋 Required Environment Variables

Add these environment variables to your `.env` file:

### For Gmail SMTP
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@tradingacademy.com
```

### For Outlook/Hotmail SMTP
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=noreply@tradingacademy.com
```

### For Yahoo SMTP
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@tradingacademy.com
```

### For Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_FROM=noreply@tradingacademy.com
```

## 🚀 Setup Instructions

### 1. Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Enable 2-Factor Authentication

2. **Generate App Password**
   - Go to Google Account → Security → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `SMTP_PASS`

3. **Configure Environment Variables**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-digit-app-password
   SMTP_FROM=noreply@tradingacademy.com
   ```

### 2. Outlook/Hotmail Setup

1. **Enable App Passwords** (if using 2FA)
   - Go to Microsoft Account → Security
   - Generate an app password

2. **Configure Environment Variables**
   ```env
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@outlook.com
   SMTP_PASS=your-password-or-app-password
   SMTP_FROM=noreply@tradingacademy.com
   ```

### 3. Custom SMTP Server Setup

1. **Get SMTP Credentials**
   - Contact your email provider
   - Get SMTP server details and credentials

2. **Configure Environment Variables**
   ```env
   SMTP_HOST=your-smtp-server.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-username
   SMTP_PASS=your-password
   SMTP_FROM=noreply@tradingacademy.com
   ```

## 🧪 Testing Your Setup

### 1. Test with Development Mode

In development mode, emails are logged to the console instead of being sent:

1. Go to `/forgot-password`
2. Select "Email" method
3. Enter an email address from your database
4. Check the console for the reset URL

### 2. Test with Real Email

1. Set up your SMTP credentials
2. Use a real email address
3. Test the password reset flow

## 🔒 Security Considerations

1. **Environment Variables**: Never commit email credentials to version control
2. **App Passwords**: Use app passwords instead of regular passwords when possible
3. **Rate Limiting**: Implement rate limiting for email requests
4. **Email Verification**: Consider verifying email addresses before allowing reset
5. **Link Expiration**: Reset links expire after 1 hour
6. **Logging**: In production, avoid logging sensitive email data

## 🐛 Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Check your email and password
   - Ensure you're using an app password if 2FA is enabled
   - Verify your email provider allows SMTP access

2. **"Connection timeout"**
   - Check your SMTP host and port
   - Verify your firewall settings
   - Try different ports (587, 465, 25)

3. **"Invalid credentials"**
   - Double-check your username and password
   - For Gmail, make sure you're using an app password
   - For Outlook, ensure you're using the correct password

### Provider-Specific Issues

#### Gmail
- Enable "Less secure app access" (not recommended)
- Use app passwords instead
- Check if your account has SMTP restrictions

#### Outlook/Hotmail
- Enable SMTP access in account settings
- Use app passwords if 2FA is enabled
- Check for account restrictions

#### Yahoo
- Enable SMTP access in account settings
- Use app passwords for better security
- Check for account limitations

## 📞 Support

If you need help setting up email services:

1. Check your email provider's SMTP documentation
2. Verify your environment variables
3. Test with development mode first
4. Check the application logs for error messages

## 🎯 Next Steps

Once email is configured:

1. **Test the complete flow**: Forgot password → Email link → Reset password
2. **Monitor delivery**: Check spam folders and delivery rates
3. **Implement rate limiting**: Prevent abuse
4. **Add email verification**: Verify email addresses during registration
5. **Set up monitoring**: Monitor email delivery rates and failures

## 📧 Email Templates

The system includes pre-built email templates for:

- Password reset requests
- Welcome emails (future)
- Course notifications (future)
- Event reminders (future)

Templates are customizable and support both HTML and plain text formats.
