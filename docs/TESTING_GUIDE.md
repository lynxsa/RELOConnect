# 📱🌐 RELOConnect Testing Guide

Complete guide for testing both the mobile application and admin dashboard.

## 🚀 Quick Start

### Automated Setup
```bash
# Make scripts executable
chmod +x scripts/start-testing.sh scripts/stop-services.sh

# Run automated testing setup
bash scripts/start-testing.sh
```

### Manual Setup
If you prefer to set up each component manually:

```bash
# 1. Start Database
docker-compose up -d postgres

# 2. Start Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev &

# 3. Start Admin Dashboard
cd ../apps/admin-dashboard
npm install
npm run dev &

# 4. Prepare Mobile App
cd ../user-app
npm install
npm start
```

## 📊 Testing Components

### 🗄️ Database (PostgreSQL)
- **URL**: `localhost:5432`
- **Database**: `reloconnect`
- **Username**: `reloconnect`
- **Password**: `reloconnect_password`

**Test Steps:**
1. Verify container is running: `docker ps | grep postgres`
2. Test connection: `psql -h localhost -U reloconnect -d reloconnect`
3. View with Prisma Studio: `cd backend && npx prisma studio`

### 🖥️ Backend API
- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

**Test Endpoints:**
```bash
# Health check
curl http://localhost:3000/health

# User registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Get pricing
curl http://localhost:3000/api/pricing

# Get ports
curl http://localhost:3000/api/ports
```

### 🌐 Admin Dashboard
- **URL**: http://localhost:3001
- **Technology**: Next.js + React

**Features to Test:**
1. **Dashboard Overview**
   - Navigate to http://localhost:3001
   - Check if charts and metrics load
   - Verify responsive design

2. **User Management**
   - View user list
   - Create/edit user profiles
   - Test user permissions

3. **Booking Management**
   - View booking list
   - Update booking status
   - Generate reports

4. **Pricing Management**
   - Update service prices
   - Configure pricing tiers
   - Test calculator functionality

5. **Analytics & Reports**
   - View dashboard metrics
   - Export data functionality
   - Real-time updates

### 📱 Mobile Application (User App)
- **Technology**: React Native + Expo
- **Platform**: iOS, Android, Web

**Setup for Testing:**
```bash
cd apps/user-app
npm start
```

**Testing Options:**

#### 📲 Physical Device (Recommended)
1. Install [Expo Go](https://expo.dev/client) on your phone
2. Scan the QR code from the terminal
3. App will load on your device

#### 💻 Simulator/Emulator
```bash
# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

**Features to Test:**

1. **Authentication Flow**
   - Sign up with email
   - Login/logout
   - Password reset
   - OTP verification

2. **Home Screen**
   - Service selection
   - Quick booking
   - Recent bookings
   - Navigation menu

3. **Booking Flow**
   - Price calculator
   - Service selection
   - Date/time picker
   - Address input
   - Payment integration

4. **Tracking**
   - Real-time order tracking
   - Driver location
   - Status updates
   - Notifications

5. **Profile Management**
   - Edit profile
   - Booking history
   - Payment methods
   - Settings

6. **Additional Features**
   - RELOCare (donations)
   - RELONews (industry news)
   - RELOPorts (port information)
   - Chat support

## 🧪 Testing Scenarios

### Scenario 1: Complete User Journey
1. **Mobile App**: User signs up and creates profile
2. **Mobile App**: User calculates price for relocation
3. **Mobile App**: User books a service
4. **Admin Dashboard**: Admin views new booking
5. **Admin Dashboard**: Admin assigns driver
6. **Mobile App**: User tracks order progress

### Scenario 2: Admin Management
1. **Admin Dashboard**: Login to admin panel
2. **Admin Dashboard**: View dashboard metrics
3. **Admin Dashboard**: Manage user accounts
4. **Admin Dashboard**: Update pricing
5. **Admin Dashboard**: Generate reports

### Scenario 3: Cross-Platform Testing
1. Test mobile app on different devices
2. Test admin dashboard on different browsers
3. Verify data synchronization between platforms
4. Test offline functionality

## 🔍 What to Look For

### ✅ Success Indicators
- [ ] All services start without errors
- [ ] Database connections work
- [ ] API endpoints respond correctly
- [ ] Mobile app loads and functions
- [ ] Admin dashboard is accessible
- [ ] Data flows between components
- [ ] No TypeScript/console errors
- [ ] Responsive design works
- [ ] Real-time features function

### ❌ Common Issues
- Port conflicts (3000, 3001, 5432)
- Missing dependencies
- Database connection failures
- TypeScript compilation errors
- Network connectivity issues
- Expo CLI version conflicts

## 🛠️ Troubleshooting

### Database Issues
```bash
# Reset database
docker-compose down
docker volume rm reloconnect_postgres_data
docker-compose up -d postgres

# Re-run migrations
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

### Backend Issues
```bash
# Clear cache and reinstall
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Mobile App Issues
```bash
# Clear Expo cache
npx expo start --clear

# Reset Metro cache
npx expo start --reset-cache

# Reinstall dependencies
cd apps/user-app
rm -rf node_modules package-lock.json
npm install
```

### Admin Dashboard Issues
```bash
# Clear Next.js cache
cd apps/admin-dashboard
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

## 📊 Performance Testing

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Test API endpoints
artillery quick --count 10 --num 5 http://localhost:3000/api/health
```

### Mobile Performance
- Test on low-end devices
- Check app size and load times
- Monitor memory usage
- Test offline functionality

## 🔒 Security Testing

### API Security
- Test authentication endpoints
- Verify JWT token handling
- Check input validation
- Test rate limiting

### Admin Dashboard Security
- Verify admin authentication
- Test authorization levels
- Check for XSS vulnerabilities
- Verify CSRF protection

## 📱 Device Testing Matrix

### Mobile Devices
- [ ] iPhone (iOS 14+)
- [ ] Android (API 21+)
- [ ] iPad/Tablet
- [ ] Different screen sizes

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## 🎯 Testing Checklist

### Before Testing
- [ ] All dependencies installed
- [ ] Database is running
- [ ] Backend API is running
- [ ] No port conflicts
- [ ] Environment variables set

### During Testing
- [ ] Record any bugs found
- [ ] Test all major features
- [ ] Verify cross-platform compatibility
- [ ] Check performance metrics
- [ ] Test error handling

### After Testing
- [ ] Document test results
- [ ] Create bug reports
- [ ] Verify fixes work
- [ ] Performance benchmarks recorded

## 🚀 Ready for Production Checklist

- [ ] All tests pass
- [ ] No critical bugs
- [ ] Performance meets requirements
- [ ] Security tests pass
- [ ] Documentation complete
- [ ] Deployment scripts ready
- [ ] Monitoring setup
- [ ] Backup procedures tested

---

## 🆘 Getting Help

If you encounter issues during testing:

1. Check the console/terminal for error messages
2. Review the troubleshooting section above
3. Verify all dependencies are installed
4. Ensure services are running on correct ports
5. Check Docker container status
6. Review the testing checklist

**Happy Testing! 🎉**
