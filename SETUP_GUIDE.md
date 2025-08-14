# 🚀 Quick Setup Guide

## Step 1: Set Up Environment Variables

1. **Copy the example file**:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. **Get your Supabase credentials**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Go to Settings → API
   - Copy your Project URL and anon public key

3. **Update .env.local**:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   \`\`\`

## Step 2: Set Up Database

1. **Go to Supabase SQL Editor**
2. **Run these scripts in order**:
   - `scripts/supabase/01-enable-extensions.sql`
   - `scripts/supabase/02-create-profiles-table.sql`
   - `scripts/supabase/03-create-main-tables.sql`
   - `scripts/supabase/04-seed-data.sql`

## Step 3: Configure Authentication

1. **In Supabase Dashboard**:
   - Go to Authentication → Settings
   - Set Site URL: `http://localhost:3000`
   - Add Redirect URLs:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/**`

## Step 4: Start Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## ✅ Verification

- Visit http://localhost:3000
- You should see a green "Environment Configuration Valid" message
- If you see red errors, check your environment variables

## 🚀 Deploy to Production

1. **Deploy to Vercel**:
   \`\`\`bash
   vercel
   \`\`\`

2. **Set production environment variables** in Vercel Dashboard

3. **Update Supabase settings** with your live domain

Your trading academy is now ready! 🎉
