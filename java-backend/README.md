# RIDEMATE - Java Spring Boot Backend

A production-ready RESTful backend for the RIDEMATE Car Rental System built with **Java + Spring Boot 3.3**.

## Features

- **Pure Java POJO Architecture**: Compatible with modern Java runtimes (Java 17, 21, and 26) with zero annotation processor issues.
- **Full JWT Authentication**: Registration, Login, Forgot Password, Reset Password, and Current User profile endpoints.
- **Embedded Persistent Database**: Ships with zero-config H2 file persistence (`./data/ridematedb`) and full PostgreSQL compatibility.
- **iText 8 PDF Voucher Engine**: High-fidelity booking confirmation voucher generation with pickup QR/code, price breakdown, vehicle specifications, and pickup instructions.
- **Direct Print & Download**:
  - `inline=true` query parameter for instant browser print preview (`window.print()`).
  - `attachment` mode for downloading the PDF directly.
- **Pre-Seeded Data**: Pre-configured administrators, operations managers, customer accounts, and luxury fleet vehicles.

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 17+ (Compatible with Java 21 & Java 26) |
| Framework | Spring Boot 3.3.4 |
| Security | Spring Security 6 + JWT (JJWT 0.12.6) + BCrypt |
| Database | H2 persistent file database (default) or PostgreSQL |
| ORM | Hibernate 6 / Spring Data JPA |
| PDF Engine | iText 8.0.4 (kernel + layout + io) |
| Build Tool | Apache Maven 3.9+ |

## Running the Java Backend

```bash
# From the java-backend/ directory:
mvn clean package -DskipTests
java -jar target/car-rental-backend-1.0.0.jar
```

The server starts at **`http://localhost:8085`**.

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Administrator** | `ganesh@ridemate.io` | `password123` |
| **Administrator (MET)** | `ganeshj.bca_iom@bkc.met.edu` | `password123` |
| **Operations** | `ops@ridemate.io` | `password123` |
| **Customer** | `sophia@example.com` | `password123` |

## Key API Endpoints

### 1. Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` - Create account (name, email, password, role, phone, driverLicenseNumber)
- `POST /api/v1/auth/login` - Authenticate and receive JWT bearer token
- `POST /api/v1/auth/forgot-password` - Request 6-digit password reset code
- `POST /api/v1/auth/reset-password` - Reset password with 6-digit code
- `GET /api/v1/auth/me` - Get current authenticated user profile (`Authorization: Bearer <token>`)

### 2. Fleet Management (`/api/v1/cars` & `/api/cars`)
- `GET /api/v1/cars` - List all vehicles (filterable by `status` and `category`)
- `GET /api/v1/cars/{id}` - Vehicle details
- `POST /api/v1/cars` - Add vehicle (Admin/Operations)
- `PUT /api/v1/cars/{id}` - Update vehicle (Admin/Operations)
- `DELETE /api/v1/cars/{id}` - Remove vehicle (Admin)
- `GET /api/v1/stats` - Fleet utilization & revenue metrics

### 3. Bookings & Voucher Printing (`/api/v1/bookings`)
- `POST /api/v1/bookings` - Create reservation & confirm payment
- `GET /api/v1/bookings` - List user reservations
- `GET /api/v1/bookings/{id}` - Reservation details
- `POST /api/v1/bookings/{id}/cancel` - Cancel reservation
- `GET /api/v1/bookings/{id}/voucher` - Download PDF booking voucher
- `GET /api/v1/bookings/{id}/voucher?inline=true` - Open PDF booking voucher in browser for direct printing
