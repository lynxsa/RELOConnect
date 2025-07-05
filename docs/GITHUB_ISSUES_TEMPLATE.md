# GitHub Issues & Milestones Template

## Milestone Structure

### Week 1: Critical Debugging & App Restoration

**Due Date:** Week 1  
**Description:** Eliminate Hermes/HMRClient error and restore clean builds

### Week 2: Code Cleanup & Dependency Optimization

**Due Date:** Week 2  
**Description:** Remove dead code, unify configurations, ensure consistent dependencies

### Week 3: UI Rebuild & Price Calculator Integration

**Due Date:** Week 3  
**Description:** Reconstruct booking flow with real-time pricing for SA market

### Week 4: Driver & Owner Onboarding + Real-Time Tracking

**Due Date:** Week 4  
**Description:** Complete KYC flows and enable live location sharing

### Week 5: Admin Dashboard Overhaul

**Due Date:** Week 5  
**Description:** Build comprehensive admin oversight and control system

### Week 6: Payment System + Compliance

**Due Date:** Week 6  
**Description:** Integrate SA payments, commissions, and automated payouts

### Week 7: AI & API Integrations

**Due Date:** Week 7  
**Description:** Enhance platform with ReloAI, ReloPorts, and ReloNews

### Week 8: Testing, QA & Beta Launch

**Due Date:** Week 8  
**Description:** Validate stability, fix bugs, and roll out to beta testers

---

## Issue Templates

### 🐛 Bug Report Template

```markdown
**Bug Description:**
Brief description of the bug

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Device: [iOS/Android]
- OS Version: 
- App Version:

**Priority:** [Critical/High/Medium/Low]
**Week:** [1-8]
```

### ✨ Feature Request Template

```markdown
**Feature Description:**
Brief description of the feature

**User Story:**
As a [user type], I want [goal] so that [benefit]

**Acceptance Criteria:**
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3

**Technical Requirements:**
- API endpoints needed
- UI components required
- Database changes

**Priority:** [Critical/High/Medium/Low]
**Week:** [1-8]
```

### 🔧 Technical Task Template

```markdown
**Task Description:**
Brief description of the technical task

**Implementation Details:**
- Specific code changes needed
- Files to be modified
- Dependencies to install

**Definition of Done:**
- [ ] Code implemented
- [ ] Tests written
- [ ] Documentation updated
- [ ] Code reviewed

**Priority:** [Critical/High/Medium/Low]
**Week:** [1-8]
```

---

## Week 1 Issues

### Issue #1: Clear Caches & Reinstall Dependencies

**Type:** 🔧 Technical Task  
**Priority:** Critical  
**Assignee:** Developer Team  

**Description:**
Clear all caches and reinstall dependencies to resolve Hermes/HMRClient errors.

**Tasks:**

- [ ] Remove node_modules, .expo, dist, ios/build, android/build
- [ ] Clear watchman cache
- [ ] Clear npm/yarn cache
- [ ] Reinstall dependencies
- [ ] Start Expo with clear cache flag

**Commands:**

```bash
rm -rf node_modules .expo dist ios/build android/build
watchman watch-del-all
npm cache clean --force
npm install
npx expo start -c
```

### Issue #2: Configure Hermes Engine

**Type:** 🔧 Technical Task  
**Priority:** Critical  
**Assignee:** React Native Developer  

**Description:**
Properly configure Hermes JavaScript engine in app.json and ensure compatibility.

**Tasks:**

- [ ] Set "jsEngine": "hermes" in app.json
- [ ] Verify React Native version compatibility
- [ ] Test Hermes performance
- [ ] Fallback to JSC if needed

### Issue #3: Fix Entry Point Registration

**Type:** 🐛 Bug Report  
**Priority:** Critical  
**Assignee:** React Native Developer  

**Description:**
Ensure proper app entry point registration with Expo.

**Tasks:**

- [ ] Verify index.js/AppEntry.js configuration
- [ ] Import and register root component correctly
- [ ] Test app launch on iOS and Android

### Issue #4: Metro & Babel Configuration

**Type:** 🔧 Technical Task  
**Priority:** High  
**Assignee:** Build Engineer  

**Description:**
Verify and fix Metro bundler and Babel configuration.

**Tasks:**

- [ ] Check babel.config.js includes babel-preset-expo
- [ ] Verify metro.config.js workspace resolution
- [ ] Test bundler performance
- [ ] Fix any configuration conflicts

### Issue #5: Dev Client Launch Testing

**Type:** 🔧 Technical Task  
**Priority:** High  
**Assignee:** QA Engineer  

**Description:**
Test dev client launch and verify error resolution.

**Tasks:**

- [ ] Launch with --dev-client flag
- [ ] Test on multiple devices
- [ ] Verify HMR functionality
- [ ] Document any remaining issues

---

## Week 2 Issues

### Issue #6: Dependency Audit & Updates

**Type:** 🔧 Technical Task  
**Priority:** High  
**Assignee:** Technical Lead  

**Description:**
Audit and update all dependencies to latest stable versions.

**Tasks:**

- [ ] Run npm outdated/yarn outdated
- [ ] Update Expo SDK to ≥ 50
- [ ] Update React Native to ≥ 0.73
- [ ] Update Prisma to latest stable
- [ ] Test compatibility after updates

### Issue #7: ESLint & Prettier Setup

**Type:** 🔧 Technical Task  
**Priority:** Medium  
**Assignee:** Developer Team  

**Description:**
Install and configure code linting and formatting tools.

**Tasks:**

- [ ] Install ESLint with Airbnb config
- [ ] Install and configure Prettier
- [ ] Set up Husky pre-commit hooks
- [ ] Configure Commitlint for conventional commits
- [ ] Add npm scripts for linting

### Issue #8: Monorepo Configuration Cleanup

**Type:** 🔧 Technical Task  
**Priority:** Medium  
**Assignee:** DevOps Engineer  

**Description:**
Clean up monorepo structure and remove duplicate dependencies.

**Tasks:**

- [ ] Remove unused react-native-* packages
- [ ] Unify TypeScript configurations
- [ ] Create shared tsconfig.base.json
- [ ] Update package.json workspaces
- [ ] Test workspace resolution

### Issue #9: Environment Configuration

**Type:** 🔧 Technical Task  
**Priority:** Medium  
**Assignee:** DevOps Engineer  

**Description:**
Set up proper environment configuration management.

**Tasks:**

- [ ] Create .env.example template
- [ ] Configure environment variables for API_URL, PAYSTACK_KEY, GEMINI_KEY
- [ ] Set up different environments (dev, staging, prod)
- [ ] Update documentation

### Issue #10: Build Scripts Optimization

**Type:** 🔧 Technical Task  
**Priority:** Low  
**Assignee:** Build Engineer  

**Description:**
Add and optimize build scripts for better developer experience.

**Tasks:**

- [ ] Add clean script
- [ ] Add bootstrap script
- [ ] Optimize build performance
- [ ] Document script usage

---

## Week 3 Issues

### Issue #11: Booking Flow Screens Development

**Type:** ✨ Feature Request  
**Priority:** Critical  
**Assignee:** Frontend Team  

**Description:**
Build the complete user booking flow with modern UI.

**User Story:**
As a user, I want to easily book a logistics service so that I can move my items efficiently.

**Tasks:**

- [ ] Pickup/Drop-off Input with Google Places
- [ ] Vehicle Selection with horizontal cards
- [ ] Service Extras Form with toggles
- [ ] Live Price Summary Bar
- [ ] Payment Screen with fare breakdown

### Issue #12: NativeWind Styling Implementation

**Type:** 🔧 Technical Task  
**Priority:** High  
**Assignee:** UI/UX Developer  

**Description:**
Implement consistent styling using NativeWind (Tailwind-like) framework.

**Tasks:**

- [ ] Set up NativeWind configuration
- [ ] Implement blue gradient theme (#001F5A to #0061FF)
- [ ] Define typography scale (H1 32pt, Body 16pt, Caption 12pt)
- [ ] Create reusable component styles
- [ ] Test dark mode compatibility

### Issue #13: South African Pricing Table Integration

**Type:** ✨ Feature Request  
**Priority:** Critical  
**Assignee:** Backend + Frontend Team  

**Description:**
Implement the complete SA pricing structure with real-time calculations.

**Tasks:**

- [ ] Create pricing lookup tables
- [ ] Implement distance-based calculations
- [ ] Add extras pricing (stairs, loading, packing, etc.)
- [ ] Build live calculation engine
- [ ] Add insurance and express options

### Issue #14: Price Calculator UI Component

**Type:** ✨ Feature Request  
**Priority:** High  
**Assignee:** Frontend Developer  

**Description:**
Build interactive price calculator with live updates.

**Tasks:**

- [ ] Distance input with autocomplete
- [ ] Vehicle class selector
- [ ] Extras toggles with price impact
- [ ] Live price display
- [ ] Fare breakdown modal

---

## Week 4 Issues

### Issue #15: Owner KYC Flow

**Type:** ✨ Feature Request  
**Priority:** Critical  
**Assignee:** Backend + Frontend Team  

**Description:**
Complete KYC onboarding flow for business owners.

**Tasks:**

- [ ] Business registration form
- [ ] ID document upload
- [ ] VAT certificate upload
- [ ] UBO documentation
- [ ] Optional face verification
- [ ] KYC status tracking

### Issue #16: Driver Onboarding System

**Type:** ✨ Feature Request  
**Priority:** Critical  
**Assignee:** Backend + Frontend Team  

**Description:**
Build driver invitation and onboarding system.

**Tasks:**

- [ ] Driver invitation link generation
- [ ] License upload and verification
- [ ] Selfie + liveness check (Gemini Vision)
- [ ] Truck assignment interface
- [ ] Background check integration

### Issue #17: Assistant (Mover) Onboarding

**Type:** ✨ Feature Request  
**Priority:** Medium  
**Assignee:** Backend + Frontend Team  

**Description:**
Create simplified onboarding for assistant movers.

**Tasks:**

- [ ] ID document upload
- [ ] Basic selfie verification
- [ ] Optional background check
- [ ] Skills assessment form
- [ ] Assignment to drivers

### Issue #18: Real-Time GPS Tracking

**Type:** ✨ Feature Request  
**Priority:** Critical  
**Assignee:** Mobile + Backend Team  

**Description:**
Implement live location sharing and tracking.

**Tasks:**

- [ ] Integrate react-native-maps
- [ ] Set up expo-location
- [ ] Implement Socket.IO location updates
- [ ] Build tracking UI for users
- [ ] Add trip animation and ETA updates

---

## Additional Weeks (5-8) Issues Available Upon Request

This template provides a structured approach to converting your roadmap into actionable GitHub issues. Each issue includes:

- Clear descriptions and acceptance criteria
- Priority levels and week assignments
- Specific technical tasks
- Team member assignments
- Dependencies and relationships

Would you like me to continue with the remaining weeks (5-8) or help you set up the actual GitHub repository with these issues and milestones?
