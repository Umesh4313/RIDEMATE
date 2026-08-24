# Backend Requirements: RIDEMATE

## Structured Backend Requirements

### Module 1: Authentication & Authorization
- **REQ-001**
  - **Description**: User registration with name, email, phone, driver license, and secure password.
  - **Source**: PRD / `AuthModal.tsx`
  - **Priority**: High
  - **Backend Impact**: `/api/v1/auth/register`, User entity, password hashing, JWT generation.
  - **Status**: Implemented

- **REQ-002**
  - **Description**: User login with email/password returning JWT access token and sanitized user profile.
  - **Source**: PRD / `AuthModal.tsx`
  - **Priority**: High
  - **Backend Impact**: `/api/v1/auth/login`, credentials verification.
  - **Status**: Implemented

- **REQ-003**
  - **Description**: Password reset flow with verification code and new password setting.
  - **Source**: PRD / `AuthModal.tsx`
  - **Priority**: Medium
  - **Backend Impact**: `/api/v1/auth/forgot-password`, `/api/v1/auth/reset-password`.
  - **Status**: Implemented

- **REQ-004**
  - **Description**: Role-Based Access Control (Roles: `customer`, `operations`, `admin`).
  - **Source**: PRD / Admin & Ops Dashboards
  - **Priority**: High
  - **Backend Impact**: Auth and role guard middlewares.
  - **Status**: Implemented

---

### Module 2: Vehicle & Fleet Inventory (CRUD)
- **REQ-005**
  - **Description**: Public and authenticated search and filtering of vehicles with parameters (`search`, `brand`, `category`, `status`, `minPrice`, `maxPrice`, `sortBy`, `sortOrder`, `page`, `limit`).
  - **Source**: PRD / `HomeScreen.tsx`, `SearchResultsScreen.tsx`, `AdminCarRecords.tsx`
  - **Priority**: High
  - **Backend Impact**: `GET /api/v1/cars`, `GET /api/cars`, `GET /cars`.
  - **Status**: Implemented

- **REQ-006**
  - **Description**: Fetch individual vehicle detail by unique identifier.
  - **Source**: PRD / `VehicleDetailsScreen.tsx`, `AdminViewModal.tsx`
  - **Priority**: High
  - **Backend Impact**: `GET /api/v1/cars/:id`, `GET /api/cars/:id`, `GET /cars/:id`.
  - **Status**: Implemented

- **REQ-007**
  - **Description**: Add new vehicle to fleet with validation for required fields, unique registration number, and unique VIN.
  - **Source**: PRD / `AdminAddCar.tsx`
  - **Priority**: High
  - **Backend Impact**: `POST /api/v1/cars`, `POST /api/cars`, `POST /cars`.
  - **Status**: Implemented

- **REQ-008**
  - **Description**: Update vehicle specifications, rental rate, discount, images, location, or status (`Available`, `Rented`, `Maintenance`, `Unavailable`).
  - **Source**: PRD / `AdminEditModal.tsx`
  - **Priority**: High
  - **Backend Impact**: `PUT /api/v1/cars/:id`, `PUT /api/cars/:id`, `PUT /cars/:id`.
  - **Status**: Implemented

- **REQ-009**
  - **Description**: Delete vehicle permanently or soft-delete with activity logging.
  - **Source**: PRD / `AdminDeleteModal.tsx`
  - **Priority**: High
  - **Backend Impact**: `DELETE /api/v1/cars/:id`, `DELETE /api/cars/:id`, `DELETE /cars/:id`.
  - **Status**: Implemented

- **REQ-010**
  - **Description**: Bulk status updates and bulk deletion of vehicle records.
  - **Source**: PRD / `AdminCarRecords.tsx`
  - **Priority**: Medium
  - **Backend Impact**: `POST /api/v1/cars/batch-status`, `POST /api/v1/cars/batch-delete`.
  - **Status**: Implemented

---

### Module 3: Bookings & Reservations
- **REQ-011**
  - **Description**: Create booking reservation with calculated rental days, daily rate, protection plan fee (Basic $0/day, Standard $15/day, Premium $28/day), 11.25% taxes/fees, and generated pickup code (e.g. `RM-8472`).
  - **Source**: PRD / `CheckoutModal.tsx`
  - **Priority**: High
  - **Backend Impact**: `POST /api/v1/bookings`, Booking model, inventory status synchronization.
  - **Status**: Implemented

- **REQ-012**
  - **Description**: List user bookings and filter by status (`Confirmed`, `Active`, `Completed`, `Cancelled`).
  - **Source**: PRD / `MyBookingsScreen.tsx`
  - **Priority**: High
  - **Backend Impact**: `GET /api/v1/bookings`, `GET /api/v1/bookings/my-bookings`.
  - **Status**: Implemented

- **REQ-013**
  - **Description**: Cancel booking and update vehicle status back to Available.
  - **Source**: PRD / `MyBookingsScreen.tsx`
  - **Priority**: High
  - **Backend Impact**: `POST /api/v1/bookings/:id/cancel`.
  - **Status**: Implemented

---

### Module 4: Fleet Operations & Telemetry
- **REQ-014**
  - **Description**: Fleet telemetry monitoring (battery/fuel percentage, odometer mileage, GPS location coordinates, status).
  - **Source**: PRD / `OperationsDashboard.tsx`
  - **Priority**: Medium
  - **Backend Impact**: `GET /api/v1/operations/telemetry`, `PUT /api/v1/operations/telemetry/:id`.
  - **Status**: Implemented

- **REQ-015**
  - **Description**: Execute remote vehicle commands: `lock`, `unlock`, `honk`, `immobilize`.
  - **Source**: PRD / `OperationsDashboard.tsx`
  - **Priority**: Medium
  - **Backend Impact**: `POST /api/v1/operations/remote-command`.
  - **Status**: Implemented

- **REQ-016**
  - **Description**: Driver license and handover action item queue with approval/rejection workflows.
  - **Source**: PRD / `OperationsDashboard.tsx`
  - **Priority**: Medium
  - **Backend Impact**: `GET /api/v1/operations/action-items`, `PUT /api/v1/operations/action-items/:id`.
  - **Status**: Implemented

---

### Module 5: Analytics, Metrics & Audit Logs
- **REQ-017**
  - **Description**: System dashboard statistics (total fleet count, available/rented/maintenance/unavailable breakdowns, total valuation, average daily rate, utilization rate, category distribution, recent activity logs).
  - **Source**: PRD / `AdminDashboard.tsx`, `carService.ts`
  - **Priority**: High
  - **Backend Impact**: `GET /api/v1/stats`, `GET /api/stats`.
  - **Status**: Implemented

- **REQ-018**
  - **Description**: Audit logging for vehicle creation, status modification, deletions, and administrative actions.
  - **Source**: PRD / `AdminDashboard.tsx`
  - **Priority**: Medium
  - **Backend Impact**: `GET /api/v1/stats/activity-logs`, `DELETE /api/v1/stats/activity-logs`.
  - **Status**: Implemented

---

### Module 6: AI Features (Gemini)
- **REQ-019**
  - **Description**: Generate vehicle marketing descriptions and feature highlights using Gemini AI (`@google/genai`).
  - **Source**: PRD / `metadata.json` (`MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`)
  - **Priority**: Medium
  - **Backend Impact**: `POST /api/v1/ai/generate-description`.
  - **Status**: Implemented

---

### Module 7: Health & System Diagnostics
- **REQ-020**
  - **Description**: Health check endpoint returning uptime, status, database status, and memory metrics.
  - **Source**: Production standard
  - **Priority**: High
  - **Backend Impact**: `GET /api/health`.
  - **Status**: Implemented
