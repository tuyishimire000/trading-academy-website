# Deployment Guide for Prime Aura Trading Academy

## 🚀 Quick Deployment Steps

### 1. Prepare Your Supabase Project

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Run Database Scripts**:
   - Go to SQL Editor in Supabase Dashboard
   - Run the scripts in order:
     - `scripts/supabase/01-enable-extensions.sql`
     - `scripts/supabase/02-create-profiles-table.sql`
     - `scripts/supabase/03-create-main-tables.sql`
     - `scripts/supabase/04-seed-data.sql`

3. **Configure Authentication**:
   - Go to Authentication > Settings
   - Set Site URL to your domain (e.g., `https://your-app.vercel.app`)
   - Add redirect URLs:
     - `https://your-app.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (for development)

### 2. Deploy to Vercel

1. **Connect to Vercel**:
   \`\`\`bash
   npm install -g vercel
   vercel login
   vercel
   \`\`\`

2. **Set Environment Variables**:
   In Vercel Dashboard > Settings > Environment Variables:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   \`\`\`

3. **Deploy**:
   \`\`\`bash
   vercel --prod
   \`\`\`

### 3. Update Supabase Settings

1. **Update Site URL**:
   - Authentication > Settings > Site URL: `https://your-app.vercel.app`

2. **Add Redirect URLs**:
   - Authentication > Settings > Redirect URLs:
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/**`

### 4. Test Your Deployment

1. Visit your live site
2. Try signing up with a real email
3. Check email verification works
4. Test login/logout functionality
5. Verify dashboard loads correctly

## 🔧 Environment Variables Explained

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anon key for client-side
- `SUPABASE_SERVICE_ROLE_KEY`: Secret key for server-side operations
- `NEXT_PUBLIC_SITE_URL`: Your live domain URL

## 🛠️ Troubleshooting

### Email Verification Issues
- Ensure Site URL is set correctly in Supabase
- Check redirect URLs include your domain
- Verify email templates are enabled

### Authentication Errors
- Check environment variables are set correctly
- Ensure auth callback route exists
- Verify middleware configuration

### Database Connection Issues
- Confirm all SQL scripts ran successfully
- Check RLS policies are enabled
- Verify service role key has proper permissions

## 📱 Custom Domain (Optional)

1. **Add Custom Domain in Vercel**:
   - Go to Vercel Dashboard > Domains
   - Add your custom domain
   - Configure DNS records

2. **Update Environment Variables**:
   - Change `NEXT_PUBLIC_SITE_URL` to your custom domain
   - Update Supabase Site URL and redirect URLs

## 🔒 Security Checklist

- ✅ Environment variables are set in production
- ✅ Supabase RLS policies are enabled
- ✅ Service role key is kept secret
- ✅ HTTPS is enforced
- ✅ Email verification is required
- ✅ Proper error handling is in place

## 📊 Monitoring

- Set up Vercel Analytics
- Monitor Supabase usage
- Check error logs regularly
- Set up uptime monitoring

Your trading academy is now live and ready for users! 🎉
