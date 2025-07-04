# RELOConnect - Production-Ready Monorepo

[![CI/CD Pipeline](https://github.com/lynxsa/RELOConnect/workflows/CI/badge.svg)](https://github.com/lynxsa/RELOConnect/actions)
[![Coverage](https://codecov.io/gh/lynxsa/RELOConnect/branch/main/graph/badge.svg)](https://codecov.io/gh/lynxsa/RELOConnect)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **Revolutionising Relocations – Smart. Safe. Seamless.**

RELOConnect is a comprehensive, production-ready relocation platform built as a microservices-based monorepo. This refactored version implements enterprise-grade architecture, advanced pricing algorithms, AI-powered features, and world-class development practices.

## 🌟 Features

### Core Modules

1. **RELOConnect** - Main relocation booking system
2. **RELOCare** - Community donations and item sharing
3. **RELONews** - Industry news and insights
4. **RELOPorts** - Port data and shipping schedules
5. **Driver App** - Driver interface and management
6. **Admin Dashboard** - Web-based admin panel

### Key Capabilities

- 📱 Cross-platform mobile app (iOS, Android, Web)
- 🗺️ Real-time GPS tracking and mapping
- 💳 Integrated payment processing (Stripe, Yoco)
- 💬 In-app chat between users and drivers
- 🚛 Multiple vehicle types and pricing
- ❤️ Community donation platform
- 📰 Industry news feed
- ⚓ Port and shipping data
- 🌙 Dark mode support
- 📊 Comprehensive admin dashboard

## 🛠️ Tech Stack

### Frontend (Mobile App)
- **React Native** with Expo SDK 53
- **TypeScript** for type safety
- **NativeWind** (Tailwind CSS for React Native)
- **React Navigation v6** (Stack, Tab, Drawer)
- **Zustand** for state management
- **React Query** for API state
- **Socket.IO Client** for real-time features
- **React Native Maps** for mapping
- **Expo Linear Gradient** for UI gradients

### Backend API
- **Node.js** with Express.js
- **TypeScript**
- **Prisma ORM** with PostgreSQL
- **Socket.IO** for real-time communication
- **JWT** authentication
- **Stripe** payment processing
- **Multer** for file uploads
- **Helmet** for security

### Database
- **PostgreSQL** with Prisma ORM
- Comprehensive schema for all modules
- Real-time data synchronization

## 🎨 Design System

### Color Palette
- **Primary:** Electric Blue (#0057FF)
- **Secondary:** Light Blue (#00B2FF)
- **Gradients:** Blue-to-blue transitions
- **Supporting:** Success, warning, error colors

### Typography
- **H1:** 32pt, bold
- **H2:** 24pt, semi-bold
- **Body:** 16pt, regular
- **Caption:** 12pt, regular

### Components
- **Buttons:** 44-50px height, gradient backgrounds
- **Inputs:** 48px height, rounded corners
- **Cards:** Elevated with shadows, rounded corners
- **Spacing:** 4, 8, 16, 24px intervals

## 📁 Project Structure

```
RELOConnect/
├── src/                          # React Native app source
│   ├── components/               # Reusable UI components
│   │   ├── ui/                  # Basic UI components
│   │   ├── common/              # Common components
│   │   ├── forms/               # Form components
│   │   └── maps/                # Map-related components
│   ├── screens/                 # Screen components
│   │   ├── auth/                # Authentication screens
│   │   ├── home/                # Home and booking screens
│   │   ├── tracking/            # Order tracking screens
│   │   ├── payment/             # Payment screens
│   │   ├── donations/           # RELOCare screens
│   │   ├── news/                # RELONews screens
│   │   ├── ports/               # RELOPorts screens
│   │   ├── driver/              # Driver app screens
│   │   └── profile/             # Profile screens
│   ├── navigation/              # Navigation configuration
│   ├── services/                # API services
│   ├── store/                   # Zustand state management
│   ├── contexts/                # React contexts
│   ├── types/                   # TypeScript definitions
│   ├── utils/                   # Utility functions
│   └── assets/                  # Images, icons, fonts
├── backend/                      # Node.js backend
│   ├── src/                     # Backend source code
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Express middleware
│   │   ├── services/            # Business logic
│   │   ├── socket/              # Socket.IO handlers
│   │   └── utils/               # Backend utilities
│   └── prisma/                  # Database schema
└── admin-dashboard/             # React admin panel
    ├── src/                     # Admin dashboard source
    └── public/                  # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- PostgreSQL database
- Android Studio (for Android development)
- Xcode (for iOS development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RELOConnect
   ```

2. **Install mobile app dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Backend (.env)
   DATABASE_URL="postgresql://username:password@localhost:5432/reloconnect"
   JWT_SECRET="your-jwt-secret"
   STRIPE_SECRET_KEY="your-stripe-secret"
   CLIENT_URL="http://localhost:3000"
   ```

5. **Set up the database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

6. **Start the development servers**

   Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Mobile app:
   ```bash
   npm start
   ```

## 📱 Mobile App Commands

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web

# Build for production
npm run build
```

## 🗄️ Backend Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database migrations
npm run migrate

# Generate Prisma client
npm run generate

# Open Prisma Studio
npm run studio
```

## 🔄 Key Features Implementation

### 1. Booking Flow
1. User selects pickup and dropoff locations
2. System calculates distance and pricing
3. User chooses vehicle type and extras
4. Payment processing via Stripe/Yoco
5. Driver assignment and real-time tracking
6. Completion and rating

### 2. Real-time Tracking
- Socket.IO for live location updates
- Google Maps integration
- Driver-user communication
- Status updates and notifications

### 3. Payment Integration
- Stripe for card payments
- Yoco for local payments
- Apple Pay / Google Pay support
- Secure payment processing

### 4. Community Features
- Item donation listings
- Request and collection system
- Photo uploads and descriptions
- Location-based matching

## 🎯 Roadmap

### Phase 1: MVP (Current)
- [x] Core booking functionality
- [x] User authentication
- [x] Basic payment processing
- [x] Real-time tracking
- [x] Driver interface

### Phase 2: Enhanced Features
- [ ] Advanced analytics
- [ ] Push notifications
- [ ] Multi-language support
- [ ] Advanced matching algorithms

### Phase 3: Business Expansion
- [ ] B2B enterprise features
- [ ] Fleet management
- [ ] Advanced reporting
- [ ] API for third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Expo team for the excellent development platform
- React Native community for amazing libraries
- Storyset for beautiful illustrations
- All contributors and testers

---

**RELOConnect** - Making relocations smart, safe, and seamless! 🚚✨
