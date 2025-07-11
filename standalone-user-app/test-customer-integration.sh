#!/bin/bash

# RELOConnect Customer App Integration Test
# This script tests the customer app real-time integration features

echo "🚀 Starting RELOConnect Customer App Integration Test..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to run tests
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${YELLOW}Testing: $test_name${NC}"
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS: $test_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: $test_name${NC}"
        ((TESTS_FAILED++))
    fi
}

# Test 1: Check if customer app dependencies are installed
echo -e "\n${YELLOW}=== Testing Customer App Dependencies ===${NC}"
run_test "Node.js is installed" "node --version"
run_test "npm is installed" "npm --version"
run_test "Expo CLI is available" "npx expo --version"

# Test 2: Check if required files exist
echo -e "\n${YELLOW}=== Testing Required Files ===${NC}"
run_test "CustomerSocketService exists" "[ -f apps/user-app/src/services/customerSocketService.ts ]"
run_test "CustomerAPI exists" "[ -f apps/user-app/src/services/customerAPI.ts ]"
run_test "RealTimeTrackingScreen exists" "[ -f apps/user-app/src/screens/tracking/RealTimeTrackingScreen.tsx ]"
run_test "AppNavigator exists" "[ -f apps/user-app/src/navigation/AppNavigator.tsx ]"

# Test 3: Check TypeScript compilation
echo -e "\n${YELLOW}=== Testing TypeScript Compilation ===${NC}"
cd apps/user-app
run_test "TypeScript compilation" "npx tsc --noEmit"

# Test 4: Check if socket.io-client is installed
echo -e "\n${YELLOW}=== Testing Dependencies ===${NC}"
run_test "socket.io-client is installed" "npm list socket.io-client"
run_test "react-native-maps is installed" "npm list react-native-maps"
run_test "async-storage is installed" "npm list @react-native-async-storage/async-storage"

# Test 5: Check backend connectivity (if running)
echo -e "\n${YELLOW}=== Testing Backend Connectivity ===${NC}"
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on port 5000${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️  Backend is not running (optional for build test)${NC}"
fi

# Test 6: Check database connectivity (if running)
echo -e "\n${YELLOW}=== Testing Database Connectivity ===${NC}"
if docker ps | grep -q postgres; then
    echo -e "${GREEN}✅ PostgreSQL container is running${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️  PostgreSQL container is not running (optional for build test)${NC}"
fi

# Test 7: Simulate customer socket service initialization
echo -e "\n${YELLOW}=== Testing Customer Socket Service ===${NC}"
run_test "CustomerSocketService can be imported" "node -e \"
const { customerSocketService } = require('./src/services/customerSocketService');
console.log('CustomerSocketService imported successfully');
console.log('Connection status:', customerSocketService.getConnectionStatus());
\""

# Test 8: Check navigation structure
echo -e "\n${YELLOW}=== Testing Navigation Integration ===${NC}"
run_test "RealTimeTracking screen is in navigation" "grep -q 'RealTimeTracking' src/navigation/AppNavigator.tsx"
run_test "Live tracking button is in TrackingScreen" "grep -q 'liveTrackingButton' src/screens/tracking/TrackingScreen.tsx"

cd ../..

# Final Results
echo -e "\n${YELLOW}=== Integration Test Results ===${NC}"
echo -e "✅ Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "❌ Tests Failed: ${RED}$TESTS_FAILED${NC}"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
echo -e "📊 Total Tests: $TOTAL_TESTS"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Customer App Integration is Ready!${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed. Please check the issues above.${NC}"
    exit 1
fi
