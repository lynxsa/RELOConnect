#!/bin/bash

echo "RELOConnect - Installing Dependencies and Fixing TypeScript Errors"
echo "=================================================================="

# Navigate to project directory
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect"

echo "Current directory: $(pwd)"

# Check if we have package.json
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

echo "✅ Found package.json"

# Try to install dependencies with npm
echo "🔄 Installing dependencies with npm..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✅ npm install completed successfully"
else
    echo "❌ npm install failed, trying with yarn..."
    yarn install
    
    if [ $? -eq 0 ]; then
        echo "✅ yarn install completed successfully"
    else
        echo "❌ Both npm and yarn failed. Please install dependencies manually."
        exit 1
    fi
fi

# Check if node_modules/@types/react exists
if [ -d "node_modules/@types/react" ]; then
    echo "✅ @types/react installed correctly"
else
    echo "❌ @types/react not found, trying to install manually..."
    npm install @types/react@18.3.12 @types/react-native@0.73.0
fi

# Check TypeScript compilation
echo "🔄 Checking TypeScript compilation..."
npx tsc --noEmit --skipLibCheck

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful!"
else
    echo "⚠️  TypeScript compilation has errors, but dependencies are installed"
fi

echo "✅ Setup complete!"
