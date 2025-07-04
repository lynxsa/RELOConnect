# RELOConnect Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
RELOConnect is a comprehensive relocation and logistics platform built with React Native Expo and TypeScript.

## Key Technologies & Patterns
- **Frontend**: React Native with Expo, TypeScript, NativeWind (Tailwind CSS)
- **State Management**: Zustand for global state
- **Navigation**: React Navigation v6 with bottom tabs, stack, and drawer
- **Styling**: NativeWind with blue gradient theme (#0057FF → #00B2FF)
- **Maps**: React Native Maps with Google Maps integration
- **Payments**: Stripe integration for payments
- **Real-time**: Socket.IO for chat and live tracking
- **Backend**: Node.js with Express, Prisma ORM, PostgreSQL

## Module Structure
1. **RELOConnect**: Main relocation booking module
2. **RELOCare**: Donations and item sharing
3. **RELONews**: Industry news feed
4. **RELOPorts**: Port data and shipping information
5. **Driver App**: Driver-specific interface
6. **Admin Dashboard**: Web-based admin panel

## Design Guidelines
- Use electric blue (#0057FF) as primary color
- Implement gradient backgrounds: `bg-gradient-to-r from-blue-600 to-blue-400`
- Button heights: 44-50px, input heights: 48px
- Font sizes: H1:32pt, H2:24pt, Body:16pt, Caption:12pt
- Spacing: 4,8,16,24px intervals
- Use Feather Icons and Storyset illustrations
- Support dark mode with automatic detection

## Code Standards
- Use TypeScript with strict typing
- Implement proper error handling and loading states
- Follow React Native best practices
- Use functional components with hooks
- Implement proper accessibility features
- Keep components modular and reusable

## File Organization
- Components in `/src/components/`
- Screens in `/src/screens/`
- Navigation in `/src/navigation/`
- Services in `/src/services/`
- Types in `/src/types/`
- Utils in `/src/utils/`
- Assets in `/src/assets/`
