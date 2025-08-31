@echo off
echo 🚀 Starting Firebase Deployment...
echo.

echo 📦 Building application...
call npm run build:firebase
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Build completed successfully!

echo.
echo 🌐 Deploying to Firebase...
call firebase deploy --only hosting:nivaran
if %errorlevel% neq 0 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo.
echo 🎉 Deployment completed successfully!
echo 🌍 Your app is live at: https://nivaran.web.app
echo.
pause
