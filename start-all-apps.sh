#!/bin/bash

# RELOConnect Multi-App Launcher
# This script starts all applications in the RELOConnect system

echo "🚀 Starting RELOConnect System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -Pi :$port -sTCP:LISTEN -t)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Killing process $pid on port $port${NC}"
        kill -9 $pid
        sleep 2
    fi
}

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Shutting down all services...${NC}"
    kill_port 5000  # Backend
    kill_port 3001  # Admin dashboard
    kill_port 8000  # User app metro
    kill_port 8081  # Driver app metro
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}=== Starting Database ===${NC}"
# Start PostgreSQL database
docker-compose up -d

echo -e "\n${BLUE}=== Starting Backend Server ===${NC}"
# Kill any existing process on port 5000
kill_port 5000

# Start backend
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo -e "${YELLOW}Waiting for backend to start...${NC}"
sleep 10

echo -e "\n${BLUE}=== Starting Admin Dashboard ===${NC}"
# Kill any existing process on port 3001
kill_port 3001

# Start admin dashboard
cd apps/admin-dashboard
# Fix workspace issues by using standalone versions
npm run dev &
ADMIN_PID=$!
cd ../..

echo -e "\n${BLUE}=== Starting User App (React Native) ===${NC}"
# Kill any existing metro processes
kill_port 8000

# Start user app
cd apps/user-app
# Use npx to avoid workspace issues
npx expo start --port 8000 --no-dev --minify &
USER_APP_PID=$!
cd ../..

echo -e "\n${BLUE}=== Starting Driver App (React Native) ===${NC}"
# Kill any existing metro processes
kill_port 8081

# Start driver app
cd apps/driver-app
# Use npx to avoid workspace issues
npx expo start --port 8081 --no-dev --minify &
DRIVER_APP_PID=$!
cd ../..

echo -e "\n${GREEN}=== RELOConnect System Started! ===${NC}"
echo -e "${GREEN}✅ Database:        PostgreSQL running on port 5432${NC}"
echo -e "${GREEN}✅ Backend API:     http://localhost:5000${NC}"
echo -e "${GREEN}✅ Admin Dashboard: http://localhost:3001${NC}"
echo -e "${GREEN}✅ User App:        Expo Metro on port 8000${NC}"
echo -e "${GREEN}✅ Driver App:      Expo Metro on port 8081${NC}"

echo -e "\n${YELLOW}Access URLs:${NC}"
echo -e "📱 Scan QR codes in terminal for mobile apps"
echo -e "🌐 Admin Dashboard: http://localhost:3001"
echo -e "🔗 API Health: http://localhost:5000/health"
echo -e "🗄️ pgAdmin: http://localhost:5050"

echo -e "\n${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for all processes
wait
