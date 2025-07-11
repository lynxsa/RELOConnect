#!/bin/bash

echo "🚀 Starting RELOConnect Admin Dashboard"
echo "========================================="

# Navigate to admin dashboard directory
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/admin-dashboard"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Start the development server
echo "🏃‍♂️ Starting development server on port 3001..."
npm run dev
