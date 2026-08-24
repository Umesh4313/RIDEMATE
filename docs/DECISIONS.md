# Architecture Decisions Log: RIDEMATE

### DEC-001: Modular Layered Backend Architecture
- **Decision**: Organize the backend into explicit layers: `routes`, `controllers`, `services`, `repositories`, `models`, `middlewares`, `validators`, `utils`, `config`.
- **Why**: Keeps business logic isolated from HTTP routing, enables straightforward testing, and allows data persistence swap without altering business services.
- **Alternatives considered**: Monolithic route file (`server.ts` only), Domain-Driven Design (too heavy for initial scope).
- **Impact**: Code is modular, clean, and extensible.
- **Date**: 2026-08-24

### DEC-002: JWT with Stateless Access Tokens & Secure RBAC
- **Decision**: Implement HMAC SHA-256 JWT tokens for stateless authentication with embedded role claims (`customer`, `operations`, `admin`).
- **Why**: Eliminates server-side session lookup bottlenecks and supports SPA frontends and mobile API consumers cleanly.
- **Alternatives considered**: Stateful server-side sessions with cookies.
- **Impact**: Tokens are passed in `Authorization: Bearer <token>` header with fine-grained endpoint authorization guards.
- **Date**: 2026-08-24

### DEC-003: Abstracted Repository Pattern with In-Memory & File Persistence
- **Decision**: Build generic and typed Repositories (`CarRepository`, `UserRepository`, `BookingRepository`, `OperationsRepository`, `ActivityLogRepository`) backed by in-memory stores with JSON file-level atomic syncing.
- **Why**: Zero external database dependency required out of the box for immediate setup and development, while allowing 1:1 pluggable transition to PostgreSQL / MongoDB.
- **Alternatives considered**: Direct SQLite dependency (can have cross-platform binary build issues on Windows / Bun), raw in-memory only without persistence.
- **Impact**: Fast runtime execution with automatic seed data recovery and persistent local writes.
- **Date**: 2026-08-24

### DEC-004: Dual API Route Strategy (v1 REST + Legacy Compatibility)
- **Decision**: Implement canonical RESTful routes under `/api/v1/*` while preserving `/api/cars`, `/cars`, `/api/stats`, `/api/health`, and `/api/cars/reset` aliases.
- **Why**: Preserves 100% backward compatibility with existing AI Studio frontend code and `carService.ts` while establishing forward-compatible versioned API standards.
- **Alternatives considered**: Breaking old routes and forcing frontend overhaul.
- **Impact**: Zero breakage on frontend components.
- **Date**: 2026-08-24

### DEC-005: Centralized Error Hierarchy (`AppError`)
- **Decision**: Implement standard error classes (`AppError`, `NotFoundError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`) with standardized JSON payloads.
- **Why**: Prevents uncaught exceptions from leaking stack traces to clients and provides uniform error payload structure.
- **Alternatives considered**: Inconsistent ad-hoc `res.status(500).send(err.message)`.
- **Impact**: Consistent API contract across all endpoints.
- **Date**: 2026-08-24

### DEC-006: Gemini AI Server-Side Integration
- **Decision**: Integrate `@google/genai` on the backend under `/api/v1/ai/generate-description` utilizing `process.env.GEMINI_API_KEY`.
- **Why**: Protects user API keys from browser leakage while delivering automated car marketing copywriting and intelligent fleet insights.
- **Alternatives considered**: Client-side Gemini SDK calls.
- **Impact**: Secure, centralized AI processing.
- **Date**: 2026-08-24

### DEC-007: Pricing & Protection Plan Calculation Invariants
- **Decision**: Calculate daily rental subtotals, protection plan fees (`basic`: $0, `standard`: $15/day, `premium`: $28/day), and 11.25% taxes strictly on the backend.
- **Why**: Protects financial integrity against client-side payload tampering.
- **Alternatives considered**: Trusting frontend-submitted totals.
- **Impact**: Rock-solid booking calculations and accounting consistency.
- **Date**: 2026-08-24

### DEC-008: Sliding Window Rate Limiting
- **Decision**: Implement lightweight in-memory rate limiting middleware for auth endpoints and public APIs.
- **Why**: Protects against brute-force login attempts and denial-of-service spam without heavy external dependencies like Redis.
- **Alternatives considered**: No rate limiting, external Redis rate limiter.
- **Impact**: Enhanced API security and resilience.
- **Date**: 2026-08-24
