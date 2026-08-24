# Testing Strategy: RIDEMATE

## Test Levels

### 1. Unit Testing
- **Password & Token Crypto**: Tests for hashing, salt verification, JWT generation, and expiration decoding.
- **Pricing & Fee Calculation**: Tests for booking subtotals, tax rate (11.25%), protection plans (`basic`: $0, `standard`: $15/day, `premium`: $28/day), and aggregate calculation.
- **Validation Schemas**: Tests for valid/invalid vehicle payloads, duplicate VINs, email formats, and required field invariants.

### 2. Service & Repository Integration Testing
- **AuthService**: Register new user, login with valid/invalid credentials, password reset code generation and verification.
- **CarService & Repository**: CRUD operations, multi-attribute filtering, sorting, duplicate VIN/registration collision protection, status transitions.
- **BookingService**: Booking creation, pickup code uniqueness (`RM-XXXX`), availability checking, status updates, cancellation transitions.
- **StatsService**: Metric calculations (utilization rate, average rate, total valuation, category count).

### 3. API Integration Testing
- **Health check**: `GET /api/health` returns status `ok`.
- **Auth APIs**: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`.
- **Cars APIs**: `GET /api/v1/cars`, `POST /api/v1/cars`, `PUT /api/v1/cars/:id`, `DELETE /api/v1/cars/:id`.
- **Legacy Routes**: `GET /api/cars`, `GET /cars`, `GET /api/stats`.
- **Error Responses**: Validation errors return 400, unauthorized requests return 401, not found returns 404, duplicates return 409.

## Test Runner Commands
```bash
# Type check all source and test files
npm run lint

# Run backend automated integration tests
npm test
```
