# RIDEMATE — Car Rental & Fleet Management System

Production-ready, modular, and enterprise-grade car rental booking platform and fleet management administrative backend.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Framer Motion
- **Backend**: Node.js, Express, TypeScript (`tsx` / `esbuild`), Layered Architecture
- **Authentication**: JWT (Stateless HMAC-SHA256) + PBKDF2 Password Hashing + RBAC
- **AI Integrations**: Google Gemini API (`@google/genai`) for automated vehicle copywriting
- **Persistence**: Abstracted Repository Pattern with atomic data sync

---

## Quick Start

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and adjust variables as needed:
```bash
cp .env.example .env
```

### 3. Run Development Server
Starts the Express API and mounts Vite with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open: [http://localhost:3000](http://localhost:3000)

### 4. Run Automated Tests
Executes the comprehensive backend integration test suite covering auth, CRUD, bookings, telemetry, stats, and legacy compatibility:
```bash
npm test
```

### 5. Production Build & Start
```bash
npm run build
npm run start
```

---

## API Documentation
Complete architectural specifications and contracts are maintained in `/docs`:
- [System Architecture](docs/ARCHITECTURE.md)
- [API Contract & Endpoints](docs/API_CONTRACT.md)
- [Database & Entities](docs/DATABASE.md)
- [Business Rules](docs/BUSINESS_RULES.md)
- [Security Policies](docs/SECURITY.md)
- [Error Handling](docs/ERROR_HANDLING.md)
- [Validation Specifications](docs/VALIDATION.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

---

## Project Structure
```text
├── docs/                     # Persistent AI & System Context Documentation
├── src/
│   ├── backend/              # Production Modular Backend
│   │   ├── config/           # Environment, logger, DB connection
│   │   ├── constants/        # Enums, roles, status, pricing rules
│   │   ├── controllers/      # Route controllers (Auth, Cars, Bookings, Ops, Stats, AI)
│   │   ├── middlewares/      # JWT AuthGuard, RBAC, rate limiting, error handling
│   │   ├── models/           # Typed entity schemas
│   │   ├── repositories/     # Data persistence abstraction layer
│   │   ├── routes/           # Versioned API routes (/api/v1/*) & legacy aliases
│   │   ├── services/         # Business logic, pricing calculations, AI orchestration
│   │   ├── utils/            # AppError hierarchy, crypto, response envelopes
│   │   ├── validators/       # Request payload validation guards
│   │   └── app.ts            # Express application assembler
│   ├── components/           # React frontend UI & Admin screens
│   ├── data/                 # Seed data
│   └── services/             # Frontend car service adapter
├── tests/                    # Automated integration test suites
├── server.ts                 # Main server entry point
├── package.json
└── tsconfig.json
```
