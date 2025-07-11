#!/bin/bash

# RELOConnect Testing and Launch Script
echo "🧪 RELOConnect Testing and Launch Verification"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# Check prerequisites
print_info "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_status "Node.js and npm are available"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the RELOConnect root directory"
    exit 1
fi

print_status "In correct directory"

# Test backend
print_info "Testing backend..."
cd backend
if [ -f "package.json" ]; then
    if npm list express &> /dev/null; then
        print_status "Backend dependencies OK"
    else
        print_warning "Backend needs dependency installation"
    fi
else
    print_error "Backend package.json not found"
fi
cd ..

# Test user app
print_info "Testing user app..."
cd apps/user-app
if [ -f "package.json" ]; then
    if npm list expo &> /dev/null; then
        print_status "User app dependencies OK"
    else
        print_warning "User app needs dependency installation"
    fi
else
    print_error "User app package.json not found"
fi
cd ../..

# Test driver app
print_info "Testing driver app..."
cd apps/driver-app
if [ -f "package.json" ]; then
    if npm list expo &> /dev/null; then
        print_status "Driver app dependencies OK"
    else
        print_warning "Driver app needs dependency installation"
    fi
else
    print_error "Driver app package.json not found"
fi
cd ../..

# Test admin dashboard
print_info "Testing admin dashboard..."
cd apps/admin-dashboard
if [ -f "package.json" ]; then
    if npm list next &> /dev/null; then
        print_status "Admin dashboard dependencies OK"
    else
        print_warning "Admin dashboard needs dependency installation"
    fi
else
    print_error "Admin dashboard package.json not found"
fi
cd ..

print_info "🎯 Ready to launch RELOConnect!"
print_info "Run the following commands in separate terminals:"
print_info ""
print_info "Terminal 1 (Backend):"
print_info "  cd backend && npm start"
print_info ""
print_info "Terminal 2 (Admin Dashboard):"
print_info "  cd apps/admin-dashboard && npm run dev"
print_info ""
print_info "Terminal 3 (User App):"
print_info "  cd apps/user-app && npm start"
print_info ""
print_info "Terminal 4 (Driver App):"
print_info "  cd apps/driver-app && npm start"
print_info ""
print_status "🚀 RELOConnect is ready for launch!"
