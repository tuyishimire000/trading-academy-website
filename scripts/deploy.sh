#!/bin/bash

echo "🚀 Trading Academy Website Deployment Script"
echo "============================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not found. Please initialize git first."
    exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes."
    echo "Please commit your changes before deploying."
    git status --short
    exit 1
fi

echo "✅ Git repository is clean"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local file not found."
    echo "Make sure to set up your environment variables in Vercel."
fi

echo ""
echo "📋 Deployment Checklist:"
echo "1. ✅ Code is committed to GitHub"
echo "2. 🔄 Push to GitHub: git push origin main"
echo "3. 🌐 Deploy on Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import your GitHub repository"
echo "   - Add environment variables"
echo "4. 🗄️  Set up Railway MySQL database"
echo "5. 🔧 Run database setup: POST /api/setup-database"
echo "6. 🧪 Test the deployment"
echo "7. 🗑️  Remove /api/setup-database endpoint"

echo ""
echo "🎯 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push origin main"
echo ""
echo "2. Follow the DEPLOYMENT.md guide for detailed instructions"
echo ""
echo "Good luck with your deployment! 🚀"
