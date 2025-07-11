#!/bin/bash

# RELOConnect User App Startup Script
echo "🚀 Starting RELOConnect User App..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Navigate to user app directory
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Not in user app directory. Please check the path.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found user app directory${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

echo -e "${YELLOW}🧹 Starting Expo development server...${NC}"
echo -e "\n${GREEN}🎉 RELOConnect User App is starting!${NC}"
echo -e "\n${YELLOW}📱 Available options once started:${NC}"
echo -e "• Press 'i' to open iOS simulator"
echo -e "• Press 'a' to open Android emulator" 
echo -e "• Press 'w' to open in web browser"
echo -e "• Press 'r' to reload the app"
echo -e "• Press 'q' to quit"

echo -e "\n${YELLOW}💡 The Expo development server will start now...${NC}"

# Start Expo with clear cache
npx expo start --clear
