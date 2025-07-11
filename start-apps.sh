#!/bin/bash

echo "🚀 Starting RELOConnect Apps"

# Kill any existing processes
pkill -f "expo" || true
pkill -f "node.*expo" || true

# Start User App in background
echo "📱 Starting User App..."
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app"
npm start &
USER_PID=$!

# Wait a bit
sleep 3

# Start Driver App in background
echo "🚗 Starting Driver App..."
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/driver-app"
npm start &
DRIVER_PID=$!

echo "✅ Both apps started!"
echo "User App PID: $USER_PID"
echo "Driver App PID: $DRIVER_PID"
echo ""
echo "To stop apps: kill $USER_PID $DRIVER_PID"
echo "Or run: pkill -f expo"

# Wait for user input
echo "Press Ctrl+C to stop both apps..."
wait
