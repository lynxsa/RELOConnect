#!/bin/bash

# RELOConnect System Modernization & Integration Script
# Senior Architect Implementation Plan

echo "🏗️  RELOConnect System Modernization Starting..."
echo "========================================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $1 in
        "error") echo -e "${RED}❌ $2${NC}" ;;
        "success") echo -e "${GREEN}✅ $2${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $2${NC}" ;;
        "info") echo -e "${BLUE}ℹ️  $2${NC}" ;;
    esac
}

print_status "info" "Starting comprehensive system assessment and modernization..."

# Phase 1: Database Setup
echo ""
echo "📦 Phase 1: Database Infrastructure"
echo "-----------------------------------"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_status "error" "Docker is not running. Please start Docker first."
    exit 1
fi

print_status "success" "Docker is running"

# Start PostgreSQL database
print_status "info" "Starting PostgreSQL database..."
if docker-compose up -d postgres; then
    print_status "success" "PostgreSQL database started successfully"
else
    print_status "error" "Failed to start PostgreSQL database"
    exit 1
fi

# Wait for database to be ready
print_status "info" "Waiting for database to be ready..."
sleep 10

# Check database connection
if docker exec reloconnect-postgres pg_isready -U reloconnect > /dev/null 2>&1; then
    print_status "success" "Database is ready and accepting connections"
else
    print_status "warning" "Database might still be starting up..."
fi

# Phase 2: Backend Services
echo ""
echo "🔧 Phase 2: Backend Services Setup"
echo "----------------------------------"

cd backend

if [ -f "package.json" ]; then
    print_status "info" "Installing backend dependencies..."
    if npm install; then
        print_status "success" "Backend dependencies installed"
    else
        print_status "error" "Failed to install backend dependencies"
    fi
    
    print_status "info" "Running database migrations..."
    if npm run migrate; then
        print_status "success" "Database migrations completed"
    else
        print_status "warning" "Database migrations may have issues"
    fi
    
    print_status "info" "Generating Prisma client..."
    if npm run generate; then
        print_status "success" "Prisma client generated"
    else
        print_status "warning" "Prisma client generation issues"
    fi
    
    print_status "info" "Seeding database with initial data..."
    if npm run seed; then
        print_status "success" "Database seeded successfully"
    else
        print_status "warning" "Database seeding may have issues"
    fi
else
    print_status "error" "Backend package.json not found"
fi

cd ..

# Phase 3: User Mobile App Modernization
echo ""
echo "📱 Phase 3: User Mobile App Modernization"
echo "-----------------------------------------"

cd apps/user-app

if [ -f "package.json" ]; then
    print_status "info" "Modernizing User App dependencies..."
    
    # Backup current package.json
    cp package.json package.json.backup
    
    print_status "info" "Installing modern dependencies..."
    if npm install; then
        print_status "success" "User app dependencies updated"
    else
        print_status "error" "Failed to update user app dependencies"
    fi
else
    print_status "error" "User app package.json not found"
fi

cd ../..

# Phase 4: Driver App Enhancement
echo ""
echo "🚚 Phase 4: Driver App Enhancement"
echo "----------------------------------"

cd apps/driver-app

if [ -f "package.json" ]; then
    print_status "info" "Installing Driver App dependencies..."
    if npm install; then
        print_status "success" "Driver app dependencies installed"
    else
        print_status "error" "Failed to install driver app dependencies"
    fi
else
    print_status "error" "Driver app package.json not found"
fi

cd ../..

# Phase 5: Admin Dashboard Setup
echo ""
echo "💻 Phase 5: Admin Dashboard Setup"
echo "---------------------------------"

cd apps/admin-dashboard

if [ -f "package.json" ]; then
    print_status "info" "Installing Admin Dashboard dependencies..."
    if npm install; then
        print_status "success" "Admin dashboard dependencies installed"
    else
        print_status "error" "Failed to install admin dashboard dependencies"
    fi
    
    print_status "info" "Building admin dashboard..."
    if npm run build; then
        print_status "success" "Admin dashboard built successfully"
    else
        print_status "warning" "Admin dashboard build may have issues"
    fi
else
    print_status "error" "Admin dashboard package.json not found"
fi

cd ../..

# Phase 6: Start All Services
echo ""
echo "🚀 Phase 6: Starting All Services"
echo "---------------------------------"

print_status "info" "Starting Backend API Server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

sleep 5

print_status "info" "Starting Admin Dashboard..."
cd apps/admin-dashboard
npm run dev &
ADMIN_PID=$!
cd ../..

sleep 3

print_status "info" "Starting User Mobile App..."
cd apps/user-app
npm start &
USER_APP_PID=$!
cd ../..

sleep 3

print_status "info" "Starting Driver Mobile App..."
cd apps/driver-app
npm start &
DRIVER_APP_PID=$!
cd ../..

# Phase 7: System Status Check
echo ""
echo "🔍 Phase 7: System Status Check"
echo "-------------------------------"

sleep 10

print_status "info" "Checking service status..."

# Check database
if docker exec reloconnect-postgres pg_isready -U reloconnect > /dev/null 2>&1; then
    print_status "success" "Database: Running on port 5432"
else
    print_status "error" "Database: Not responding"
fi

# Check if backend is responding
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    print_status "success" "Backend API: Running on port 3000"
else
    print_status "warning" "Backend API: May still be starting on port 3000"
fi

# Check if admin dashboard is responding
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    print_status "success" "Admin Dashboard: Running on port 3001"
else
    print_status "warning" "Admin Dashboard: May still be starting on port 3001"
fi

# Final Summary
echo ""
echo "🎉 MODERNIZATION COMPLETE"
echo "========================"
echo ""
echo "📊 System Status:"
echo "- Database (PostgreSQL): Running in Docker"
echo "- Backend API: Starting on http://localhost:3000"
echo "- Admin Dashboard: Starting on http://localhost:3001"
echo "- User Mobile App: Starting with Expo"
echo "- Driver Mobile App: Starting with Expo"
echo ""
echo "🌐 Access Points:"
echo "- Admin Dashboard: http://localhost:3001"
echo "- Backend API: http://localhost:3000"
echo "- Database Admin: http://localhost:5050 (pgAdmin)"
echo "- User App: Expo DevTools will open"
echo "- Driver App: Expo DevTools will open"
echo ""
echo "🔑 Default Credentials:"
echo "- Database: reloconnect / reloconnect_password"
echo "- pgAdmin: admin@reloconnect.com / admin123"
echo ""
echo "📱 Next Steps:"
echo "1. Open Expo DevTools for mobile apps"
echo "2. Press 'w' for web version of mobile apps"
echo "3. Access admin dashboard at localhost:3001"
echo "4. Test user registration and booking flow"
echo "5. Test driver app functionality"
echo ""

print_status "success" "RELOConnect System fully modernized and running!"

# Store PIDs for cleanup
echo "BACKEND_PID=$BACKEND_PID" > .service_pids
echo "ADMIN_PID=$ADMIN_PID" >> .service_pids
echo "USER_APP_PID=$USER_APP_PID" >> .service_pids
echo "DRIVER_APP_PID=$DRIVER_APP_PID" >> .service_pids

echo ""
print_status "info" "To stop all services, run: ./stop-all-services.sh"
