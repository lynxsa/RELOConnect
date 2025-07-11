#!/bin/bash

# RELOConnect Driver App Integration Script
# This script starts all necessary services for the driver app

echo "🚀 Starting RELOConnect Driver App Integration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if a service is running
check_service() {
    service_name=$1
    port=$2
    
    if lsof -i :$port > /dev/null 2>&1; then
        print_color $GREEN "✅ $service_name is running on port $port"
        return 0
    else
        print_color $RED "❌ $service_name is not running on port $port"
        return 1
    fi
}

# Function to start a service
start_service() {
    service_name=$1
    command=$2
    directory=$3
    
    print_color $BLUE "🔄 Starting $service_name..."
    
    if [ -d "$directory" ]; then
        cd "$directory"
        eval "$command" &
        sleep 2
        print_color $GREEN "✅ $service_name started"
    else
        print_color $RED "❌ Directory $directory not found"
        return 1
    fi
}

# Change to the project root directory
cd "$(dirname "$0")"

print_color $YELLOW "📋 Checking prerequisites..."

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    print_color $RED "❌ Docker is not running. Please start Docker first."
    exit 1
fi

print_color $GREEN "✅ Docker is running"

# Check if database is running
if ! check_service "PostgreSQL Database" 5432; then
    print_color $BLUE "🔄 Starting PostgreSQL database..."
    docker-compose up -d postgres
    sleep 5
    
    if ! check_service "PostgreSQL Database" 5432; then
        print_color $RED "❌ Failed to start PostgreSQL database"
        exit 1
    fi
fi

# Check if backend is running
if ! check_service "RELOConnect Backend" 5000; then
    print_color $BLUE "🔄 Starting RELOConnect Backend..."
    start_service "RELOConnect Backend" "npm run dev" "./backend"
    sleep 5
    
    if ! check_service "RELOConnect Backend" 5000; then
        print_color $RED "❌ Failed to start RELOConnect Backend"
        exit 1
    fi
fi

print_color $YELLOW "📱 Driver App Integration Status:"

# Check required backend endpoints
backend_endpoints=(
    "http://localhost:5000/health"
    "http://localhost:5000/api/status"
)

for endpoint in "${backend_endpoints[@]}"; do
    if curl -s "$endpoint" > /dev/null; then
        print_color $GREEN "✅ $endpoint is accessible"
    else
        print_color $RED "❌ $endpoint is not accessible"
    fi
done

# Check driver app dependencies
print_color $BLUE "📦 Checking driver app dependencies..."
cd "./apps/driver-app"

if [ -f "package.json" ]; then
    if [ -d "node_modules" ]; then
        print_color $GREEN "✅ Driver app dependencies are installed"
    else
        print_color $YELLOW "⚠️ Installing driver app dependencies..."
        npm install
        if [ $? -eq 0 ]; then
            print_color $GREEN "✅ Driver app dependencies installed successfully"
        else
            print_color $RED "❌ Failed to install driver app dependencies"
            exit 1
        fi
    fi
else
    print_color $RED "❌ Driver app package.json not found"
    exit 1
fi

# Check TypeScript configuration
if [ -f "tsconfig.json" ]; then
    print_color $GREEN "✅ TypeScript configuration found"
else
    print_color $RED "❌ TypeScript configuration not found"
fi

# Check for required services
print_color $BLUE "🔍 Checking service integrations..."

# Check socket.io service
if [ -f "src/services/socketService.ts" ]; then
    print_color $GREEN "✅ Socket.IO service found"
else
    print_color $RED "❌ Socket.IO service not found"
fi

# Check driver API service
if [ -f "src/services/driverAPI.ts" ]; then
    print_color $GREEN "✅ Driver API service found"
else
    print_color $RED "❌ Driver API service not found"
fi

# Check enhanced live tracking screen
if [ -f "src/screens/driver/LiveTrackingScreen.tsx" ]; then
    print_color $GREEN "✅ Enhanced Live Tracking screen found"
else
    print_color $RED "❌ Enhanced Live Tracking screen not found"
fi

print_color $YELLOW "🏁 Final Integration Status:"

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    print_color $BLUE "📄 Creating environment configuration..."
    cat > .env << EOL
# RELOConnect Driver App Configuration
EXPO_PUBLIC_API_URL=http://localhost:5000
EXPO_PUBLIC_SOCKET_URL=http://localhost:5000
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_APP_NAME=RELOConnect Driver
EXPO_PUBLIC_VERSION=1.0.0
EOL
    print_color $GREEN "✅ Environment configuration created"
fi

# Check if all services are running
all_services_running=true

if ! check_service "PostgreSQL Database" 5432; then
    all_services_running=false
fi

if ! check_service "RELOConnect Backend" 5000; then
    all_services_running=false
fi

if $all_services_running; then
    print_color $GREEN "🎉 All services are running successfully!"
    print_color $YELLOW "📱 You can now start the driver app with:"
    print_color $BLUE "   npm start"
    print_color $BLUE "   expo start"
    print_color $BLUE "   or"
    print_color $BLUE "   npm run ios/android"
    
    print_color $YELLOW "🔧 Available development tools:"
    print_color $BLUE "   • Database Admin: http://localhost:5050 (pgAdmin)"
    print_color $BLUE "   • API Status: http://localhost:5000/api/status"
    print_color $BLUE "   • Health Check: http://localhost:5000/health"
else
    print_color $RED "❌ Some services are not running properly"
    print_color $YELLOW "Please check the logs and try again"
    exit 1
fi

print_color $GREEN "✅ RELOConnect Driver App integration complete!"
