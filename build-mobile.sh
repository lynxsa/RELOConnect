#!/bin/bash

echo "🚀 RELOConnect Mobile App Build Script"
echo "======================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "Starting mobile app build process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found! Please run this script from the project root."
    exit 1
fi

print_status "Found package.json, proceeding..."

# Try different build approaches
print_status "Attempting to build mobile app..."

# First, try to install dependencies using different package managers
print_status "Trying to resolve dependencies..."

# Option 1: Try with npm cache clean
print_status "Cleaning npm cache..."
npm cache clean --force 2>/dev/null || true

# Option 2: Try building user-app specifically
if [ -d "apps/user-app" ]; then
    print_status "Found user-app directory, attempting build..."
    cd apps/user-app
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_warning "No node_modules found in user-app, dependencies may need to be installed"
    fi
    
    # Try to run Expo prebuild first (might help with dependencies)
    print_status "Running Expo prebuild..."
    npx expo prebuild --clear || print_warning "Prebuild failed, continuing..."
    
    # Try building for web (usually easier)
    print_status "Attempting web build..."
    npx expo export:web || print_warning "Web export failed"
    
    # Try standard expo export
    print_status "Attempting standard export..."
    npx expo export || print_warning "Standard export failed"
    
    cd ../..
fi

# Option 3: Try building from root
print_status "Attempting build from root directory..."
npx expo export || print_warning "Root export failed"

# Option 4: Build for development (might be easier)
print_status "Attempting development build..."
npx expo build:web || print_warning "Development build failed"

print_status "Build attempts completed. Check above for any successful builds."

# Show final status
if [ -d "dist" ] || [ -d "apps/user-app/dist" ] || [ -d "web-build" ] || [ -d "apps/user-app/web-build" ]; then
    print_success "Build output found! Check 'dist' or 'web-build' directories."
else
    print_warning "No build output found. The app may need dependency fixes before building."
    print_status "To fix dependencies, try:"
    echo "  1. npm install --legacy-peer-deps"
    echo "  2. Or fix package.json version conflicts"
    echo "  3. Or use expo start for development instead of building"
fi

print_status "Mobile app build script completed."
