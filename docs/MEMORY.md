# PROJECT MEMORY

## Current State
- **Backend Status**: Production-Ready & Operational
- **Current Module**: Full Stack Integration & Production Backend Verification
- **Current Implementation Phase**: Phase 1 Complete (Backend Architecture, Endpoints, Testing, Documentation)

## Completed
- **Persistent AI Context System**: All 15 context specification documents under `/docs` including `MEMORY.md`.
- **Core Infrastructure & Security**:
  - `src/backend/config/`: Typed environment loader (`env.ts`), structured logger (`logger.ts`), database status manager (`database.ts`).
  - `src/backend/utils/`: Custom `AppError` hierarchy (`errors.ts`), response wrappers (`response.ts`), PBKDF2 password hashing & HMAC-SHA256 JWT engine (`crypto.ts`).
  - `src/backend/middlewares/`: JWT authentication & RBAC guards (`auth.ts`), rate limiter (`rateLimiter.ts`), security headers & CORS (`security.ts`), centralized error interceptor (`error.ts`).
- **Data Repositories**:
  - `CarRepository`, `UserRepository`, `BookingRepository`, `OperationsRepository`, `ActivityLogRepository` with deep cloning, seed defaults, and filtering.
- **Business Services**:
  - `AuthService`: Registration, login, password reset request/verification, profile retrieval.
  - `BackendCarService`: Multi-filter search, vehicle CRUD, duplicate registration/VIN validation, batch ops, audit logging.
  - `BookingService`: Dynamic price calculation (subtotal, 11.25% taxes, protection tiers), pickup code generation (`RM-XXXX`), status transitions.
  - `OperationsService`: Fleet telematics, remote vehicle commands (`lock`, `unlock`, `honk`, `immobilize`), action item approval workflows.
  - `StatsService`: Fleet valuation, utilization rate, category distribution, recent activity logs.
  - `AIService`: Server-side Gemini AI description generation (`@google/genai`) with domain fallbacks.
- **Frontend AI Integration**:
  - `AdminAddCar.tsx`: Integrated AI Copy Generation trigger button invoking backend `/api/v1/ai/generate-description`.
  - `carService.ts`: Connected `generateDescription` method.
- **Controllers & Routing**:
  - API v1 routers (`/api/v1/auth`, `/api/v1/cars`, `/api/v1/bookings`, `/api/v1/operations`, `/api/v1/stats`, `/api/v1/ai`).
  - Legacy routes (`/cars`, `/api/cars`, `/api/stats`, `/api/health`, `/api/cars/reset`) preserving 100% backward compatibility.
- **Server Bootstrap & Build**:
  - `server.ts`: Modular server integrating Vite development SPA middleware and production static bundle serving.
- **Automated Tests**:
  - `tests/backend.test.ts`: 19 automated integration tests covering all critical paths (19/19 passed).

## In Progress
- Continuous context synchronization and frontend service integration check.

## Important Decisions
- **DEC-001**: Modular Layered Architecture (Routes → Controllers → Services → Repositories).
- **DEC-002**: Stateless JWT with embedded RBAC claims (`customer`, `operations`, `admin`).
- **DEC-003**: Abstracted Repository Pattern with in-memory store and atomic sync.
- **DEC-004**: Dual API strategy (REST v1 + legacy aliases) for zero frontend breakage.
- **DEC-005**: Centralized `AppError` response envelope.
- **DEC-006**: Server-side Gemini AI integration safeguarding API keys.
- **DEC-007**: Backend calculation invariants for pricing, taxes, and protection plans.
- **DEC-008**: In-memory sliding window rate limiting for public & auth endpoints.

## Important Constraints
- Node.js / TypeScript environment with Vite dev middleware in development mode and static SPA delivery in production mode.
- Strictly maintain backward compatibility for existing frontend endpoints (`/api/cars`, `/api/stats`, `/cars`).

## Known Issues
- None. All tests pass with 0 errors.

## Next Actions
- Maintain context synchronization on any new feature additions.

## Dedicated Project Directories
- `/frontend`: Self-contained frontend application (React 19, TypeScript, Vite, Tailwind CSS).
- `/backend`: Self-contained backend API (Express.js, TypeScript, Layered Architecture, Automated Tests).
- `/docs`: Persistent AI & architectural documentation context.

## Server URLs & Endpoints
- **Frontend Web App URL**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server URL**: [http://localhost:5000](http://localhost:5000)
  - Health Endpoint: [http://localhost:5000/api/health](http://localhost:5000/api/health)
  - API v1 Root: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
  - Fleet Inventory: [http://localhost:5000/api/v1/cars](http://localhost:5000/api/v1/cars)
  - Operations Telemetry: [http://localhost:5000/api/v1/operations/telemetry](http://localhost:5000/api/v1/operations/telemetry)
  - Analytics & Stats: [http://localhost:5000/api/v1/stats](http://localhost:5000/api/v1/stats)

## Important Files
- `src/backend/server.ts`: Standalone Backend API server (`npm run dev:backend` on port 5000).
- `vite.config.ts`: Frontend server configuration with reverse proxy (`npm run dev:frontend` on port 5173).
- `server.ts`: Integrated dev/production server (`npm run dev` on port 3000).
- `src/backend/app.ts`: Express application builder.
- `src/backend/routes/v1/index.ts`: API v1 routing manifest.
- `src/backend/routes/legacyRoutes.ts`: Legacy endpoint mappings.
- `src/backend/services/`: Core business logic services.
- `src/backend/repositories/`: Data persistence layer.
- `tests/backend.test.ts`: Automated test suite.
