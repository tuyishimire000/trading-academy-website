# Subscription Scheduler System

## Overview

The subscription scheduler system automatically manages user subscriptions by:
- Checking for expired subscriptions every 24 hours
- Automatically downgrading expired subscriptions to the free plan
- Sending reminder emails 7 days before expiration
- Sending notification emails when subscriptions expire

## Features

### 🔍 Automatic Expiration Check
- Runs every 24 hours at 2:00 AM UTC
- Finds all active subscriptions that have expired
- Automatically downgrades users to the free plan
- Sends expiration notification emails

### 📧 Email Reminders
- Sends reminder emails 7 days before expiration
- Sends daily reminders until renewal or expiration
- Professional HTML email templates
- Includes renewal links and plan details

### 🔄 Automatic Downgrade
- Expired subscriptions are marked as "expired"
- New free plan subscription is created automatically
- User data and progress are preserved
- Seamless transition to free plan

## API Endpoints

### Manual Scheduler Run
```bash
POST /api/scheduler/run
Headers: x-api-key: YOUR_SCHEDULER_API_KEY
```

### Cron Job Endpoint
```bash
GET /api/cron/subscription-check
# Called automatically by Vercel Cron
```

### Test Endpoints
```bash
# Test scheduler functionality
POST /api/test/scheduler
Body: { "action": "run-scheduler" }

# Test email sending
POST /api/test/scheduler
Body: { "action": "test-email", "email": "test@example.com" }

# Test expired subscription check
POST /api/test/scheduler
Body: { "action": "check-expired" }

# Test reminder emails
POST /api/test/scheduler
Body: { "action": "send-reminders" }
```

## Environment Variables

Add these to your `.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@tradingacademy.com

# Scheduler Security
SCHEDULER_API_KEY=your-secure-api-key
CRON_API_KEY=your-cron-api-key
CRON_SECRET=your-cron-secret

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Email Templates

### Subscription Expired
- Sent when subscription expires
- Informs user of automatic downgrade
- Provides renewal link
- Lists what happens after expiration

### Subscription Expiring Soon
- Sent 7 days before expiration
- Daily reminders until renewal
- Highlights premium features
- Clear call-to-action for renewal

## Database Schema

The scheduler works with these tables:
- `users` - User information
- `user_subscriptions` - Subscription records
- `subscription_plans` - Available plans

## Cron Schedule

The scheduler runs automatically:
- **Time**: 2:00 AM UTC daily
- **Schedule**: `0 2 * * *` (every day at 2 AM)
- **Provider**: Vercel Cron Jobs

## Manual Testing

1. **Test Email Sending**:
   ```bash
   curl -X POST http://localhost:3000/api/test/scheduler \
     -H "Content-Type: application/json" \
     -d '{"action": "test-email", "email": "test@example.com"}'
   ```

2. **Test Scheduler**:
   ```bash
   curl -X POST http://localhost:3000/api/test/scheduler \
     -H "Content-Type: application/json" \
     -d '{"action": "run-scheduler"}'
   ```

3. **Manual Scheduler Run**:
   ```bash
   curl -X POST http://localhost:3000/api/scheduler/run \
     -H "x-api-key: YOUR_SCHEDULER_API_KEY"
   ```

## Monitoring

The scheduler provides detailed logging:
- ✅ Success messages with user details
- ❌ Error messages with specific issues
- 📧 Email sending confirmations
- 🔍 Database operation results

## Security

- API key authentication for manual runs
- Cron secret verification for automated runs
- Environment variable protection
- Error handling and logging

## Troubleshooting

### Common Issues

1. **Emails not sending**:
   - Check SMTP configuration
   - Verify email credentials
   - Check spam folder

2. **Scheduler not running**:
   - Verify cron job configuration
   - Check Vercel deployment
   - Review API logs

3. **Database errors**:
   - Check database connection
   - Verify table structure
   - Review Sequelize models

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will show detailed logs for all scheduler operations.
