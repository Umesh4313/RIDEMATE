# Input Validation Specifications: RIDEMATE

## Validation Rules by Domain

### 1. Vehicle Registration & Modification
- `name`: String, required, 2-100 characters.
- `brand`: String, required, one of known brands or valid string.
- `model`: String, required, 1-80 characters.
- `year`: Integer, required, between 1990 and current year + 1.
- `registrationNumber`: String, required, 3-20 characters, alphanumeric with optional hyphens/spaces.
- `vin`: String, required, 8-17 characters, alphanumeric.
- `category`: Enum (`Sedan`, `SUV`, `Luxury`, `Electric`, `Coupe`, `Sports`, `Convertible`, `Truck`).
- `fuelType`: Enum (`Gas`, `Hybrid`, `Electric`, `Diesel`).
- `transmission`: Enum (`Automatic`, `Manual`).
- `seatingCapacity`: Integer, 1 to 12.
- `price`: Number, $\gt 0$ (MSRP/Valuation in USD).
- `rentalPricePerDay`: Number, $\gt 0$ (Daily rate in USD).
- `discount`: Number, between 0 and 100.
- `mileage`: Number, $\ge 0$.
- `status`: Enum (`Available`, `Rented`, `Maintenance`, `Unavailable`).
- `images`: Array of valid image URLs, minimum 1 item.

### 2. User Authentication
- `name`: String, 2-100 characters.
- `email`: String, valid email format regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
- `password`: String, minimum 6 characters.
- `phone`: String, minimum 7 characters.

### 3. Booking Creation
- `vehicleId`: String, required, must exist in fleet.
- `pickupDate`: Valid date string (YYYY-MM-DD), cannot be in the past.
- `dropoffDate`: Valid date string, must be on or after pickupDate.
- `days`: Integer, $\ge 1$.
- `protectionPlan`: Enum (`basic`, `standard`, `premium`).
- `customerName`: String, required.
- `customerEmail`: Valid email format.
- `customerPhone`: Required phone number.
- `driverLicenseNumber`: String, required.
- `paymentMethodLast4`: String, 4 digits.
