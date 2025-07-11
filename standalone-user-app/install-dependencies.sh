#!/bin/bash

# RELOConnect User App Installation and Fix Script
echo "🚀 Installing dependencies and fixing RELOConnect User App..."

# Navigate to user-app directory
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app"

# Install missing navigation dependencies
echo "📦 Installing navigation dependencies..."
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/stack --legacy-peer-deps

# Install UI and utility dependencies
echo "📦 Installing UI and utility dependencies..."
npm install expo-linear-gradient @expo/vector-icons --legacy-peer-deps

# Install React types
echo "📦 Installing type definitions..."
npm install @types/react @types/react-native --save-dev --legacy-peer-deps

# Clear cache and node_modules for clean install
echo "🧹 Cleaning cache..."
npm cache clean --force
rm -rf node_modules
rm -rf .expo

# Reinstall all dependencies
echo "📦 Reinstalling all dependencies..."
npm install --legacy-peer-deps

# Install Expo CLI globally if not present
echo "🔧 Checking Expo CLI..."
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI..."
    npm install -g @expo/cli
fi

echo "✅ Installation complete!"
echo "🎯 To start the app, run: npm start"
echo "📱 Then scan the QR code with Expo Go app"
