#!/bin/bash

# RELOConnect User App Dependency Fix
echo "🔧 Fixing RELOConnect User App Dependencies..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Navigate to user app directory
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app"

echo -e "${YELLOW}🧹 Cleaning up dependencies...${NC}"

# Remove problematic dependencies
rm -rf node_modules
rm -f package-lock.json

echo -e "${YELLOW}📦 Installing dependencies with legacy peer deps...${NC}"

# Install with legacy peer deps to resolve conflicts
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
    
    echo -e "${YELLOW}🧹 Clearing Expo cache...${NC}"
    npx expo start --clear
else
    echo -e "${RED}❌ Installation failed${NC}"
    echo -e "${YELLOW}💡 Trying alternative approach...${NC}"
    
    # Alternative: try with force
    npm install --force
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed with force flag${NC}"
        npx expo start --clear
    else
        echo -e "${RED}❌ Both installation methods failed${NC}"
        echo -e "${YELLOW}💡 Please try manual installation${NC}"
    fi
fi
