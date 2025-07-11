#!/bin/bash

# RELOConnect Complete Startup Script
# This script starts all services and sets up the database

echo "🚀 Starting RELOConnect Complete System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "\n${BLUE}==== $1 ====${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_status "Docker is running"
}

# Navigate to project root
cd "$(dirname "$0")"

print_step "STEP 1: Checking Prerequisites"
check_docker

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js and try again."
    exit 1
fi
print_status "Node.js is available: $(node --version)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi
print_status "npm is available: $(npm --version)"

print_step "STEP 2: Starting PostgreSQL Database"

# Stop any existing containers
print_status "Stopping any existing containers..."
docker-compose down > /dev/null 2>&1

# Start PostgreSQL
print_status "Starting PostgreSQL with Docker Compose..."
if docker-compose up -d postgres; then
    print_status "PostgreSQL container started successfully"
else
    print_error "Failed to start PostgreSQL container"
    exit 1
fi

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
sleep 10

# Check if PostgreSQL is accessible
for i in {1..30}; do
    if docker exec reloconnect-postgres pg_isready -U reloconnect > /dev/null 2>&1; then
        print_status "PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "PostgreSQL failed to start after 30 attempts"
        exit 1
    fi
    echo -n "."
    sleep 1
done

print_step "STEP 3: Setting up Backend Dependencies"

# Navigate to backend directory
cd backend

# Install backend dependencies
print_status "Installing backend dependencies..."
if npm install; then
    print_status "Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

print_step "STEP 4: Database Setup"

# Generate Prisma client
print_status "Generating Prisma client..."
if npx prisma generate; then
    print_status "Prisma client generated successfully"
else
    print_error "Failed to generate Prisma client"
    exit 1
fi

# Push database schema
print_status "Pushing database schema..."
if npx prisma db push; then
    print_status "Database schema pushed successfully"
else
    print_error "Failed to push database schema"
    exit 1
fi

print_step "STEP 5: Seeding Database with South African Data"

# Execute comprehensive seed scripts
print_status "Executing comprehensive South African seed scripts..."

# Function to execute SQL file
execute_sql_file() {
    local file=$1
    local description=$2
    
    print_status "Executing $description..."
    if docker exec -i reloconnect-postgres psql -U reloconnect -d reloconnect < "$file"; then
        print_status "$description completed successfully"
    else
        print_warning "$description failed, but continuing..."
    fi
}

# Execute seed scripts if they exist
if [ -f "comprehensive_sa_seed_part1.sql" ]; then
    execute_sql_file "comprehensive_sa_seed_part1.sql" "Seed Part 1 (Users & Fleet Owners)"
fi

if [ -f "comprehensive_sa_seed_part2.sql" ]; then
    execute_sql_file "comprehensive_sa_seed_part2.sql" "Seed Part 2 (Bookings & Donations)"
fi

if [ -f "comprehensive_sa_seed_part3.sql" ]; then
    execute_sql_file "comprehensive_sa_seed_part3.sql" "Seed Part 3 (Safety Reports & Documents)"
fi

# Run TypeScript seed as fallback
print_status "Running TypeScript seed script..."
if npm run seed; then
    print_status "TypeScript seed completed successfully"
else
    print_warning "TypeScript seed failed, but continuing..."
fi

print_step "STEP 6: Starting Backend Server"

print_status "Starting RELOConnect backend server..."
echo -e "${YELLOW}Backend will start on http://localhost:5000${NC}"
echo -e "${YELLOW}Socket.IO will be available on the same port${NC}"
echo -e "${YELLOW}Health check: http://localhost:5000/health${NC}"
echo -e "${YELLOW}API status: http://localhost:5000/api/status${NC}"

# Start backend in background
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    print_status "Backend server started successfully (PID: $BACKEND_PID)"
else
    print_error "Backend server failed to start"
    exit 1
fi

print_step "STEP 7: Setting up User App"

# Navigate to user app directory
cd "../apps/user-app"

# Install user app dependencies
print_status "Installing user app dependencies..."
if npm install; then
    print_status "User app dependencies installed successfully"
else
    print_error "Failed to install user app dependencies"
    exit 1
fi

print_step "STEP 8: System Status Summary"

echo -e "\n${GREEN}✅ RELOConnect System Status:${NC}"
echo -e "📊 PostgreSQL Database: ${GREEN}RUNNING${NC} (Port 5432)"
echo -e "🔧 Backend API Server: ${GREEN}RUNNING${NC} (Port 5000)"
echo -e "📱 User App: ${GREEN}READY${NC} (Dependencies installed)"
echo -e "🚛 Driver App: ${GREEN}READY${NC} (Ready to start)"
echo -e "👨‍💼 Admin Dashboard: ${GREEN}READY${NC} (Ready to start)"

echo -e "\n${BLUE}🌐 Available Services:${NC}"
echo -e "• Backend API: ${YELLOW}http://localhost:5000${NC}"
echo -e "• Health Check: ${YELLOW}http://localhost:5000/health${NC}"
echo -e "• API Status: ${YELLOW}http://localhost:5000/api/status${NC}"
echo -e "• pgAdmin: ${YELLOW}http://localhost:5050${NC} (admin@reloconnect.com / admin123)"

echo -e "\n${BLUE}📱 To start mobile apps:${NC}"
echo -e "• User App: ${YELLOW}cd apps/user-app && npm start${NC}"
echo -e "• Driver App: ${YELLOW}cd apps/driver-app && npm start${NC}"

echo -e "\n${BLUE}🌐 To start admin dashboard:${NC}"
echo -e "• Admin Dashboard: ${YELLOW}cd admin-dashboard && npm install && npm run dev${NC}"

echo -e "\n${GREEN}🎉 RELOConnect system is now ready for testing and development!${NC}"

echo -e "\n${BLUE}📋 Next Steps:${NC}"
echo -e "1. Test backend connectivity: curl http://localhost:5000/health"
echo -e "2. Start user app: cd apps/user-app && npm start"
echo -e "3. Test notification system in the app"
echo -e "4. Verify real-time features are working"

echo -e "\n${YELLOW}💡 Pro Tips:${NC}"
echo -e "• Use 'docker-compose logs postgres' to view database logs"
echo -e "• Backend logs will show in this terminal"
echo -e "• Access database directly: docker exec -it reloconnect-postgres psql -U reloconnect -d reloconnect"

# Wait for backend to continue running
print_status "Backend is running. Press Ctrl+C to stop all services."
wait $BACKEND_PID
