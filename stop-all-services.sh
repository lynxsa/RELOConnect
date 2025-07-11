#!/bin/bash

# Stop All RELOConnect Services Script

echo "🛑 Stopping RELOConnect Services..."
echo "==================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    case $1 in
        "error") echo -e "${RED}❌ $2${NC}" ;;
        "success") echo -e "${GREEN}✅ $2${NC}" ;;
        "warning") echo -e "${YELLOW}⚠️  $2${NC}" ;;
    esac
}

# Stop Node.js processes
print_status "warning" "Stopping Node.js services..."
pkill -f "node.*reloconnect" 2>/dev/null
pkill -f "npm.*start" 2>/dev/null
pkill -f "expo start" 2>/dev/null

# Stop Docker services
print_status "warning" "Stopping Docker services..."
docker-compose down

# Clean up PID file
if [ -f ".service_pids" ]; then
    rm .service_pids
fi

# Kill any remaining Expo processes
pkill -f expo 2>/dev/null

print_status "success" "All RELOConnect services stopped"

echo ""
echo "🔄 To restart the system, run: ./modernize-system.sh"
