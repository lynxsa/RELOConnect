#!/bin/bash

# RELOConnect Week 1 Quick Start Script
# This script executes the critical debugging tasks for Week 1

set -e  # Exit on any error

echo "🚀 RELOConnect Week 1: Critical Debugging & App Restoration"
echo "=========================================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check prerequisites
log "Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

if ! command_exists watchman; then
    echo "⚠️  Watchman is not installed. Installing via Homebrew..."
    brew install watchman
fi

# Step 1: Clear all caches and remove build artifacts
log "Step 1: Clearing caches and removing build artifacts..."

# Remove node_modules in all directories
log "Removing node_modules directories..."
find . -name "node_modules" -type d -prune -exec rm -rf {} +

# Remove build artifacts
log "Removing build artifacts..."
rm -rf .expo
rm -rf dist
rm -rf ios/build 2>/dev/null || true
rm -rf android/build 2>/dev/null || true
rm -rf android/.gradle 2>/dev/null || true
rm -rf ios/DerivedData 2>/dev/null || true

# Clear watchman cache
log "Clearing watchman cache..."
watchman watch-del-all

# Clear npm cache
log "Clearing npm cache..."
npm cache clean --force

# Clear yarn cache if yarn is installed
if command_exists yarn; then
    log "Clearing yarn cache..."
    yarn cache clean
fi

# Clear pnpm cache if pnpm is installed
if command_exists pnpm; then
    log "Clearing pnpm cache..."
    pnpm store prune
fi

# Step 2: Reinstall dependencies
log "Step 2: Reinstalling dependencies..."

# Install root dependencies
log "Installing root dependencies..."
npm install

# Install backend dependencies
if [ -d "backend" ]; then
    log "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Install admin-dashboard dependencies
if [ -d "admin-dashboard" ]; then
    log "Installing admin-dashboard dependencies..."
    cd admin-dashboard
    npm install
    cd ..
fi

# Step 3: Fix app.json configuration
log "Step 3: Checking app.json configuration..."

# Check if app.json exists and configure Hermes
if [ -f "app.json" ]; then
    # Create backup
    cp app.json app.json.backup
    
    # Check if Hermes is configured
    if ! grep -q '"jsEngine"' app.json; then
        log "Adding Hermes configuration to app.json..."
        # Use node to modify JSON safely
        node -e "
        const fs = require('fs');
        const config = JSON.parse(fs.readFileSync('app.json', 'utf8'));
        if (!config.expo.jsEngine) {
            config.expo.jsEngine = 'hermes';
            fs.writeFileSync('app.json', JSON.stringify(config, null, 2));
            console.log('✅ Added Hermes configuration');
        } else {
            console.log('✅ Hermes already configured');
        }
        "
    else
        log "✅ Hermes already configured in app.json"
    fi
else
    log "⚠️  app.json not found"
fi

# Step 4: Verify entry point registration
log "Step 4: Verifying entry point registration..."

if [ -f "index.js" ]; then
    log "✅ index.js found"
    # Check if it properly registers the app
    if grep -q "registerRootComponent\|AppRegistry" index.js; then
        log "✅ App registration found in index.js"
    else
        log "⚠️  App registration not found in index.js"
    fi
else
    log "⚠️  index.js not found"
fi

# Step 5: Check Metro and Babel configuration
log "Step 5: Checking Metro and Babel configuration..."

if [ -f "metro.config.js" ]; then
    log "✅ metro.config.js found"
else
    log "⚠️  metro.config.js not found - creating default config..."
    cat > metro.config.js << 'EOF'
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
EOF
    log "✅ Created default metro.config.js"
fi

if [ -f "babel.config.js" ]; then
    log "✅ babel.config.js found"
    # Check if it includes babel-preset-expo
    if grep -q "babel-preset-expo" babel.config.js; then
        log "✅ babel-preset-expo found in babel.config.js"
    else
        log "⚠️  babel-preset-expo not found in babel.config.js"
    fi
else
    log "⚠️  babel.config.js not found - creating default config..."
    cat > babel.config.js << 'EOF'
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
EOF
    log "✅ Created default babel.config.js"
fi

# Step 6: Generate Prisma client if needed
if [ -d "backend/prisma" ]; then
    log "Step 6: Generating Prisma client..."
    cd backend
    npx prisma generate
    cd ..
    log "✅ Prisma client generated"
fi

# Step 7: Try starting Expo with clear cache
log "Step 7: Starting Expo development server..."

echo ""
echo "🎉 Week 1 setup complete! Now starting Expo..."
echo ""
echo "If you encounter any errors, try these additional steps:"
echo "1. npx expo start --clear"
echo "2. npx expo start --dev-client"
echo "3. Check the terminal output for specific error messages"
echo ""

# Start Expo with clear cache
npx expo start --clear

echo ""
echo "✅ Week 1 Quick Start Script Completed!"
echo ""
echo "Next steps:"
echo "1. Test the app on iOS and Android devices"
echo "2. Verify that HMR (Hot Module Reloading) works"
echo "3. If errors persist, check the detailed debugging guide"
echo "4. Once stable, proceed to Week 2 tasks"
echo ""
