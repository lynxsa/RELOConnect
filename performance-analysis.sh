#!/bin/bash

echo "🔍 RELOConnect Performance Analysis"
echo "=================================="

# Check bundle sizes
echo "📦 Analyzing bundle sizes..."

# User App
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app"
echo "📱 User App Bundle Analysis:"
if [ -f "package.json" ]; then
    echo "Dependencies: $(cat package.json | jq '.dependencies | length')"
    echo "DevDependencies: $(cat package.json | jq '.devDependencies | length')"
    npx expo export --platform web --dev false --clear 2>/dev/null || echo "Expo export not available"
fi

# Driver App
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/driver-app"
echo "🚗 Driver App Bundle Analysis:"
if [ -f "package.json" ]; then
    echo "Dependencies: $(cat package.json | jq '.dependencies | length')"
    echo "DevDependencies: $(cat package.json | jq '.devDependencies | length')"
fi

# Admin Dashboard
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/admin-dashboard"
echo "🏢 Admin Dashboard Bundle Analysis:"
if [ -f "package.json" ]; then
    echo "Dependencies: $(cat package.json | jq '.dependencies | length')"
    echo "DevDependencies: $(cat package.json | jq '.devDependencies | length')"
    npm run build 2>/dev/null || echo "Build command not available"
fi

# Backend
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend"
echo "🚀 Backend Bundle Analysis:"
if [ -f "package.json" ]; then
    echo "Dependencies: $(cat package.json | jq '.dependencies | length')"
    echo "DevDependencies: $(cat package.json | jq '.devDependencies | length')"
fi

echo "✅ Performance analysis complete"
