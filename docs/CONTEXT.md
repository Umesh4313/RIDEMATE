# Project Context: RIDEMATE

## Project Overview
**RIDEMATE** is a high-performance, enterprise-grade car rental booking platform and fleet management administrative ecosystem. It provides customers with a seamless vehicle search, booking, and digital pickup experience, while providing fleet managers and operations teams with real-time telematics, inventory controls, vehicle lifecycle management, and administrative dashboards.

## Target Users
1. **Public / Retail Customers**: Search vehicles by location, dates, and category; compare specifications; book rentals with insurance protection tiers; track reservations with unique pickup codes (e.g. `RM-8472`).
2. **Operations & Fleet Staff**: Monitor live telemetry (fuel/battery, mileage, GPS locations), execute remote vehicle commands (lock/unlock, immobilize, horn), verify driver licenses, and dispatch digital keys.
3. **Super Administrators**: Full fleet CRUD management, vehicle pricing and valuation analytics, bulk inventory actions, staff activity audit logs, and AI-powered vehicle listing optimizations.

## Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express 4.x, TypeScript (`tsx` / `esbuild`), Layered Architecture (Routes → Controllers → Services → Repositories).
- **Authentication**: JWT (JSON Web Tokens) with HS256, bcrypt-compatible password hashing, Role-Based Access Control (RBAC).
- **AI Integrations**: Google Gemini API (`@google/genai`) for marketing description generation and intelligent fleet analytics.
- **Data Persistence**: Abstracted Repository Pattern with in-memory seeded store, atomic file persistence, and ready for PostgreSQL/MongoDB drivers.

## Current Development Phase
- **Phase**: Backend Production Architecture & Implementation (Phase 1).
- **Status**: Production-ready modular backend with full API coverage and synchronized context documentation.
