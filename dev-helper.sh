#!/bin/bash

# RELOConnect Development Helper Script
# Automates common development tasks for your comprehensive implementation

echo "🚀 RELOConnect Development Helper"
echo "=================================="

# Function to start the app
start_app() {
    echo "📱 Starting RELOConnect app..."
    cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app"
    npm start
}

# Function to start web only
start_web() {
    echo "🌐 Starting RELOConnect web app..."
    cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app"
    npx expo start --web
}

# Function to test pricing service
test_pricing() {
    echo "💰 Testing pricing calculations..."
    cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app"
    node -e "
    const { calculateFare, VEHICLE_CLASSES } = require('./services/pricingService.ts');
    
    // Test CT to JHB (1400km) with medium truck
    const fare = calculateFare(1400, 'medium_truck_2t', {
        stairs: false, stairsCount: 1,
        helpers: true, helpersCount: 2,
        packing: false, cleaning: false,
        insurance: true, insuranceValue: 50000,
        express: false
    });
    
    console.log('📊 Pricing Test Results:');
    console.log('Route: Cape Town → Johannesburg (1400km)');
    console.log('Vehicle: Medium Truck (2t)');
    console.log('Total: R' + fare.total.toLocaleString());
    console.log('Driver Earnings: R' + fare.driverEarnings.toLocaleString());
    console.log('Commission: R' + fare.platformCommission.toLocaleString());
    "
}

# Function to show implementation status
show_status() {
    echo "📋 RELOConnect Implementation Status"
    echo "====================================="
    echo ""
    echo "✅ COMPLETED:"
    echo "  • Complete pricing matrix (0-2255km)"
    echo "  • All 9 vehicle classes with commission rates"
    echo "  • Live fare calculator with real-time updates"
    echo "  • Professional UI/UX per specification"
    echo "  • South African branding and focus"
    echo "  • Add-on services (stairs, helpers, insurance, etc.)"
    echo "  • Route estimation (duration, fuel, CO₂)"
    echo "  • Error handling and TypeScript implementation"
    echo ""
    echo "🔄 NEXT PRIORITIES (Week 3-4):"
    echo "  • React Navigation implementation"
    echo "  • Google Maps integration"
    echo "  • Real-time tracking with Socket.IO"
    echo "  • User registration and KYC flows"
    echo "  • Payment integration (Paystack/Yoco)"
    echo "  • Driver onboarding system"
    echo ""
    echo "📍 Current Status: Ready for Week 3 development"
}

# Function to open relevant files
open_code() {
    echo "📝 Opening key implementation files..."
    code "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app/App.tsx"
    code "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app/BookingScreen.tsx"
    code "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app/services/pricingService.ts"
    code "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/COMPREHENSIVE_IMPLEMENTATION_REPORT.md"
}

# Function to show next steps
next_steps() {
    echo "🎯 RELOConnect Next Development Steps"
    echo "====================================="
    echo ""
    echo "WEEK 3 PRIORITIES:"
    echo "1. Install React Navigation v6:"
    echo "   npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack"
    echo ""
    echo "2. Add Google Maps integration:"
    echo "   npm install react-native-maps @googlemaps/react-wrapper"
    echo ""
    echo "3. Implement address autocomplete:"
    echo "   npm install @react-native-google-signin/google-signin"
    echo ""
    echo "4. Add real-time features:"
    echo "   npm install socket.io-client"
    echo ""
    echo "RECOMMENDED COMMANDS:"
    echo "• ./dev-helper.sh start_web    # Start web development"
    echo "• ./dev-helper.sh test_pricing # Test pricing calculations"
    echo "• ./dev-helper.sh show_status  # Show current progress"
    echo "• ./dev-helper.sh open_code    # Open key files in VS Code"
}

# Main menu
case "$1" in
    start_app)
        start_app
        ;;
    start_web)
        start_web
        ;;
    test_pricing)
        test_pricing
        ;;
    show_status)
        show_status
        ;;
    open_code)
        open_code
        ;;
    next_steps)
        next_steps
        ;;
    *)
        echo "Usage: $0 {start_app|start_web|test_pricing|show_status|open_code|next_steps}"
        echo ""
        echo "Available commands:"
        echo "  start_app     - Start the full Expo development server"
        echo "  start_web     - Start web-only development server"
        echo "  test_pricing  - Test pricing calculation functionality"
        echo "  show_status   - Display implementation progress"
        echo "  open_code     - Open key files in VS Code"
        echo "  next_steps    - Show next development priorities"
        echo ""
        echo "RELOConnect is ready for Week 3-4 development!"
        ;;
esac
