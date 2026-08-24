# System Architecture: RIDEMATE

## Architecture Overview
RIDEMATE employs a **Modular Layered Architecture** with strict Separation of Concerns:

```text
HTTP Request (Client / AI Studio Frontend)
   │
   ▼
[Security & Global Middlewares]
   ├── Helmet-equivalent Security Headers
   ├── CORS Policies
   ├── Rate Limiting
   ├── JSON Body Parser & Sanitization
   └── Structured Request Logger
   │
   ▼
[Routing Layer (/routes)]
   ├── API v1 Modular Routes (/api/v1/auth, /cars, /bookings, /operations, /stats, /ai)
   └── Backward Compatibility Legacy Routes (/cars, /api/cars, /api/stats, /api/health)
   │
   ▼
[Middleware Layer (/middlewares)]
   ├── AuthGuard (JWT Verification)
   ├── RoleGuard (RBAC: Admin, Operations, Customer)
   └── Schema Validation Guard (Input Sanity & Range Checks)
   │
   ▼
[Controller Layer (/controllers)]
   ├── Extracts & normalizes request parameters
   ├── Coordinates Service calls
   └── Returns standardized JSON envelopes (success/data/error)
   │
   ▼
[Service Layer (/services)]
   ├── Enforces Business Rules (BR-001 to BR-020)
   ├── Calculates pricing, taxes, protection plans
   ├── Handles authorization checks & entity transitions
   └── Orchestrates external integrations (Gemini AI)
   │
   ▼
[Repository Layer (/repositories)]
   ├── Data access abstraction
   ├── In-memory high-speed cache + atomic file persistence
   ├── Queries, filters, pagination, and sorting
   └── Entity serialization
   │
   ▼
[Data Layer / Database]
```

## Directory Structure
```text
src/
├── backend/
│   ├── config/              # Env, database, logger config
│   ├── constants/           # HTTP codes, status enums, pricing constants
│   ├── controllers/         # Request handling & HTTP response mapping
│   ├── middlewares/         # JWT auth, RBAC, rate limiting, error interceptor
│   ├── models/              # TypeScript entities & interfaces
│   ├── repositories/        # Persistence & data manipulation layer
│   ├── routes/              # Modular Express routing definitions
│   │   ├── v1/              # Versioned API routes
│   │   └── legacy.ts        # Backward-compatible endpoints
│   ├── services/            # Core business logic & AI orchestration
│   ├── utils/               # AppError, response wrapper, token generation, crypto
│   ├── validators/          # Input schema and payload validators
│   └── app.ts               # Express application builder
└── server.ts                # App entry point + Vite development / static hosting
```

## Data Flow Pipeline
1. **Request Ingestion**: Incoming requests pass through security headers, CORS, and request logging.
2. **Authentication & Authorization**: Protected endpoints verify the `Authorization: Bearer <token>` header, decoding the user identity, and verify role clearance.
3. **Input Validation**: Dedicated validator functions verify structure, types, ranges, and allowed enum values before touching service layers.
4. **Business Rule Execution**: Services enforce invariants (e.g., duplicate VIN checks, booking collision checks, price calculations, and audit log generation).
5. **Data Persistence**: Repositories query and commit changes safely.
6. **Consistent Response Envelope**: The controller returns a standardized payload format:
   ```json
   {
     "success": true,
     "message": "Operation successful",
     "data": { ... }
   }
   ```
