#!/bin/bash

# Script to stop all RELOConnect testing services

echo "🛑 Stopping RELOConnect Testing Services"
echo "========================================"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Stop backend if PID file exists
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        print_status "Stopping backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
        print_success "Backend server stopped"
    fi
    rm .backend.pid
fi

# Stop admin dashboard if PID file exists
if [ -f ".admin.pid" ]; then
    ADMIN_PID=$(cat .admin.pid)
    if kill -0 $ADMIN_PID 2>/dev/null; then
        print_status "Stopping admin dashboard (PID: $ADMIN_PID)..."
        kill $ADMIN_PID
        print_success "Admin dashboard stopped"
    fi
    rm .admin.pid
fi

# Stop any remaining Node.js processes on our ports
print_status "Checking for remaining processes on ports 3000, 3001..."

# Kill processes on port 3000 (backend)
PORT_3000_PID=$(lsof -ti:3000)
if [ ! -z "$PORT_3000_PID" ]; then
    print_status "Stopping process on port 3000..."
    kill $PORT_3000_PID
    print_success "Process on port 3000 stopped"
fi

# Kill processes on port 3001 (admin dashboard)
PORT_3001_PID=$(lsof -ti:3001)
if [ ! -z "$PORT_3001_PID" ]; then
    print_status "Stopping process on port 3001..."
    kill $PORT_3001_PID
    print_success "Process on port 3001 stopped"
fi

# Optionally stop Docker containers
read -p "Do you want to stop the PostgreSQL Docker container? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Stopping PostgreSQL container..."
    docker-compose down
    print_success "PostgreSQL container stopped"
else
    print_status "Keeping PostgreSQL container running"
fi

print_success "All services stopped! 🎉"
