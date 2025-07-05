# RELOConnect Monorepo - Development Guide

## Quick Start

### 🚀 Running Individual Apps (Recommended)

#### User App

```bash
cd apps/user-app
npx expo start
```

#### Driver App  

```bash
cd apps/driver-app
npx expo start
```

#### Admin Dashboard

```bash
cd apps/admin-dashboard
npm run dev
```

### 🔧 Running Services

#### Auth Service

```bash
cd services/auth
npm run dev
```

#### Booking Service

```bash
cd services/booking  
npm run dev
```

#### Payment Service

```bash
cd services/payment
npm run dev
```

### 📱 Running from Root (Alternative)

The root directory has a basic Expo setup for development convenience:

```bash
# Basic root app (shows monorepo info)
npx expo start

# Quick shortcuts
npm run user-app      # Starts user app
npm run driver-app    # Starts driver app
```

## ⚡ Quick Development Commands

```bash
# Install all dependencies
pnpm install

# Build all services and libraries
pnpm build

# Run all services in development mode
pnpm dev

# Type checking across all projects
pnpm type-check

# Linting across all projects
pnpm lint

# Testing across all projects
pnpm test
```

## 🏗️ Project Structure

```
/
├── apps/
│   ├── user-app/          # React Native user app
│   ├── driver-app/        # React Native driver app
│   └── admin-dashboard/   # Next.js admin dashboard
├── services/
│   ├── auth/             # Authentication service
│   ├── booking/          # Booking and pricing service
│   └── payment/          # Payment processing service
├── libs/
│   └── shared/           # Shared types and utilities
└── docs/                 # Documentation
```

## 🔗 Service Endpoints

- **Auth Service**: <http://localhost:3001>
- **Booking Service**: <http://localhost:3002>  
- **Payment Service**: <http://localhost:3003>
- **Admin Dashboard**: <http://localhost:3000>
- **User App**: <http://localhost:8081> (Expo)
- **Driver App**: <http://localhost:8082> (Expo)

## 🚨 Troubleshooting

### "Cannot resolve module ../../App" Error

This means you're trying to run Expo from the root directory. Use one of these solutions:

1. **Run individual apps** (recommended):

   ```bash
   cd apps/user-app && npx expo start
   ```

2. **Or use the root app** (basic placeholder):

   ```bash
   npx expo start
   ```

### Port Conflicts

If you get port conflicts, kill existing processes:

```bash
lsof -ti:8081,8082,3001,3002,3003 | xargs kill -9
```

### TypeScript Errors

Rebuild shared library if you get import errors:

```bash
cd libs/shared && npm run build
```
