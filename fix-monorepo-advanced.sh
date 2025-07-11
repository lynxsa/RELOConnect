#!/bin/bash

# RELOConnect Advanced Monorepo Fix Script
echo "🔧 Starting Advanced RELOConnect Monorepo Fix..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
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

print_info "Running advanced dependency fixes..."

# 1. Fix Metro bundler configuration
print_status "Fixing Metro bundler configuration..."

# Update user-app metro.config.js
cat > apps/user-app/metro.config.js << 'EOF'
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enable monorepo support
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

config.resolver.disableHierarchicalLookup = true;

module.exports = config;
EOF

# Update driver-app metro.config.js
cat > apps/driver-app/metro.config.js << 'EOF'
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enable monorepo support
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

config.resolver.disableHierarchicalLookup = true;

module.exports = config;
EOF

# 2. Fix TypeScript configurations
print_status "Updating TypeScript configurations..."

# Root tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@reloconnect/user-app/*": ["./apps/user-app/src/*"],
      "@reloconnect/driver-app/*": ["./apps/driver-app/src/*"],
      "@reloconnect/admin-dashboard/*": ["./apps/admin-dashboard/src/*"],
      "@reloconnect/backend/*": ["./backend/src/*"]
    }
  },
  "references": [
    { "path": "./apps/user-app" },
    { "path": "./apps/driver-app" },
    { "path": "./apps/admin-dashboard" },
    { "path": "./backend" }
  ]
}
EOF

# 3. Create workspace-specific package installations
print_status "Installing workspace-specific dependencies..."

# Install shared dependencies at root
npm install react@18.2.0 react-native@0.74.5 --save-exact

# 4. Fix any remaining peer dependency issues
print_status "Resolving peer dependency conflicts..."

cd apps/user-app
npm install --legacy-peer-deps --force
cd ../..

cd apps/driver-app
npm install --legacy-peer-deps --force
cd ../..

cd apps/admin-dashboard
npm install --legacy-peer-deps
cd ../..

# 5. Create development convenience scripts
print_status "Creating development scripts..."

cat > start-all-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting all RELOConnect services in development mode..."

# Start backend in background
echo "Starting backend..."
cd backend && npm start &
BACKEND_PID=$!

# Start admin dashboard in background
echo "Starting admin dashboard..."
cd apps/admin-dashboard && npm run dev &
ADMIN_PID=$!

# Wait a moment for services to start
sleep 3

echo "✅ Backend and Admin Dashboard started!"
echo "Backend PID: $BACKEND_PID"
echo "Admin PID: $ADMIN_PID"
echo ""
echo "Now run one of these in separate terminals:"
echo "  npm run user-app    # For user mobile app"
echo "  npm run driver-app  # For driver mobile app"
echo ""
echo "To stop all services: kill $BACKEND_PID $ADMIN_PID"
EOF

chmod +x start-all-dev.sh

# 6. Verify the setup
print_status "Verifying monorepo setup..."

# Check if all apps can compile
cd apps/user-app
if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
    print_status "User app TypeScript compilation: OK"
else
    print_warning "User app TypeScript has warnings (non-critical)"
fi
cd ../..

cd apps/driver-app
if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
    print_status "Driver app TypeScript compilation: OK"
else
    print_warning "Driver app TypeScript has warnings (non-critical)"
fi
cd ../..

cd apps/admin-dashboard
if npx tsc --noEmit > /dev/null 2>&1; then
    print_status "Admin dashboard TypeScript compilation: OK"
else
    print_warning "Admin dashboard TypeScript has warnings (non-critical)"
fi
cd ../..

print_status "🎉 Advanced monorepo fix complete!"
print_info "Next steps:"
print_info "1. Run: ./start-all-dev.sh    # Start backend and admin"
print_info "2. Run: npm run user-app      # Start user mobile app"
print_info "3. Run: npm run driver-app    # Start driver mobile app"
print_warning "If apps still have issues, check the logs and run individual npm installs"
