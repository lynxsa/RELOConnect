# RELOConnect Driver App - Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Expo CLI installed globally (`npm install -g @expo/cli`)
- iOS Simulator (macOS) or Android Studio (Android development)
- PostgreSQL database running (via Docker)

### Development Setup

1. **Start Backend Services**
   ```bash
   # Start PostgreSQL database
   cd /path/to/RELOConnect
   docker-compose up -d postgres

   # Start backend API
   cd backend
   npm install
   npm run dev
   ```

2. **Start Driver App**
   ```bash
   cd apps/driver-app
   npm install
   npm start
   ```

3. **Run Integration Tests**
   ```bash
   cd apps/driver-app
   node test-integration.js
   ```

## 📱 Driver App Architecture

### Core Components

```text
apps/driver-app/
├── src/
│   ├── services/
│   │   ├── socketService.ts      # Real-time Socket.IO integration
│   │   ├── driverAPI.ts          # Backend API client
│   │   └── locationService.ts    # GPS and location tracking
│   ├── screens/
│   │   └── driver/
│   │       ├── DriverDashboardScreen.tsx
│   │       ├── LiveTrackingScreen.tsx
│   │       ├── OrdersScreen.tsx
│   │       ├── EarningsScreen.tsx
│   │       └── DriverProfileScreen.tsx
│   ├── components/
│   │   ├── maps/
│   │   └── ui/
│   └── navigation/
│       └── AppNavigator.tsx
├── App.tsx                       # Main app entry point
└── package.json
```text

## 🔧 Key Features

### 1. Real-Time Location Tracking
- GPS-based location updates every 5 seconds
- Real-time broadcasting to customers via Socket.IO
- Background location tracking support
- Battery optimization for extended use

### 2. Order Management
- Real-time order assignments
- Status updates (assigned → pickup → in_transit → delivered)
- Customer communication (calls, chat, navigation)
- Completion workflow with signatures

### 3. Driver Services
- Profile management
- Vehicle selection and management
- Earnings tracking and analytics
- Performance metrics

### 4. Communication Features
- In-app chat with customers
- Phone call integration
- Push notifications for order updates
- Arrival notifications

## 🛠 Development Workflow

### Running the Driver App

1. **Development Mode**
   ```bash
   npm start
   # or
   expo start
   ```

2. **iOS Development**
   ```bash
   npm run ios
   # or
   expo start --ios
   ```

3. **Android Development**
   ```bash
   npm run android
   # or
   expo start --android
   ```

### Testing

1. **Unit Tests**
   ```bash
   npm test
   ```

2. **Integration Tests**
   ```bash
   node test-integration.js
   ```

3. **E2E Tests**
   ```bash
   npm run test:e2e
   ```

## 🌐 API Integration

### Backend Endpoints

```typescript
// Authentication
POST /api/auth/login
GET /api/auth/me

// Driver Management
GET /api/drivers/profile
PUT /api/drivers/profile
PUT /api/drivers/status
PUT /api/drivers/location

// Order Management
GET /api/drivers/orders/assigned
GET /api/drivers/orders/active
GET /api/drivers/orders/history
POST /api/drivers/orders/:id/accept
POST /api/drivers/orders/:id/decline
PUT /api/drivers/orders/:id/status
POST /api/drivers/orders/:id/complete

// Earnings & Analytics
GET /api/drivers/earnings
GET /api/drivers/stats
```text

### Socket.IO Events

```typescript
// Outgoing Events (Driver → Server)
socket.emit('driver:online');
socket.emit('driver:offline');
socket.emit('location:update', locationData);
socket.emit('booking:status_update', statusData);
socket.emit('booking:arrival_notification', arrivalData);

// Incoming Events (Server → Driver)
socket.on('booking:assigned', handleNewOrder);
socket.on('booking:status_changed', handleStatusChange);
socket.on('chat:new_message', handleNewMessage);
socket.on('location:eta_update', handleETAUpdate);
```text

## 📊 Performance Optimization

### Location Services
- **Update Frequency**: 5 seconds for active orders, 30 seconds for idle
- **Battery Optimization**: Reduce accuracy when stationary
- **Network Efficiency**: Batch location updates when possible

### Real-Time Features
- **Connection Management**: Auto-reconnect with exponential backoff
- **Data Compression**: Minimize payload size for frequent updates
- **Offline Support**: Queue updates when offline, sync when connected

## 🔐 Security Considerations

### Authentication
- JWT tokens with refresh mechanism
- Secure token storage in AsyncStorage
- Automatic token refresh before expiry

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all API calls
- Validate all incoming data

### Location Privacy
- Only share location during active orders
- Allow drivers to control location sharing
- Anonymize location data for analytics

## 🚦 Production Deployment

### Environment Configuration
```typescript
// .env.production
EXPO_PUBLIC_API_URL=https://api.reloconnect.com
EXPO_PUBLIC_SOCKET_URL=https://api.reloconnect.com
EXPO_PUBLIC_ENVIRONMENT=production
```text

### Build Commands
```bash
# Production build
expo build:ios
expo build:android

# App Store/Play Store submission
expo submit:ios
expo submit:android
```text

### Monitoring
- Error tracking with Sentry
- Performance monitoring with Flipper
- Analytics with Firebase/Amplitude

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Issues**
   ```bash
   # Check backend status
   curl http://localhost:5000/health

   # Check database connection
   docker ps | grep postgres
   ```

2. **Location Services Not Working**
   - Verify location permissions in device settings
   - Check GPS signal strength
   - Ensure location services are enabled for the app

3. **Socket.IO Connection Failures**
   - Verify network connectivity
   - Check authentication token validity
   - Review server logs for connection errors

### Debug Mode
```bash
# Enable debug logging
expo start --dev-client --clear

# View logs
npx react-native log-ios
npx react-native log-android
```text

## 📚 Additional Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)

### Development Tools
- [Expo DevTools](https://docs.expo.dev/workflow/debugging/)
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/)

---

## 🎯 Next Steps

1. **Complete Integration Testing**
   - Run full test suite
   - Verify all API endpoints
   - Test real-time features

2. **Performance Optimization**
   - Location service optimization
   - Battery usage improvements
   - Network efficiency enhancements

3. **Production Deployment**
   - Environment configuration
   - App store preparation
   - Monitoring setup

For support, please contact the development team or refer to the project documentation.
