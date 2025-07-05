#!/bin/bash

echo "🧹 RELOConnect Comprehensive Cleanup & Setup"
echo "=============================================="

# Step 1: Clean up problematic files and directories
echo "📁 Cleaning up problematic files..."
rm -rf node_modules
rm -rf .expo
rm -rf dist
rm -rf build
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml

# Step 2: Remove conflicting configuration files
echo "⚙️  Cleaning configuration files..."
find . -name "jest.config.js" -not -path "./node_modules/*" -delete
find . -name "babel.config.js" -not -path "./node_modules/*" -delete
find . -name "metro.config.js" -not -path "./node_modules/*" -delete

# Step 3: Remove all test files temporarily
echo "🧪 Removing test files temporarily..."
find . -name "*.test.ts" -not -path "./node_modules/*" -delete
find . -name "*.test.tsx" -not -path "./node_modules/*" -delete
find . -name "*.spec.ts" -not -path "./node_modules/*" -delete
find . -name "*.spec.tsx" -not -path "./node_modules/*" -delete
rm -rf __tests__

# Step 4: Clean up workspace folders that might cause conflicts
echo "📦 Cleaning workspace conflicts..."
rm -rf apps/*/node_modules
rm -rf services/*/node_modules
rm -rf libs/*/node_modules

# Step 5: Install dependencies
echo "📥 Installing dependencies..."
npm install --legacy-peer-deps

# Step 6: Generate Expo configuration
echo "🔧 Setting up Expo..."
npx expo install --fix

echo "✅ Cleanup completed!"
echo ""
echo "🚀 Ready to test with: npm start"
