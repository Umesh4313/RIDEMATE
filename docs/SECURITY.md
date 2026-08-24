# Security Architecture & Policies: RIDEMATE

## Security Standards & Policies

### 1. Authentication & Token Security
- **JWT (JSON Web Tokens)**: Tokens signed with SHA-256 HMAC utilizing `JWT_SECRET` environment variable.
- **Expiration Policy**: Access tokens expire in 24 hours (configurable via `JWT_EXPIRES_IN`).
- **Authorization Header**: Tokens must be passed in the `Authorization` header as `Bearer <token>`.
- **Payload Sanitization**: Passwords, password hashes, and sensitive credentials are never stored in JWT payloads or returned in API responses.

### 2. Password Hashing & Encryption
- **Algorithm**: Cryptographic salt + hash (bcrypt / PBKDF2 with HMAC-SHA256).
- **Zero Plaintext Storage**: All stored user passwords are irreversibly hashed before persistence.

### 3. Role-Based Access Control (RBAC)
- **Roles**:
  - `admin`: Full unrestricted access to all endpoints, fleet CRUD, bulk operations, settings, logs.
  - `operations`: Telemetry control, remote commands, status updates, action item approvals, booking management.
  - `customer`: Vehicle search, booking creation, personal booking history, profile management.

### 4. Input Validation & Injection Prevention
- **Schema Validation**: All input bodies and query parameters pass strict type and constraint validations.
- **Sanitization**: Trimmed string inputs, sanitized search queries, SQL/NoSQL injection prevention, HTML tag stripping.

### 5. HTTP Security Headers & CORS
- **CORS**: Configurable allowed origins (`*` in local development or specific frontend domains in production).
- **Security Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`

### 6. Rate Limiting & DoS Protection
- **Sliding Window Rate Limiter**:
  - Auth endpoints (`/api/v1/auth/*`): 10 requests per minute per IP.
  - General API endpoints: 120 requests per minute per IP.
  - Returns `429 Too Many Requests` when exceeded with `Retry-After` header.

### 7. Sensitive Data Protection
- Never log passwords, tokens, full credit card numbers, or API keys.
- Store only last 4 digits of payment method (`paymentMethodLast4`).
- Environment secrets isolated in `.env` and `.env.example` templates.
