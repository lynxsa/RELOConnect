#!/bin/bash

echo "🔧 Fixing RELOConnect Apps - Comprehensive Solution"

# Kill any existing processes
echo "Killing existing processes..."
pkill -f "expo" || true
pkill -f "node.*expo" || true

# Fix User App
echo "📱 Fixing User App..."
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app"

# Update package.json to use regular React Navigation instead of Expo Router
echo "Updating user app package.json..."
cat > package.json << 'EOF'
{
  "name": "@reloconnect/user-app",
  "version": "1.0.0",
  "main": "index.ts",
  "private": true,
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build": "expo export",
    "dev": "expo start --dev-client",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "type-check": "tsc --noEmit",
    "test": "jest"
  },
  "dependencies": {
    "@expo/vector-icons": "^14.1.0",
    "@react-native-async-storage/async-storage": "2.1.2",
    "@react-navigation/bottom-tabs": "^7.3.10",
    "@react-navigation/native": "^7.1.6",
    "@react-navigation/stack": "^7.1.6",
    "@tanstack/react-query": "^5.81.5",
    "axios": "^1.10.0",
    "expo": "~53.0.17",
    "expo-camera": "^16.1.10",
    "expo-font": "~13.3.2",
    "expo-linear-gradient": "~14.1.0",
    "expo-location": "~18.1.6",
    "expo-maps": "0.11.0",
    "expo-notifications": "~0.31.4",
    "expo-status-bar": "~2.2.3",
    "nativewind": "^4.1.23",
    "react": "18.2.0",
    "react-native": "0.74.5",
    "react-native-gesture-handler": "~2.24.0",
    "react-native-maps": "1.20.1",
    "react-native-reanimated": "~3.17.4",
    "react-native-safe-area-context": "5.4.0",
    "react-native-screens": "4.11.1",
    "socket.io-client": "^4.8.1",
    "tailwindcss": "^3.4.17",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@babel/core": "^7.26.0",
    "@types/react": "~18.2.45",
    "babel-preset-expo": "^13.2.3",
    "typescript": "~5.8.3"
  }
}
EOF

# Install dependencies
echo "Installing user app dependencies..."
npm install

# Fix Driver App
echo "📱 Fixing Driver App..."
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/driver-app"

# Update package.json to include expo-router
echo "Updating driver app package.json..."
cat > package.json << 'EOF'
{
  "name": "@reloconnect/driver-app",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "private": true,
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build": "expo export",
    "dev": "expo start --dev-client",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "type-check": "tsc --noEmit",
    "test": "jest"
  },
  "dependencies": {
    "@expo/vector-icons": "^14.1.0",
    "@react-native-async-storage/async-storage": "2.1.2",
    "@react-navigation/bottom-tabs": "^7.3.10",
    "@react-navigation/native": "^7.1.6",
    "@react-navigation/stack": "^7.1.6",
    "@tanstack/react-query": "^5.81.5",
    "axios": "^1.10.0",
    "expo": "~53.0.17",
    "expo-camera": "^16.1.10",
    "expo-font": "~13.3.2",
    "expo-linear-gradient": "~14.1.0",
    "expo-location": "~18.0.7",
    "expo-maps": "0.11.0",
    "expo-notifications": "~0.31.4",
    "expo-router": "~5.1.3",
    "expo-status-bar": "~2.2.3",
    "nativewind": "^4.1.23",
    "react": "18.2.0",
    "react-native": "0.74.5",
    "react-native-gesture-handler": "~2.24.0",
    "react-native-maps": "1.20.1",
    "react-native-reanimated": "~3.17.4",
    "react-native-safe-area-context": "5.4.0",
    "react-native-screens": "4.11.1",
    "socket.io-client": "^4.8.1",
    "tailwindcss": "^3.4.17",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@babel/core": "^7.26.0",
    "@types/react": "~18.2.45",
    "babel-preset-expo": "^13.2.3",
    "typescript": "~5.8.3"
  }
}
EOF

# Install dependencies
echo "Installing driver app dependencies..."
npm install

echo "✅ Both apps fixed! Ready to run."
echo ""
echo "To start User App: cd apps/user-app && npm start"
echo "To start Driver App: cd apps/driver-app && npm start"
