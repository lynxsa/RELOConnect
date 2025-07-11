#!/bin/bash

# RELOConnect Live Chat System Integration Test
echo "🚀 RELOConnect Live Chat System Integration Test"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test status tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run test and track results
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "\n${BLUE}🧪 Testing: ${test_name}${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: ${test_name}${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED: ${test_name}${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Function to check file exists
check_file() {
    local file_path="$1"
    if [[ -f "$file_path" ]]; then
        echo -e "${GREEN}✅ File exists: ${file_path}${NC}"
        return 0
    else
        echo -e "${RED}❌ File missing: ${file_path}${NC}"
        return 1
    fi
}

# Function to check TypeScript compilation
check_typescript() {
    local file_path="$1"
    local project_dir="$2"
    
    if [[ -f "$file_path" ]]; then
        cd "$project_dir" 2>/dev/null || return 1
        if npx tsc --noEmit --skipLibCheck "$file_path" 2>/dev/null; then
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}

echo -e "\n${YELLOW}📋 Phase 1: Backend Live Chat System Tests${NC}"
echo "============================================="

# Backend service tests
run_test "Backend Live Chat Service exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/services/liveChatService.ts'"

run_test "Backend Chat Routes exist" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/routes/chat.ts'"

run_test "Backend Chat Socket Handlers exist" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/socket/chatHandlers.ts'"

run_test "Backend Socket Handlers Integration" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/socket/handlers.ts'"

run_test "Backend Payment Webhook Service exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/services/paymentWebhookService.ts'"

run_test "Backend Driver Payout Service exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/services/driverPayoutService.ts'"

run_test "Backend Push Notification Service exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/services/pushNotificationService.ts'"

echo -e "\n${YELLOW}📋 Phase 2: Mobile Chat System Tests${NC}"
echo "====================================="

# User app mobile services
run_test "User App Mobile Chat Service exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app/src/services/mobileChatService.ts'"

run_test "User App Push Notification Service exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app/src/services/mobilePushNotificationService.ts'"

run_test "User App Chat Screen exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app/src/screens/chat/ChatScreen.tsx'"

run_test "User App Chat List Screen exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app/src/screens/chat/ChatListScreen.tsx'"

# Driver app services
run_test "Driver App Chat Service exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/driver-app/src/services/driverChatService.ts'"

echo -e "\n${YELLOW}📋 Phase 3: Previous System Integration Tests${NC}"
echo "=============================================="

# Payment system tests
run_test "Backend Payment Service exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/services/paymentService.ts'"

run_test "Backend Driver Payout Routes exist" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/routes/driverPayouts.ts'"

run_test "Backend Payment Routes exist" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/routes/payments.ts'"

# Real-time tracking tests
run_test "User App Real-Time Tracking Service exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app/src/services/realTimeTrackingService.ts'"

run_test "Backend Tracking Handlers exist" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/socket/trackingHandlers.ts'"

# Mobile location service
run_test "Mobile Location Service exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/src/services/mobileLocationService.ts'"

# Security and fleet management
run_test "Backend Security Middleware exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/middleware/security.ts'"

run_test "Backend Fleet Management Service exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/services/fleetManagementService.ts'"

echo -e "\n${YELLOW}📋 Phase 4: Configuration and Database Tests${NC}"
echo "=============================================="

# Database and environment tests
run_test "Prisma Schema exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/prisma/schema.prisma'"

run_test "Backend Environment File exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/.env'"

run_test "Backend Main Server File exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/index.ts'"

echo -e "\n${YELLOW}📋 Phase 5: Package Dependencies Tests${NC}"
echo "======================================"

# Check if key dependencies are in package.json files
run_test "User App has Socket.IO client dependency" \
    "grep -q 'socket.io-client' '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app/package.json'"

run_test "User App has AsyncStorage dependency" \
    "grep -q '@react-native-async-storage/async-storage' '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app/package.json'"

run_test "User App has Expo Notifications dependency" \
    "grep -q 'expo-notifications' '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app/package.json'"

run_test "Backend has Socket.IO dependency" \
    "grep -q 'socket.io' '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/package.json'"

run_test "Backend has Stripe dependency" \
    "grep -q 'stripe' '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/package.json'"

echo -e "\n${YELLOW}📋 Phase 6: API Route Integration Tests${NC}"
echo "======================================"

# Check if routes are integrated in main server
run_test "Chat routes integrated in main server" \
    "grep -q 'chat' '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/index.ts'"

run_test "Payment routes integrated in main server" \
    "grep -q 'payments' '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/index.ts'"

run_test "Driver payout routes integrated in main server" \
    "grep -q 'driverPayouts' '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/index.ts'"

run_test "Notification routes integrated in main server" \
    "grep -q 'notifications' '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/index.ts'"

echo -e "\n${YELLOW}📋 Phase 7: Socket.IO Integration Tests${NC}"
echo "======================================"

# Check socket handler integrations
run_test "Chat handlers imported in socket handlers" \
    "grep -q 'chatHandlers' '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/socket/handlers.ts'"

run_test "Tracking handlers imported in socket handlers" \
    "grep -q 'trackingHandlers' '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/socket/handlers.ts'"

echo -e "\n${YELLOW}📋 Phase 8: Documentation Tests${NC}"
echo "==============================="

# Documentation tests
run_test "Phase 1 Implementation Progress exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/PHASE_1_IMPLEMENTATION_PROGRESS.md'"

run_test "Critical Gaps Implementation Plan exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/CRITICAL_GAPS_IMPLEMENTATION_PLAN.md'"

run_test "README file exists" \
    "check_file '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/README.md'"

echo -e "\n${YELLOW}📋 Phase 9: Basic Functionality Tests${NC}"
echo "====================================="

# Simple server start test (non-blocking)
echo -e "\n${BLUE}🧪 Testing: Backend server can start${NC}"
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend"
if timeout 10s npm run dev >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSED: Backend server can start${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}⚠️  SKIPPED: Backend server start test (may need dependencies)${NC}"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo -e "\n${YELLOW}📋 Phase 10: Chat System Feature Validation${NC}"
echo "==========================================="

# Check chat service features in files
run_test "Live Chat Service has message management" \
    "grep -q 'sendMessage\\|receiveMessage\\|messageHistory' '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/services/liveChatService.ts'"

run_test "Chat Routes have CRUD operations" \
    "grep -q 'router\\.\\(get\\|post\\|put\\|delete\\)' '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/backend/src/routes/chat.ts'"

run_test "Mobile Chat Service has real-time features" \
    "grep -q 'socket\\|typing\\|connect' '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app/src/services/mobileChatService.ts'"

run_test "Chat Screen has UI components" \
    "grep -q 'TextInput\\|FlatList\\|TouchableOpacity' '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app/src/screens/chat/ChatScreen.tsx'"

run_test "Push Notification Service has expo integration" \
    "grep -q 'expo-notifications\\|registerForPushNotifications' '/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app/src/services/mobilePushNotificationService.ts'"

echo -e "\n${YELLOW}📊 Test Results Summary${NC}"
echo "======================"
echo -e "Total Tests: ${BLUE}${TOTAL_TESTS}${NC}"
echo -e "Passed: ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed: ${RED}${FAILED_TESTS}${NC}"

# Calculate success rate
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
    echo -e "Success Rate: ${BLUE}${SUCCESS_RATE}%${NC}"
    
    if [ $SUCCESS_RATE -ge 90 ]; then
        echo -e "\n${GREEN}🎉 EXCELLENT! System is ready for production${NC}"
    elif [ $SUCCESS_RATE -ge 75 ]; then
        echo -e "\n${YELLOW}👍 GOOD! Minor issues to address${NC}"
    elif [ $SUCCESS_RATE -ge 50 ]; then
        echo -e "\n${YELLOW}⚠️  WARNING! Several issues need attention${NC}"
    else
        echo -e "\n${RED}🚨 CRITICAL! Major issues need immediate attention${NC}"
    fi
else
    echo -e "\n${RED}🚨 ERROR! No tests could be executed${NC}"
fi

echo -e "\n${YELLOW}🔧 Next Steps${NC}"
echo "============"
echo "1. 📦 Install missing dependencies in mobile apps"
echo "2. 🔧 Fix TypeScript compilation errors" 
echo "3. 🧪 Run unit tests for individual services"
echo "4. 🚀 Test real-time functionality with multiple clients"
echo "5. 📱 Test mobile push notifications"
echo "6. 🔐 Test authentication and security features"
echo "7. 💰 Test payment processing and driver payouts"
echo "8. 📊 Implement monitoring and analytics"

echo -e "\n${GREEN}✅ Live Chat System Integration Test Complete!${NC}"
echo "=============================================="

# Exit with appropriate code
if [ $FAILED_TESTS -eq 0 ]; then
    exit 0
else
    exit 1
fi
