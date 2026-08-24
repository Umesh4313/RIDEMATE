# API Contract: RIDEMATE

## Base URL
- Versioned: `/api/v1`
- Legacy / Direct: `/api/*` and `/cars/*`

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "name": "Alex Mercer",
    "email": "alex@example.com",
    "phone": "+1 415 555 0199",
    "password": "SecurePassword123!",
    "driverLicenseNumber": "CA-D8829104",
    "role": "customer"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "usr-12345",
        "name": "Alex Mercer",
        "email": "alex@example.com",
        "role": "customer"
      },
      "token": "eyJhbGciOi..."
    }
  }
  ```

### `POST /api/v1/auth/login`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "ganesh@ridemate.io",
    "password": "password123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "usr-admin-1",
        "name": "Ganesh J.",
        "email": "ganesh@ridemate.io",
        "role": "admin"
      },
      "token": "eyJhbGciOi..."
    }
  }
  ```

### `POST /api/v1/auth/forgot-password`
- **Auth**: Public
- **Request Body**: `{ "email": "ganesh@ridemate.io" }`
- **Response `200 OK`**: `{ "success": true, "message": "Verification code sent." }`

### `POST /api/v1/auth/reset-password`
- **Auth**: Public
- **Request Body**:
  ```json
  {
    "email": "ganesh@ridemate.io",
    "code": "482917",
    "newPassword": "NewPassword123!"
  }
  ```
- **Response `200 OK`**: `{ "success": true, "message": "Password reset successfully." }`

---

## 2. Fleet & Vehicle Endpoints

### `GET /api/v1/cars` (also `/api/cars` and `/cars`)
- **Auth**: Public
- **Query Parameters**:
  - `search` (string): Text search across name, brand, model, registration, VIN, color
  - `brand` (string): e.g. "BMW", "Porsche", "Tesla", "All"
  - `category` (string): "Sedan", "SUV", "Luxury", "Electric", "Sports", etc.
  - `status` (string): "Available", "Rented", "Maintenance", "Unavailable", "All"
  - `minPrice` (number): Minimum daily rental rate
  - `maxPrice` (number): Maximum daily rental rate
  - `sortBy` (string): `rentalPricePerDay`, `price`, `year`, `name`, `mileage`, `createdAt`
  - `sortOrder` (string): `asc` | `desc`
  - `page` (number): default 1
  - `limit` (number): default 50
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "count": 12,
    "total": 12,
    "page": 1,
    "totalPages": 1,
    "data": [
      {
        "id": "car-bmw-m4",
        "name": "BMW M4 Competition Coupe",
        "brand": "BMW",
        "model": "M4 Competition xDrive",
        "year": 2024,
        "registrationNumber": "CA-8KX9201",
        "vin": "WBA43AZ08PFP98124",
        "category": "Sports",
        "fuelType": "Gas",
        "transmission": "Automatic",
        "seatingCapacity": 4,
        "color": "Isle of Man Green",
        "mileage": 8420,
        "price": 86500,
        "rentalPricePerDay": 210,
        "discount": 10,
        "status": "Available",
        "images": ["https://..."],
        "imageUrl": "https://...",
        "description": "Track-bred performance coupe...",
        "location": "San Francisco International Airport (SFO)",
        "rating": 4.96,
        "reviewsCount": 84,
        "specs": {
          "engine": "3.0L Twin-Turbo Inline-6 (503 hp)",
          "acceleration": "0-60 mph in 3.4s",
          "topSpeed": "180 mph",
          "drivetrain": "M xDrive AWD",
          "climate": "Dual-zone climate control"
        }
      }
    ]
  }
  ```

### `GET /api/v1/cars/:id` (also `/api/cars/:id` and `/cars/:id`)
- **Auth**: Public
- **Response `200 OK`**: `{ "success": true, "data": { ...carRecord } }`
- **Response `404 Not Found`**: `{ "success": false, "message": "Car with ID '...' not found.", "code": "NOT_FOUND" }`

### `POST /api/v1/cars` (also `/api/cars` and `/cars`)
- **Auth**: Authenticated (Admin / Operations)
- **Request Body**:
  ```json
  {
    "name": "Porsche 911 GT3 RS",
    "brand": "Porsche",
    "model": "911 GT3 RS",
    "year": 2024,
    "registrationNumber": "CA-911GT3R",
    "vin": "WP0AB2A92PS192847",
    "category": "Sports",
    "fuelType": "Gas",
    "transmission": "Automatic",
    "seatingCapacity": 2,
    "color": "Guards Red",
    "price": 241300,
    "rentalPricePerDay": 580,
    "discount": 0,
    "mileage": 1400,
    "location": "San Francisco International Airport (SFO)",
    "description": "Track-ready supercar with naturally aspirated 4.0L flat-six...",
    "images": ["https://..."]
  }
  ```
- **Response `201 Created`**: `{ "success": true, "message": "Car added successfully.", "data": { ...carRecord } }`

### `PUT /api/v1/cars/:id` (also `/api/cars/:id` and `/cars/:id`)
- **Auth**: Authenticated (Admin / Operations)
- **Request Body**: Partial car updates
- **Response `200 OK`**: `{ "success": true, "message": "Car updated successfully.", "data": { ...updatedRecord } }`

### `DELETE /api/v1/cars/:id` (also `/api/cars/:id` and `/cars/:id`)
- **Auth**: Authenticated (Admin)
- **Response `200 OK`**: `{ "success": true, "message": "Car was successfully deleted.", "deletedId": "..." }`

### `POST /api/v1/cars/batch-delete`
- **Auth**: Authenticated (Admin)
- **Request Body**: `{ "ids": ["car-1", "car-2"] }`
- **Response `200 OK`**: `{ "success": true, "message": "Bulk deleted 2 vehicles.", "deletedCount": 2 }`

### `POST /api/v1/cars/batch-status`
- **Auth**: Authenticated (Admin / Operations)
- **Request Body**: `{ "ids": ["car-1", "car-2"], "status": "Maintenance" }`
- **Response `200 OK`**: `{ "success": true, "message": "Bulk updated 2 vehicles to Maintenance." }`

### `POST /api/cars/reset` (and `/api/v1/cars/reset`)
- **Auth**: Public / Demo
- **Response `200 OK`**: `{ "success": true, "message": "Database reset to initial fleet records.", "count": 12 }`

---

## 3. Booking Endpoints

### `POST /api/v1/bookings`
- **Auth**: Optional / Customer
- **Request Body**:
  ```json
  {
    "vehicleId": "car-bmw-m4",
    "pickupLocation": "San Francisco International Airport (SFO)",
    "dropoffLocation": "San Francisco International Airport (SFO)",
    "pickupDate": "2026-10-24",
    "pickupTime": "10:00 AM",
    "dropoffDate": "2026-10-27",
    "dropoffTime": "2:00 PM",
    "days": 3,
    "protectionPlan": "standard",
    "customerName": "Ganesh J.",
    "customerEmail": "ganesh@ridemate.io",
    "customerPhone": "+1 (415) 555-0199",
    "driverLicenseNumber": "CA-D8829104",
    "paymentMethodLast4": "4242"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "message": "Reservation confirmed",
    "data": {
      "id": "bk-rm-8472",
      "pickupCode": "RM-8472",
      "vehicleId": "car-bmw-m4",
      "days": 3,
      "dailyRate": 210,
      "rentalRateTotal": 630,
      "taxesAndFees": 70.88,
      "protectionPlan": "standard",
      "protectionFee": 45,
      "totalDue": 745.88,
      "status": "Confirmed",
      "createdAt": "2026-08-24T13:30:00Z"
    }
  }
  ```

### `GET /api/v1/bookings`
- **Auth**: Authenticated (Staff / Customer)
- **Query Params**: `status`, `customerEmail`, `page`, `limit`
- **Response `200 OK`**: `{ "success": true, "count": 5, "data": [ ...bookings ] }`

### `POST /api/v1/bookings/:id/cancel`
- **Auth**: Authenticated
- **Response `200 OK`**: `{ "success": true, "message": "Reservation cancelled successfully." }`

---

## 4. Operations & Telemetry Endpoints

### `GET /api/v1/operations/telemetry`
- **Auth**: Authenticated (Staff)
- **Response `200 OK`**: `{ "success": true, "data": [ ...fleetVehiclesWithTelemetry ] }`

### `POST /api/v1/operations/remote-command`
- **Auth**: Authenticated (Staff)
- **Request Body**: `{ "vehicleId": "car-1", "command": "lock" | "unlock" | "honk" | "immobilize" }`
- **Response `200 OK`**: `{ "success": true, "message": "Command 'lock' executed successfully." }`

### `GET /api/v1/operations/action-items`
- **Auth**: Authenticated (Staff)
- **Response `200 OK`**: `{ "success": true, "data": [ ...actionItems ] }`

### `PUT /api/v1/operations/action-items/:id`
- **Auth**: Authenticated (Staff)
- **Request Body**: `{ "status": "approved" | "rejected" | "completed" }`
- **Response `200 OK`**: `{ "success": true, "data": { ...updatedActionItem } }`

---

## 5. Analytics & Stats Endpoints

### `GET /api/v1/stats` (also `/api/stats`)
- **Auth**: Public / Staff
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "stats": {
      "totalCars": 12,
      "availableCars": 8,
      "rentedCars": 3,
      "unavailableCars": 0,
      "maintenanceCars": 1,
      "averageRentalRate": 178,
      "totalFleetValuation": 1045000,
      "utilizationRate": 25
    },
    "categoryBreakdown": { "Sedan": 4, "SUV": 3, "Luxury": 2, "Sports": 2, "Electric": 1 },
    "recentActivity": [ ...logs ],
    "recentlyAdded": [ ...cars ]
  }
  ```

---

## 6. AI Features (Gemini)

### `POST /api/v1/ai/generate-description`
- **Auth**: Public / Authenticated
- **Request Body**:
  ```json
  {
    "brand": "BMW",
    "model": "M4 Competition",
    "year": 2024,
    "category": "Sports",
    "fuelType": "Gas",
    "specs": { "engine": "3.0L Twin-Turbo", "acceleration": "0-60 in 3.4s" }
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "description": "Experience raw German engineering with the 2024 BMW M4 Competition..."
    }
  }
  ```

---

## 7. Diagnostics

### `GET /api/health`
- **Auth**: Public
- **Response `200 OK`**:
  ```json
  {
    "status": "ok",
    "uptime": 124.5,
    "timestamp": "2026-08-24T13:30:00Z",
    "totalCars": 12,
    "environment": "development"
  }
  ```
