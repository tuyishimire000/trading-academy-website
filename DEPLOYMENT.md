# 🚀 Deployment Guide: Vercel + Railway

This guide will help you deploy your trading academy website using Vercel for the frontend and Railway for the database.

## 📋 Prerequisites

- [Vercel Account](https://vercel.com)
- [Railway Account](https://railway.app)
- [GitHub Account](https://github.com)
- Your project code pushed to GitHub

## 🗄️ Step 1: Deploy Database on Railway

### 1.1 Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Create a new project

### 1.2 Add MySQL Database
1. Click "New Service" → "Database" → "MySQL"
2. Wait for the database to be provisioned
3. Note down the connection details from the "Connect" tab

### 1.3 Get Database Connection Details
From Railway dashboard, copy:
- `MYSQL_HOST`
- `MYSQL_PORT` (usually 3306)
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`

## 🌐 Step 2: Deploy Frontend on Vercel

### 2.1 Connect GitHub Repository
1. Go to [Vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Select the repository

### 2.2 Configure Environment Variables
In Vercel project settings, add these environment variables:

```env
# Database Configuration
DATABASE_HOST=your_railway_mysql_host
DATABASE_PORT=3306
DATABASE_NAME=your_railway_database_name
DATABASE_USER=your_railway_username
DATABASE_PASSWORD=your_railway_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Email Configuration (if using)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Stripe Configuration (if using)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Alchemy Configuration (for crypto features)
ALCHEMY_API_KEY=your_alchemy_api_key

# WalletConnect Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NODE_ENV=production
```

### 2.3 Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at `https://your-project.vercel.app`

## 🔧 Step 3: Database Setup

### 3.1 Run Database Migrations
After deployment, you'll need to set up your database tables. You can do this by:

1. **Option A: Use Railway Console**
   - Go to your Railway MySQL service
   - Click "Connect" → "MySQL Console"
   - Run your SQL scripts manually

2. **Option B: Create a Setup API Endpoint**
   - Create a temporary API endpoint to run migrations
   - Call it once after deployment
   - Remove it after setup

### 3.2 Create Setup Endpoint (Temporary)
Create `app/api/setup-database/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { ensureDatabaseConnection } from "@/lib/sequelize/index"
import { sequelize } from "@/lib/sequelize/index"

export async function POST() {
  try {
    await ensureDatabaseConnection()
    await sequelize.sync({ force: true }) // Be careful with force: true
    
    return NextResponse.json({ 
      message: "Database setup completed",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      error: "Database setup failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
```

**⚠️ Important**: Remove this endpoint after setup for security!

## 🔍 Step 4: Verify Deployment

### 4.1 Check Health Endpoint
Visit: `https://your-domain.vercel.app/api/health`

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": "connected"
}
```

### 4.2 Test Database Connection
1. Try to register a new user
2. Check if data is saved in Railway MySQL
3. Verify portfolio features work

## 🔒 Step 5: Security Checklist

- [ ] Remove any temporary setup endpoints
- [ ] Ensure all environment variables are set
- [ ] Test authentication flow
- [ ] Verify wallet connection works
- [ ] Check that portfolio data is user-specific
- [ ] Test subscription features (if applicable)

## 🚨 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check Railway MySQL is running
   - Verify environment variables in Vercel
   - Check firewall settings

2. **Build Fails**
   - Check for TypeScript errors
   - Verify all dependencies are in package.json
   - Check Node.js version compatibility

3. **Environment Variables Not Working**
   - Redeploy after adding new variables
   - Check variable names match exactly
   - Verify no extra spaces

4. **Wallet Connection Issues**
   - Check WalletConnect project ID
   - Verify domain is whitelisted in WalletConnect
   - Check Alchemy API key

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Railway service logs
3. Verify all environment variables
4. Test locally with production environment variables

## 🔄 Continuous Deployment

Once set up, every push to your main branch will automatically:
1. Trigger a new Vercel deployment
2. Update your application
3. Keep your database running on Railway

Your trading academy website is now live! 🎉
