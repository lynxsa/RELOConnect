# RELOConnect Testing Commands

## Quick Setup & Testing

### 1. Make Scripts Executable
```bash
chmod +x scripts/*.sh
```

### 2. Check Current Status
```bash
bash scripts/status-check.sh
```

### 3. Start All Services (Automated)
```bash
bash scripts/start-testing.sh
```

### 4. Manual Service Startup (if needed)

#### Start Database
```bash
docker-compose up -d postgres
```

#### Start Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

#### Start Admin Dashboard (in new terminal)
```bash
cd apps/admin-dashboard
npm install
npm run dev
```

#### Start Mobile App (in new terminal)
```bash
cd apps/user-app
npm install
npm start
```

### 5. Test URLs
- Admin Dashboard: http://localhost:3001
- Backend API: http://localhost:3000
- Backend Health: http://localhost:3000/health
- Database Studio: `cd backend && npx prisma studio`

### 6. Mobile App Testing
After running `npm start` in `apps/user-app`:
1. Install Expo Go on your phone
2. Scan the QR code that appears
3. Or press 'w' for web version

### 7. Stop All Services
```bash
bash scripts/stop-services.sh
```

## Testing Checklist

### Database Testing
- [ ] PostgreSQL container is running
- [ ] Can connect to database
- [ ] Prisma Studio loads data
- [ ] Migrations are applied

### Backend API Testing
- [ ] Server starts without errors
- [ ] Health endpoint responds
- [ ] Authentication endpoints work
- [ ] Data endpoints return JSON

### Admin Dashboard Testing
- [ ] Dashboard loads at localhost:3001
- [ ] Can navigate between pages
- [ ] Charts and data display correctly
- [ ] Forms submit successfully

### Mobile App Testing
- [ ] Expo server starts
- [ ] App loads on device/simulator
- [ ] Authentication flow works
- [ ] Navigation functions properly
- [ ] Forms and inputs work
- [ ] API calls succeed

## Common Issues & Solutions

### Port Conflicts
```bash
# Kill processes on conflicting ports
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:3001 | xargs kill -9
sudo lsof-ti:5432 | xargs kill -9
```

### Docker Issues
```bash
# Reset Docker containers
docker-compose down
docker system prune -f
docker-compose up -d postgres
```

### Node Modules Issues
```bash
# Clean and reinstall in each directory
rm -rf node_modules package-lock.json
npm install
```

### Expo Issues
```bash
# Clear Expo cache
npx expo start --clear
# Or reset cache
npx expo start --reset-cache
```

## Test Data

### Sample User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "phone": "+1234567890"
  }'
```

### Sample Booking Request
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "serviceType": "relocation",
    "fromAddress": "123 Main St, City A",
    "toAddress": "456 Oak Ave, City B",
    "scheduledDate": "2025-07-15T10:00:00Z",
    "items": ["furniture", "boxes"]
  }'
```
