#!/bin/bash

# RELOConnect Comprehensive Testing & QA Script
# Senior QA Engineer: Error-Free Application Assessment

echo "🚀 RELOConnect - Comprehensive QA Testing Suite"
echo "================================================"

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "expo\|next\|node.*5000" 2>/dev/null || true
sleep 2

# Check if backend and database are running
echo "🔍 Checking backend services..."
if lsof -i :5000 >/dev/null 2>&1; then
    echo "✅ Backend API is running on port 5000"
else
    echo "❌ Backend API is not running. Starting..."
    cd backend && npm start &
    sleep 3
fi

if lsof -i :5432 >/dev/null 2>&1; then
    echo "✅ PostgreSQL database is running on port 5432"
else
    echo "❌ PostgreSQL database is not running. Please start Docker:"
    echo "   docker-compose up -d"
    exit 1
fi

# Start all applications
echo "📱 Starting React Native Apps..."

# User App
echo "Starting User App..."
cd apps/user-app
npm start > user-app.log 2>&1 &
USER_APP_PID=$!
echo "User App PID: $USER_APP_PID"

# Driver App  
echo "Starting Driver App..."
cd ../driver-app
npm start -- --port 19001 > driver-app.log 2>&1 &
DRIVER_APP_PID=$!
echo "Driver App PID: $DRIVER_APP_PID"

# Admin Dashboard
echo "💻 Starting Admin Dashboard..."
cd ../admin-dashboard
npm run dev > admin-dashboard.log 2>&1 &
ADMIN_PID=$!
echo "Admin Dashboard PID: $ADMIN_PID"

echo "⏳ Waiting 30 seconds for applications to start..."
sleep 30

# Check application status
echo "🔍 Application Status Check:"
echo "============================"

# Check User App
if lsof -i :8081 >/dev/null 2>&1; then
    echo "✅ User App: RUNNING on port 8081"
    echo "   📱 QR Code: exp://$(hostname -I | awk '{print $1}'):8081"
else
    echo "❌ User App: FAILED TO START"
    echo "   📋 Log: apps/user-app/user-app.log"
fi

# Check Driver App
if lsof -i :19001 >/dev/null 2>&1; then
    echo "✅ Driver App: RUNNING on port 19001"
    echo "   🚚 QR Code: exp://$(hostname -I | awk '{print $1}'):19001"
else
    echo "❌ Driver App: FAILED TO START"
    echo "   📋 Log: apps/driver-app/driver-app.log"
fi

# Check Admin Dashboard
if lsof -i :3001 >/dev/null 2>&1; then
    echo "✅ Admin Dashboard: RUNNING on port 3001"
    echo "   💻 URL: http://localhost:3001"
else
    echo "❌ Admin Dashboard: FAILED TO START" 
    echo "   📋 Log: apps/admin-dashboard/admin-dashboard.log"
fi

# API Health Check
echo "🔍 API Health Check:"
echo "==================="
if curl -s http://localhost:5000/health >/dev/null 2>&1; then
    echo "✅ Backend API: HEALTHY"
else
    echo "❌ Backend API: UNHEALTHY or not responding"
fi

echo ""
echo "🎯 QA Testing Summary:"
echo "====================="
echo "User App:        exp://$(hostname -I | awk '{print $1}'):8081"
echo "Driver App:      exp://$(hostname -I | awk '{print $1}'):19001"
echo "Admin Dashboard: http://localhost:3001"
echo "Backend API:     http://localhost:5000"
echo "Database:        PostgreSQL on port 5432"
echo ""
echo "📋 Next Steps:"
echo "- Test mobile apps by scanning QR codes with Expo Go"
echo "- Test admin dashboard in browser"
echo "- Verify API endpoints and real-time features"
echo "- Check logs for any runtime errors"

echo ""
echo "🔍 Process IDs for monitoring:"
echo "User App: $USER_APP_PID"
echo "Driver App: $DRIVER_APP_PID"  
echo "Admin Dashboard: $ADMIN_PID"

echo ""
echo "📝 To view logs:"
echo "tail -f apps/user-app/user-app.log"
echo "tail -f apps/driver-app/driver-app.log"
echo "tail -f apps/admin-dashboard/admin-dashboard.log"
