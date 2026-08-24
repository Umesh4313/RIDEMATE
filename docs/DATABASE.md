# Database Design & Schemas: RIDEMATE

## Database Entities & Schemas

### 1. `users` Entity
| Field | Type | Modifiers / Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key, UUID / Prefixed ID (`usr-...`) | Unique User ID |
| `name` | String | Required, Min 2, Max 100 | Full Customer / Staff Name |
| `email` | String | Required, Unique, Lowercase, Indexed | Contact & Login Email |
| `passwordHash`| String | Required, 60+ chars | Bcrypt / HMAC password hash |
| `phone` | String | Optional, Standard format | Mobile phone number |
| `role` | String | Enum: `customer`, `operations`, `admin` | Authorization role |
| `driverLicenseNumber` | String | Optional | Driver license identifier |
| `resetCode` | String | Optional, Nullable | 6-digit password reset code |
| `resetCodeExpiresAt` | Date | Optional, Nullable | Timestamp when reset code expires |
| `createdAt` | Date / ISO String | Required | Timestamp created |
| `updatedAt` | Date / ISO String | Required | Timestamp modified |

### 2. `cars` Entity
| Field | Type | Modifiers / Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key, Unique (`car-...`) | Unique Vehicle ID |
| `name` | String | Required, Trimmed | Customer-facing display name |
| `brand` | String | Required, Indexed | Make / Manufacturer |
| `model` | String | Required | Model line |
| `year` | Number | Required, Min 1990, Max current+1 | Model release year |
| `registrationNumber` | String | Required, Unique, Uppercase, Indexed | License plate |
| `vin` | String | Required, Unique, Uppercase, Indexed | Vehicle Identification Number |
| `category` | String | Enum: Sedan, SUV, Luxury, Electric, Coupe, Sports, Convertible, Truck | Category classification |
| `fuelType` | String | Enum: Gas, Hybrid, Electric, Diesel | Powertrain fuel |
| `transmission`| String | Enum: Automatic, Manual | Gearbox transmission |
| `seatingCapacity` | Number | Required, Min 1, Max 12 | Passenger seat count |
| `color` | String | Required | Exterior body paint color |
| `mileage` | Number | Required, Min 0 | Odometer mileage |
| `price` | Number | Required, Min 0 | MSRP / Total vehicle valuation in USD |
| `rentalPricePerDay` | Number | Required, Min 1 | Daily rental rate in USD |
| `discount` | Number | Default 0, Range 0-100 | Percentage discount |
| `status` | String | Enum: Available, Rented, Maintenance, Unavailable | Current fleet status |
| `images` | String[] | Required, Min length 1 | Array of image URLs |
| `imageUrl` | String | Required | Hero thumbnail URL |
| `description`| String | Required | Marketing & technical summary |
| `location` | String | Required | Station / Hub / Airport location |
| `luggageBags`| Number | Default 2 | Cargo capacity count |
| `mpgOrRange`| String | Optional | Fuel economy / EV range |
| `rating` | Number | Default 5.0, Range 0-5 | Average user rating |
| `reviewsCount`| Number | Default 0 | Total number of reviews |
| `specs` | Object | Optional | Engine, acceleration, top speed, drivetrain, climate |
| `createdAt` | Date / ISO String | Required | Record creation timestamp |
| `updatedAt` | Date / ISO String | Required | Record last updated timestamp |

### 3. `bookings` Entity
| Field | Type | Modifiers / Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key (`bk-...`) | Booking unique identifier |
| `pickupCode` | String | Required, Unique, Indexed (`RM-XXXX`) | Check-in kiosk code |
| `vehicleId` | String | Foreign Key → `cars.id`, Indexed | Associated vehicle ID |
| `customerName` | String | Required | Primary renter name |
| `customerEmail` | String | Required, Indexed | Primary renter email |
| `customerPhone` | String | Required | Emergency contact phone |
| `driverLicenseNumber` | String | Required | Verified license number |
| `pickupLocation` | String | Required | Pick-up branch location |
| `dropoffLocation` | String | Required | Return branch location |
| `pickupDate` | String | Required (YYYY-MM-DD) | Pick-up reservation date |
| `pickupTime` | String | Required | Pick-up scheduled time |
| `dropoffDate` | String | Required (YYYY-MM-DD) | Drop-off return date |
| `dropoffTime` | String | Required | Drop-off scheduled time |
| `days` | Number | Required, Min 1 | Total rental duration in days |
| `dailyRate` | Number | Required | Vehicle base daily rate |
| `rentalRateTotal` | Number | Required | `days * dailyRate` |
| `taxesAndFees` | Number | Required | 11.25% municipal tax & fees |
| `protectionPlan` | String | Enum: `basic` ($0), `standard` ($15/d), `premium` ($28/d) | Selected insurance protection tier |
| `protectionFee` | Number | Required | `protectionPlanRate * days` |
| `totalDue` | Number | Required | `rentalRateTotal + taxesAndFees + protectionFee` |
| `status` | String | Enum: `Confirmed`, `Active`, `Completed`, `Cancelled` | Booking lifecycle status |
| `paymentMethodLast4`| String | Required | Card transaction reference (last 4 digits) |
| `createdAt` | Date / ISO String | Required | Reservation created timestamp |

### 4. `action_items` Entity (Operations Queue)
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | String | Primary Key (`act-item-...`) | Item identifier |
| `type` | String | Enum: `id_verification`, `handover`, `license_update`, `maintenance` | Operational item type |
| `title` | String | Required | Summary title |
| `userOrVehicle` | String | Required | Associated customer name or vehicle code |
| `timeOrLocation`| String | Required | Timestamp or dispatch location |
| `priority` | String | Enum: `High`, `Medium`, `Low` | Urgency level |
| `status` | String | Enum: `pending`, `approved`, `rejected`, `completed` | Operational status |

### 5. `activity_logs` Entity (Audit Trail)
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | String | Primary Key (`act-...`) | Unique log ID |
| `action` | String | Enum: `create`, `update`, `delete`, `status_change`, `maintenance`, `booking` | Action category |
| `title` | String | Required | Human readable summary |
| `details` | String | Required | Audit description |
| `carId` | String | Optional, Foreign Key → `cars.id` | Associated vehicle |
| `carName` | String | Optional | Vehicle display name snapshot |
| `user` | String | Required | Operating user identity / role |
| `timestamp` | Date / ISO String | Required | Log generation timestamp |

## Indexing Strategy
1. **Car Lookup**: Indexes on `brand`, `category`, `status`, `registrationNumber` (Unique), and `vin` (Unique).
2. **Booking Lookup**: Index on `pickupCode` (Unique), `vehicleId`, and `customerEmail`.
3. **User Lookup**: Unique index on `email`.
