#!/bin/bash

echo "🔧 Fixing Admin Dashboard Dependencies and TypeScript Issues..."

# Navigate to admin dashboard
cd "apps/admin-dashboard"

# Remove problematic files
rm -rf node_modules package-lock.json .next

# Install dependencies
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Install specific React types
npm install --save-dev @types/react@18.2.45 @types/react-dom@18.2.45

# Install lucide-react specifically
npm install lucide-react@^0.454.0

echo "✅ Admin Dashboard dependencies fixed!"
echo "Now test with: cd apps/admin-dashboard && npm run dev"
