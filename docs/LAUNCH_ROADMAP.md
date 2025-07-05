# 🚀 RELOConnect Master Implementation & Launch Roadmap (South Africa)

A complete, **8‑week milestone plan** to stabilize, refactor, and launch the **unified RELOConnect platform**—including User, Driver, and Admin apps—built with **React Native + Expo**, **Node.js + Express + Prisma**, and tailored for the **South African logistics market**.

---

## 🛠️ WEEK 1: Critical Debugging & App Restoration

**Goal:** Eliminate the Hermes/HMRClient error, clear caches, and restore a clean build on iOS and Android devices.

### Tasks

1. **Clear Caches & Reinstall**

   ```bash
   rm -rf node_modules .expo dist ios/build android/build
   watchman watch-del-all
   npm cache clean --force  # or yarn cache clean
   yarn install             # or npm install
   npx expo start -c
   ```

2. **Hermes Configuration**

   * In `app.json`:

     ```json
     {
       "expo": {
         "jsEngine": "hermes"
       }
     }
     ```

   * Ensure `react-native` version matches Expo's bundled version.
3. **Entry Point Registration**

   * In `index.js` or `AppEntry.js`:

     ```js
     import { registerRootComponent } from 'expo';
     import App from './App';
     registerRootComponent(App);
     ```

4. **Metro & Babel**

   * Verify `babel.config.js` includes:

     ```js
     module.exports = {
       presets: ['babel-preset-expo'],
     };
     ```

   * Confirm `metro.config.js` resolves workspace packages.
5. **Dev-Client Launch**

   ```bash
   npx expo start --dev-client
   ```

6. **Fallback**

   * If error persists, temporarily disable Hermes (`"jsEngine": "jsc"`) to isolate.

---

## 🧹 WEEK 2: Code Cleanup & Dependency Optimization

**Goal:** Remove dead code, unify configurations, and ensure consistent dependency versions.

### Tasks

1. **Dependency Audit**

   * Run `npm outdated` / `yarn outdated` and update major packages:

     * Expo SDK ≥ 50
     * React Native ≥ 0.73
     * Prisma latest stable
2. **Lint & Formatting**

   * Install and configure:

     * **ESLint** (Airbnb style)
     * **Prettier**
     * **Husky** + **Commitlint** (Conventional Commits)
3. **Monorepo Cleanup**

   * Remove unused `react-native-*` or duplicated packages.
   * Ensure single `tsconfig.json` per package extends a root config:

     ```json
     // packages/*/tsconfig.json
     {
       "extends": "../../tsconfig.base.json",
       "compilerOptions": { "outDir": "lib" }
     }
     ```

4. **Environment Files**

   * Create root `.env.example` with:

     ```
     API_URL=https://api.reloconnect.co.za
     PAYSTACK_KEY=pk_live_...
     GEMINI_KEY=...
     ```

5. **Cache & Build Scripts**

   * Add npm scripts for clean & build:

     ```json
     "scripts": {
       "clean": "rimraf node_modules .expo dist",
       "bootstrap": "yarn install && yarn clean && expo start -c"
     }
     ```

---

## 📱 WEEK 3: UI Rebuild & Price Calculator Integration

**Goal:** Reconstruct the user booking flow with real-time price updates using South African rates.

### Tasks

1. **Booking Flow Screens**

   * **Pickup/Drop‑off Input**: Google Places autocomplete
   * **Vehicle Selection**: Horizontal cards with SVG icons
   * **Extras Form**: toggles for stairs, loading help, packing, cleaning, express, insurance
   * **Summary Bar**: live price update at bottom
   * **Payment Screen**: payment option buttons + fare breakdown
2. **Styling & Theming**

   * Use **NativeWind** (Tailwind-like) for rapid styling.
   * Primary gradient: `from-[#001F5A] to-[#0061FF]`.
   * Font scale: H1 32 pt, Body 16 pt, Caption 12 pt.
3. **Pricing Table Implementation**

   * **Vehicle Classes & Base Fares**:

     | Distance (km) | Motorbike | Bakkie | 1–1.5 t | 2 t & 4 t | 5 t & 8 t | 10–14 t |
     | ------------- | --------: | -----: | ------: | --------: | --------: | ------: |
     | 0–5           |      R150 |   R650 |    R800 |    R1 050 |    R1 300 |  R1 650 |
     | 5–10          |      R200 |   R700 |    R850 |    R1 100 |    R1 600 |  R1 750 |
     | …             |         … |      … |       … |         … |         … |       … |
     | 100–125       |      R900 | R2 000 |  R2 500 |    R3 500 |    R4 500 |  R5 500 |
     | 125–150       |      R950 | R2 300 |  R2 900 |    R3 900 |    R5 000 |  R6 000 |
     | 150+          |    Custom | Custom |  Custom |    Custom |    Custom |  Custom |

   * **Extras Costs**:

     * **Stairs:** +R150/flight
     * **Loading help:** +R350/person
     * **Packing materials:** R200 (10 boxes + wrap)
     * **Cleaning:** R500
     * **Insurance:** 1.5 % of cargo value
     * **Express:** +R450
4. **Live Calculation**

   ```ts
   function calculateFare(distanceKm, classRate, extras) {
     const base = lookupRate(distanceKm, classRate);
     const extrasTotal = extras.stairs * 150 + extras.loading * 350 + ...;
     return base + extrasTotal + (extras.insuranceValue * 0.015);
   }
   ```

---

## 🚚 WEEK 4: Driver & Owner Onboarding + Real‑Time Tracking

**Goal:** Complete KYC flows and enable live location sharing.

### Tasks

1. **Owner & Driver KYC**

   * **Owner**: register business, upload ID, VAT, UBO docs, optional face verify.
   * **Driver**: invite link, upload license, selfie + liveness (Gemini Vision), assign truck.
2. **Assistant (Mover) Onboarding**

   * Similar to Driver with ID & selfie; less strict liveness; optional background check.
3. **GPS Tracking**

   * Integrate `react-native-maps` + `react-native-maps-directions`.
   * Implement `expo-location` to update driver location every 5 s.
   * Use **Socket.IO** to emit:

     ```js
     socket.emit('driver:location', { tripId, lat, lng });
     ```

   * User app listens and animates marker on map.

---

## 🧑‍💻 WEEK 5: Admin Dashboard Overhaul

**Goal:** Give admins complete oversight and control.

### Tasks

1. **Side‑Panel Navigation**

   * Dashboard, Users, Drivers & Vehicles, Bookings, Revenue, KYC, Logs.
2. **Pages & Components**

   * **Users:** list, search, KYC status badge
   * **Drivers & Trucks:** approve KYC, edit vehicle details, view docs
   * **Bookings:** filter by status/date, manual assign/cancel
   * **Revenue:** interactive charts (Recharts) for daily/weekly revenue by vehicle class
   * **Compliance:** audit logs, re‑verify triggers
3. **Real‑Time Updates**

   * Subscribe to Socket.IO events (`booking:created`, `driver:location`)
   * Show live trip map in Admin.

---

## 💳 WEEK 6: Payment System + Compliance

**Goal:** Secure South African payments, transparent commissions, automated payouts.

### Tasks

1. **Gateway Setup**

   * Integrate **Paystack** (recommended) or **Yoco**.
   * Implement tokenization, 3D Secure, webhook handlers.

2. **Commission Implementation**

   | Vehicle Class            | Commission Rate |
   | ------------------------ | --------------- |
   | Motorbike                | 12.5 %          |
   | Bakkie (≤ 1 t)           | 15 %            |
   | Small Truck (1–1.5 t)    | 17.5 %          |
   | Medium Truck (2 t & 4 t) | 20 %            |
   | Large Truck (5 t & 8 t)  | 22.5 %          |
   | Heavy Truck (10–14 t)    | 25 %            |

3. **Add‑On Fees**

   * Verified Driver: +2 %
   * Insurance: +5 %
   * Packing: +10 % markup
   * Cleaning: +10 % admin
   * Express: +4 % (split)

4. **Payout Logic**

   ```ts
   netPayout = fare - (fare * commissionRate) - (extrasTotal * extrasCommission);
   schedulePayout(driverId, netPayout);
   ```

5. **Invoice Generation**

   * PDF with breakdown, VAT info, ZAR currency.
   * Email/SMS via **Twilio**.

---

## 🤖 WEEK 7: AI & API Integrations (ReloAI, ReloPorts, ReloNews)

**Goal:** Enhance the platform with AI assistance and real-time industry data.

### Tasks

1. **ReloAI (Gemini)**

   * `/ai/parse-booking`: convert NL queries to booking JSON
   * `/ai/recommend-truck`: analyze description → suggested class
   * `/ai/predict-eta`: refine ETA using ML model
   * Embed "AI Assist" button on all screens
2. **ReloPorts**

   * Integrate **Transnet Port API** for Durban, Cape Town, Port Elizabeth
   * Display vessel schedules, congestion alerts.
3. **ReloNews**

   * Pull SA logistics news from **NewsAPI.org**
   * Categories: Freight, Trucking, Regulation

---

## 🧪 WEEK 8: Testing, QA & Beta Launch

**Goal:** Validate stability, fix bugs, and roll out to internal testers.

### Tasks

1. **Unit Tests**

   * **Jest** for services, utils, pricing logic.
2. **E2E Tests**

   * **Detox** for mobile booking/tracking flows
   * **Cypress** for Admin dashboard workflows
3. **CI/CD Pipeline**

   * **GitHub Actions**: lint → test → build → publish
   * **Expo EAS** for mobile binaries
   * **Docker** images for backend services
4. **Quality Assurance**

   * Manual QA on SA devices (iOS & Android)
   * Verify KYC, payment, real‑time tracking
   * Accessibility checks (contrast, touch targets)
5. **Beta Launch**

   * Distribute via **TestFlight** and **Google Play Internal**
   * Collect feedback with **Typeform** survey integration

---

## 🔐 Security & Compliance Throughout

* **POPIA/GDPR** data handling
* **OTP** for all signups (South African `+27` numbers via Twilio)
* **Face‑match** and liveness checks (Gemini Vision) for Drivers/Assistants
* **Audit Logs** for all KYC and booking events

---

## 🎯 Final Deliverables

* **Stable mobile apps** on iOS/Android
* **Fully functional Admin dashboard**
* **Real-time tracking** and chat
* **Accurate pricing & commissions** in ZAR
* **AI‑powered assistant** and industry feeds
* **Test suite** with 80%+ coverage
* **CI/CD** pipeline and launch plan

---

> **Next Steps:**
> • Convert this roadmap into GitHub Issues & Milestones
> • Assign team members sprint-by-sprint
> • Kick off Week 1 immediately to resolve the Hermes error and restore your build!
