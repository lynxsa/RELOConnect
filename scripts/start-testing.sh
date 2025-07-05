#!/bin/bash

# RELOConnect Complete Testing Setup & Verification Script
# This script will help you test both the mobile app and admin dashboard

echo "🚀 RELOConnect Testing Setup & Verification"
echo "=============================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local timeout=60
    local count=0
    
    print_status "Waiting for $service_name to be ready..."
    while ! curl -s "$url" >/dev/null && [ $count -lt $timeout ]; do
        sleep 1
        count=$((count + 1))
        printf "."
    done
    echo ""
    
    if [ $count -lt $timeout ]; then
        print_success "$service_name is ready!"
        return 0
    else
        print_error "$service_name failed to start within $timeout seconds"
        return 1
    fi
}

echo "📋 Step 1: Environment Check"
echo "----------------------------"

# Check required tools
print_status "Checking required tools..."

required_tools=("node" "npm" "docker" "docker-compose")
missing_tools=()

for tool in "${required_tools[@]}"; do
    if command_exists "$tool"; then
        print_success "$tool is installed"
    else
        print_error "$tool is not installed"
        missing_tools+=("$tool")
    fi
done

if [ ${#missing_tools[@]} -ne 0 ]; then
    print_error "Missing required tools: ${missing_tools[*]}"
    echo "Please install the missing tools and run this script again."
    exit 1
fi

# Check Node.js version
node_version=$(node --version)
print_status "Node.js version: $node_version"

# Check if Expo CLI is available
if command_exists "npx"; then
    print_success "npx is available (can run Expo)"
else
    print_error "npx is not available"
fi

echo ""
echo "🗄️  Step 2: Database Setup"
echo "---------------------------"

# Check if PostgreSQL is running in Docker
if docker ps | grep -q "reloconnect-postgres"; then
    print_success "PostgreSQL container is already running"
else
    print_status "Starting PostgreSQL container..."
    if docker-compose up -d postgres; then
        print_success "PostgreSQL container started"
        sleep 5  # Give it time to initialize
    else
        print_error "Failed to start PostgreSQL container"
        exit 1
    fi
fi

# Check if database is accessible
if nc -z localhost 5432 2>/dev/null; then
    print_success "PostgreSQL is accessible on port 5432"
else
    print_error "PostgreSQL is not accessible on port 5432"
    print_status "Trying to start database..."
    docker-compose up -d postgres
    sleep 10
fi

echo ""
echo "🖥️  Step 3: Backend API Setup"
echo "-----------------------------"

# Check if backend is already running
if port_in_use 3000; then
    print_warning "Port 3000 is already in use (backend might be running)"
else
    print_status "Starting backend API server..."
    cd backend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_status "Installing backend dependencies..."
        npm install
    fi
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    # Run migrations
    print_status "Running database migrations..."
    npx prisma migrate dev --name init
    
    # Start the backend in background
    print_status "Starting backend server..."
    npm run dev &
    BACKEND_PID=$!
    
    cd ..
    
    # Wait for backend to be ready
    if wait_for_service "http://localhost:3000/health" "Backend API"; then
        print_success "Backend API is running on http://localhost:3000"
    else
        print_error "Backend API failed to start"
    fi
fi

echo ""
echo "📱 Step 4: Mobile App (User App) Testing"
echo "----------------------------------------"

# Check if user app dependencies are installed
cd apps/user-app

if [ ! -d "node_modules" ]; then
    print_status "Installing user app dependencies..."
    npm install
fi

# Run TypeScript check
print_status "Running TypeScript check for user app..."
if npm run type-check; then
    print_success "TypeScript check passed"
else
    print_warning "TypeScript check has warnings/errors"
fi

print_status "You can now test the mobile app with the following commands:"
echo ""
echo "  # Start the Expo development server"
echo "  cd apps/user-app"
echo "  npm start"
echo ""
echo "  # Or use specific platforms:"
echo "  npm run ios     # for iOS simulator"
echo "  npm run android # for Android emulator"
echo "  npm run web     # for web browser"

cd ../..

echo ""
echo "🌐 Step 5: Admin Dashboard Testing"
echo "----------------------------------"

cd apps/admin-dashboard

if [ ! -d "node_modules" ]; then
    print_status "Installing admin dashboard dependencies..."
    npm install
fi

# Run TypeScript check
print_status "Running TypeScript check for admin dashboard..."
if npm run type-check; then
    print_success "TypeScript check passed"
else
    print_warning "TypeScript check has warnings/errors"
fi

# Check if admin dashboard is already running
if port_in_use 3001; then
    print_warning "Port 3001 is already in use (admin dashboard might be running)"
    print_success "Admin dashboard should be available at http://localhost:3001"
else
    print_status "Starting admin dashboard..."
    npm run dev &
    ADMIN_PID=$!
    
    if wait_for_service "http://localhost:3001" "Admin Dashboard"; then
        print_success "Admin dashboard is running on http://localhost:3001"
    else
        print_error "Admin dashboard failed to start"
    fi
fi

cd ../..

echo ""
echo "🧪 Step 6: Testing Summary"
echo "-------------------------"

print_success "Testing setup complete! Here's what's running:"
echo ""
echo "📊 Services Status:"
echo "  • PostgreSQL Database: http://localhost:5432"
echo "  • Backend API: http://localhost:3000"
echo "  • Admin Dashboard: http://localhost:3001"
echo ""
echo "📱 Mobile App Testing:"
echo "  • Navigate to: apps/user-app"
echo "  • Run: npm start"
echo "  • Scan QR code with Expo Go app or use simulator"
echo ""
echo "🌐 Admin Dashboard Testing:"
echo "  • Open: http://localhost:3001"
echo "  • Test admin features and data management"
echo ""
echo "🔧 Additional Testing Commands:"
echo "  • Run tests: npm test (in any app directory)"
echo "  • Check types: npm run type-check"
echo "  • View database: npx prisma studio (in backend directory)"
echo ""

# Save PIDs for cleanup
if [ ! -z "$BACKEND_PID" ]; then
    echo $BACKEND_PID > .backend.pid
fi
if [ ! -z "$ADMIN_PID" ]; then
    echo $ADMIN_PID > .admin.pid
fi

print_status "To stop all services, run: bash scripts/stop-services.sh"
print_success "Happy testing! 🎉"
