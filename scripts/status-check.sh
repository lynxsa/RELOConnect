#!/bin/bash

# Quick status check for RELOConnect services

echo "🔍 RELOConnect Services Status Check"
echo "===================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check Docker
print_status "Checking Docker status..."
if docker ps >/dev/null 2>&1; then
    print_success "Docker is running"
    
    # Check PostgreSQL container
    if docker ps | grep -q "reloconnect-postgres"; then
        print_success "PostgreSQL container is running"
    else
        print_error "PostgreSQL container is not running"
        echo "  Run: docker-compose up -d postgres"
    fi
else
    print_error "Docker is not running"
fi

# Check ports
print_status "Checking service ports..."

# PostgreSQL (5432)
if nc -z localhost 5432 2>/dev/null; then
    print_success "PostgreSQL is accessible on port 5432"
else
    print_error "PostgreSQL is not accessible on port 5432"
fi

# Backend API (3000)
if nc -z localhost 3000 2>/dev/null; then
    print_success "Backend API is running on port 3000"
    
    # Test health endpoint
    if curl -s http://localhost:3000/health >/dev/null; then
        print_success "Backend API health check passed"
    else
        print_warning "Backend API is running but health check failed"
    fi
else
    print_error "Backend API is not running on port 3000"
    echo "  Run: cd backend && npm run dev"
fi

# Admin Dashboard (3001)
if nc -z localhost 3001 2>/dev/null; then
    print_success "Admin Dashboard is running on port 3001"
else
    print_error "Admin Dashboard is not running on port 3001"
    echo "  Run: cd apps/admin-dashboard && npm run dev"
fi

echo ""
print_status "Quick access URLs:"
echo "  • Admin Dashboard: http://localhost:3001"
echo "  • Backend API: http://localhost:3000"
echo "  • Database Studio: cd backend && npx prisma studio"
echo ""
print_status "Mobile App Testing:"
echo "  • Run: cd apps/user-app && npm start"
echo "  • Then scan QR code with Expo Go app"
echo ""

# Check if all services are running
all_running=true
if ! docker ps | grep -q "reloconnect-postgres"; then all_running=false; fi
if ! nc -z localhost 3000 2>/dev/null; then all_running=false; fi
if ! nc -z localhost 3001 2>/dev/null; then all_running=false; fi

if $all_running; then
    print_success "All core services are running! Ready for testing 🎉"
else
    print_warning "Some services are not running. Use 'bash scripts/start-testing.sh' to start all services"
fi
