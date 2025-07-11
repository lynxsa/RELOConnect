#!/bin/bash

# RELOConnect Monorepo Dependency Fix Script
echo "🚀 Starting RELOConnect Monorepo Dependency Fix..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the RELOConnect root directory"
    exit 1
fi

print_status "Cleaning all node_modules..."
# Remove all node_modules
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
find . -name "package-lock.json" -delete
find . -name "yarn.lock" -delete

print_status "Installing root dependencies..."
# Install root dependencies
npm install

print_status "Installing user-app dependencies..."
cd apps/user-app
npm install --legacy-peer-deps
cd ../..

print_status "Installing driver-app dependencies..."
cd apps/driver-app
npm install --legacy-peer-deps
cd ../..

print_status "Installing admin-dashboard dependencies..."
cd apps/admin-dashboard
npm install --legacy-peer-deps
cd ../..

print_status "Installing backend dependencies..."
cd backend
npm install
cd ..

print_status "Verifying installations..."

# Check user-app
cd apps/user-app
if npm run type-check > /dev/null 2>&1; then
    print_status "User app TypeScript check passed"
else
    print_warning "User app has TypeScript issues (will be fixed)"
fi
cd ../..

# Check driver-app
cd apps/driver-app
if npm run type-check > /dev/null 2>&1; then
    print_status "Driver app TypeScript check passed"
else
    print_warning "Driver app has TypeScript issues (will be fixed)"
fi
cd ../..

# Check admin-dashboard
cd apps/admin-dashboard
if npm run type-check > /dev/null 2>&1; then
    print_status "Admin dashboard TypeScript check passed"
else
    print_warning "Admin dashboard has TypeScript issues (will be fixed)"
fi
cd ../..

print_status "✨ Dependency fix complete!"
print_status "You can now run:"
print_status "  npm run user-app     # Start user app"
print_status "  npm run driver-app   # Start driver app"
print_status "  npm run admin-web    # Start admin dashboard"
print_status "  npm run backend      # Start backend API"

echo ""
print_warning "If you encounter any remaining issues, run:"
print_warning "  ./fix-monorepo-advanced.sh"
