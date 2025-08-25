@echo off
echo 🚀 Trading Academy Website Deployment Script
echo =============================================

REM Check if git is initialized
if not exist ".git" (
    echo ❌ Error: Git repository not found. Please initialize git first.
    exit /b 1
)

REM Check if there are uncommitted changes
git diff --quiet
if errorlevel 1 (
    echo ⚠️  Warning: You have uncommitted changes.
    echo Please commit your changes before deploying.
    git status --short
    exit /b 1
)

echo ✅ Git repository is clean

REM Check if .env.local exists
if not exist ".env.local" (
    echo ⚠️  Warning: .env.local file not found.
    echo Make sure to set up your environment variables in Vercel.
)

echo.
echo 📋 Deployment Checklist:
echo 1. ✅ Code is committed to GitHub
echo 2. 🔄 Push to GitHub: git push origin main
echo 3. 🌐 Deploy on Vercel:
echo    - Go to https://vercel.com
echo    - Import your GitHub repository
echo    - Add environment variables
echo 4. 🗄️  Set up Railway MySQL database
echo 5. 🔧 Run database setup: POST /api/setup-database
echo 6. 🧪 Test the deployment
echo 7. 🗑️  Remove /api/setup-database endpoint

echo.
echo 🎯 Next Steps:
echo 1. Push your code to GitHub:
echo    git add .
echo    git commit -m "Prepare for deployment"
echo    git push origin main
echo.
echo 2. Follow the DEPLOYMENT.md guide for detailed instructions
echo.
echo Good luck with your deployment! 🚀
pause
