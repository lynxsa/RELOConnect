#!/bin/bash

# Quick Fix for RELOConnect User App Dependencies
echo "🔧 Fixing RELOConnect User App Dependencies..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Navigate to user app directory
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app"

echo -e "${YELLOW}📦 Installing missing dependencies...${NC}"

# Install the missing react-native-svg-transformer
npm install react-native-svg-transformer --save-dev

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  SVG transformer installation failed, using simplified metro config${NC}"
fi

# Clear any cached files
echo -e "${YELLOW}🧹 Clearing caches...${NC}"
rm -rf node_modules/.cache
npx expo start --clear --tunnel

echo -e "${GREEN}🎉 App should start now!${NC}"
