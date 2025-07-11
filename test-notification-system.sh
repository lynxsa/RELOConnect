#!/bin/bash

# RELOConnect Notification System Test Script
echo "🧪 Testing RELOConnect Notification System..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Test backend connectivity
echo -e "\n${YELLOW}1. Testing Backend Connectivity...${NC}"
if curl -s http://localhost:5000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
    
    # Get backend status
    echo -e "\n${YELLOW}Backend Status:${NC}"
    curl -s http://localhost:5000/api/status | python3 -m json.tool 2>/dev/null || echo "Backend response received"
else
    echo -e "${RED}❌ Backend is not running${NC}"
    echo "Please start the backend first: cd backend && npm run dev"
    exit 1
fi

# Test notification endpoints
echo -e "\n${YELLOW}2. Testing Notification Endpoints...${NC}"

# Test unread count endpoint (requires auth, will likely return 401 but endpoint should exist)
echo -e "Testing notification count endpoint..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/notifications/unread/count | grep -q "401\|200"; then
    echo -e "${GREEN}✅ Notification count endpoint is available${NC}"
else
    echo -e "${RED}❌ Notification count endpoint not found${NC}"
fi

# Test notifications list endpoint
echo -e "Testing notifications list endpoint..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/notifications | grep -q "401\|200"; then
    echo -e "${GREEN}✅ Notifications list endpoint is available${NC}"
else
    echo -e "${RED}❌ Notifications list endpoint not found${NC}"
fi

# Test Socket.IO connection
echo -e "\n${YELLOW}3. Testing Socket.IO Connection...${NC}"
if curl -s http://localhost:5000/socket.io/ > /dev/null; then
    echo -e "${GREEN}✅ Socket.IO server is running${NC}"
else
    echo -e "${RED}❌ Socket.IO server not accessible${NC}"
fi

# Check database connection
echo -e "\n${YELLOW}4. Testing Database Connection...${NC}"
if docker exec reloconnect-postgres pg_isready -U reloconnect > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL database is running${NC}"
    
    # Count notifications in database
    NOTIFICATION_COUNT=$(docker exec reloconnect-postgres psql -U reloconnect -d reloconnect -t -c "SELECT COUNT(*) FROM notifications;" 2>/dev/null | xargs)
    if [ ! -z "$NOTIFICATION_COUNT" ]; then
        echo -e "${GREEN}✅ Found $NOTIFICATION_COUNT notifications in database${NC}"
    else
        echo -e "${YELLOW}⚠️  No notifications found in database (this is normal for new installation)${NC}"
    fi
else
    echo -e "${RED}❌ PostgreSQL database is not running${NC}"
    echo "Please start PostgreSQL: docker-compose up -d postgres"
fi

echo -e "\n${YELLOW}5. Testing User App Dependencies...${NC}"
if [ -d "../apps/user-app/node_modules" ]; then
    echo -e "${GREEN}✅ User app dependencies are installed${NC}"
else
    echo -e "${RED}❌ User app dependencies not installed${NC}"
    echo "Please install: cd apps/user-app && npm install"
fi

# Check if notification service exists
if [ -f "../apps/user-app/src/services/notificationService.ts" ]; then
    echo -e "${GREEN}✅ Notification service file exists${NC}"
else
    echo -e "${RED}❌ Notification service file missing${NC}"
fi

# Check if notification screen exists
if [ -f "../apps/user-app/src/screens/NotificationScreen.tsx" ]; then
    echo -e "${GREEN}✅ Notification screen file exists${NC}"
else
    echo -e "${RED}❌ Notification screen file missing${NC}"
fi

echo -e "\n${GREEN}🎯 Notification System Test Complete!${NC}"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Start user app: cd apps/user-app && npm start"
echo -e "2. Open the app and tap the notification bell in the header"
echo -e "3. Test real-time notifications by creating them in the backend"

echo -e "\n${YELLOW}💡 Test Notification Creation:${NC}"
echo -e "You can test notifications by sending a POST request to:"
echo -e "curl -X POST http://localhost:5000/api/notifications/alert \\"
echo -e "  -H 'Content-Type: application/json' \\"
echo -e "  -d '{\"title\":\"Test\",\"message\":\"Test notification\",\"priority\":\"HIGH\"}'"
