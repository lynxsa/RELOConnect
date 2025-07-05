#!/bin/bash

echo "🔍 RELOConnect System Health Check"
echo "=================================="

# Check Node.js version
echo "📦 Node.js version:"
node --version

# Check if PostgreSQL is running
echo "🐘 PostgreSQL status:"
docker exec reloconnect-postgres pg_isready -U reloconnect

# Check if database exists
echo "🗃️  Database connection:"
docker exec reloconnect-postgres psql -U reloconnect -c "SELECT datname FROM pg_database WHERE datname='reloconnect';"

# Check backend dependencies
echo "🔧 Backend dependencies:"
cd backend && npm list --depth=0 | head -5

# Check if Prisma client is generated
echo "🔄 Prisma client status:"
cd backend && npx prisma version

# Check TypeScript compilation
echo "📝 TypeScript compilation:"
cd backend && npx tsc --noEmit

echo "✅ Health check complete!"
