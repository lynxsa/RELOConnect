# 🎯 RELOConnect Manual Testing Guide

Since the automated testing script may have issues, here's a step-by-step manual testing approach.

## 📋 Prerequisites Checklist

### Required Software
- [ ] Node.js (v18 or later)
- [ ] npm (comes with Node.js)  
- [ ] Docker Desktop
- [ ] Git
- [ ] A phone with Expo Go app (for mobile testing)

### Verify Installation
```bash
node --version     # Should show v18+
npm --version      # Should show 8+
docker --version   # Should show Docker version
docker-compose --version  # Should show version
```

## 🗄️ Step 1: Database Setup

### Start PostgreSQL Database
```bash
# Navigate to project root
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect"

# Start database container
docker-compose up -d postgres

# Verify database is running
docker ps | grep postgres
```

**Expected Output:** You should see a container named `reloconnect-postgres` running.

### Test Database Connection
```bash
# Try connecting to the database
docker exec -it reloconnect-postgres psql -U reloconnect -d reloconnect

# If successful, you'll see a postgres prompt. Type \q to exit
```

## 🖥️ Step 2: Backend API Setup

### Install and Start Backend
```bash
# Navigate to backend directory
cd backend

# Install dependencies (first time only)
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start the backend server
npm run dev
```

**Expected Output:**
- Server should start on port 3000
- You should see "Server is running on port 3000" message
- No error messages about database connection

### Test Backend API
Open a new terminal and test:
```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected: {"status": "ok", "timestamp": "..."}
```

### View Database (Optional)
```bash
# In the backend directory
npx prisma studio
```
This opens a web interface at http://localhost:5555 to view/edit database data.

## 🌐 Step 3: Admin Dashboard

### Install and Start Admin Dashboard
```bash
# Navigate to admin dashboard (new terminal window)
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/admin-dashboard"

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

**Expected Output:**
- Server should start on port 3001
- You should see "ready - started server on 0.0.0.0:3001"
- No compilation errors

### Test Admin Dashboard
1. Open your web browser
2. Navigate to http://localhost:3001
3. You should see the RELOConnect Admin Dashboard

**What to Test:**
- [ ] Dashboard loads without errors
- [ ] Navigation works (if any menu items exist)
- [ ] Charts/graphs display (even with mock data)
- [ ] Responsive design (resize browser window)
- [ ] Browser console shows no critical errors

## 📱 Step 4: Mobile Application

### Install and Start User App
```bash
# Navigate to user app (new terminal window)
cd "/Users/derahmanyelo/Documents/LYNX Code Vault/RELOConnect/apps/user-app"

# Install dependencies (first time only)  
npm install

# Start Expo development server
npm start
```

**Expected Output:**
- Expo DevTools should open in your browser
- QR code should appear in terminal
- Metro bundler should start

### Test Mobile App

#### Option A: Physical Device (Recommended)
1. Install "Expo Go" app on your phone from App Store/Google Play
2. Scan the QR code from the terminal with your phone
3. The RELOConnect app should load on your device

#### Option B: Simulator/Emulator
```bash
# For iOS (macOS only)
npm run ios

# For Android (requires Android Studio setup)
npm run android

# For Web Browser
npm run web
```

### Mobile App Testing Checklist
- [ ] App loads without crash
- [ ] Main screen displays correctly
- [ ] Navigation works (tabs, buttons)
- [ ] Can input text in forms
- [ ] No red error screens
- [ ] Console shows no critical errors

## 🧪 Integration Testing

### Test Full Flow
1. **Backend**: Create a test user via API
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

2. **Admin Dashboard**: Check if user appears in admin panel
3. **Mobile App**: Try to login with the test user
4. **Backend**: Check logs for API calls

### Test Data Sync
1. Create booking in mobile app
2. Check if it appears in admin dashboard
3. Update booking status in admin dashboard
4. Verify changes reflect in mobile app

## 🔍 Troubleshooting

### Common Issues and Solutions

#### Port Already in Use
```bash
# Kill processes on specific ports
sudo lsof -ti:3000 | xargs kill -9  # Backend
sudo lsof -ti:3001 | xargs kill -9  # Admin Dashboard
sudo lsof -ti:5432 | xargs kill -9  # Database
```

#### Database Connection Issues
```bash
# Stop and restart database
docker-compose down
docker-compose up -d postgres
sleep 10  # Wait for startup
```

#### Node Modules Issues
```bash
# In any app directory with issues
rm -rf node_modules package-lock.json
npm install
```

#### Expo Metro Issues
```bash
# Clear Expo cache
npx expo start --clear
# OR
npx expo start --reset-cache
```

#### Docker Issues
```bash
# Reset Docker completely
docker-compose down
docker system prune -a
docker-compose up -d postgres
```

### Checking Logs

#### Backend Logs
Check the terminal where you ran `npm run dev` in the backend directory.

#### Admin Dashboard Logs
- Check the terminal where you ran `npm run dev`
- Check browser developer console (F12)

#### Mobile App Logs
- Check the terminal where you ran `npm start`
- Check Expo DevTools in browser
- Check device console in Expo Go app

## ✅ Success Criteria

### System is Working When:
- [ ] All services start without errors
- [ ] Database accepts connections
- [ ] Backend API responds to requests
- [ ] Admin dashboard loads in browser
- [ ] Mobile app loads on device/simulator
- [ ] Data flows between components
- [ ] No critical errors in any console

### Performance Check
- [ ] Admin dashboard loads in under 3 seconds
- [ ] Mobile app responds quickly to taps
- [ ] API calls complete in under 2 seconds
- [ ] Database queries are fast

### Functionality Check
- [ ] User registration works
- [ ] Login/logout functions
- [ ] Data creation/editing works
- [ ] Real-time updates function (if implemented)
- [ ] Charts and visualizations display

## 🎯 Testing Scenarios

### Scenario 1: New User Journey
1. Register new user in mobile app
2. Verify user appears in admin dashboard
3. Create first booking in mobile app
4. Check booking status in admin dashboard

### Scenario 2: Admin Management
1. Login to admin dashboard
2. View user list and statistics
3. Update user information
4. Generate reports (if available)

### Scenario 3: Cross-Platform Data Sync
1. Create data in mobile app
2. Verify it appears in admin dashboard
3. Modify data in admin dashboard
4. Check changes sync to mobile app

## 📊 Performance Monitoring

### What to Monitor
- **Response Times**: API calls should be under 2 seconds
- **Memory Usage**: Keep an eye on system memory
- **Error Rates**: No critical errors should occur
- **User Experience**: Smooth interactions and transitions

### Tools
- Browser DevTools (Network tab)
- Expo DevTools
- Terminal output/logs
- System monitor (Activity Monitor on macOS)

---

## 🆘 Getting Help

If you encounter issues:
1. Check the specific error messages in terminal/console
2. Verify all services are running (database, backend, frontend)
3. Try the troubleshooting steps above
4. Check if all dependencies are installed correctly
5. Ensure no port conflicts exist

## 🎉 When Testing is Complete

Once all services are running and tests pass:
1. Document any bugs found
2. Note performance observations
3. Verify all major features work
4. Confirm the system is ready for development/deployment

**You're now ready to proceed with development and refinement!**
