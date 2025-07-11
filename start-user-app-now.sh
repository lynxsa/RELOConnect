#!/bin/bash

echo "🚀 Starting RELOConnect User App"

# Navigate to user app directory
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app"

# Kill any existing processes
pkill -f "expo" || true
pkill -f "node.*8082" || true

# Clear cache
rm -rf .expo/
npm cache clean --force

echo "📱 Starting Expo development server..."
npx expo start --clear --port 8082
