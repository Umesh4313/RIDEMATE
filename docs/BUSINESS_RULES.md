# Business Rules: RIDEMATE

## Core Business Invariants & Rules

### Fleet & Vehicle Rules
- **BR-001**: Every registered vehicle must possess a unique Registration/License Plate number (case-insensitive) and a unique VIN (17 standard characters or valid chassis string). Duplicate registrations or VINs must be rejected with HTTP 409 Conflict.
- **BR-002**: Daily rental rates must be greater than $0.00. MSRP / valuation must be greater than $0.00.
- **BR-003**: Vehicle status can only transition between valid lifecycle states: `Available`, `Rented`, `Maintenance`, `Unavailable`.
- **BR-004**: When a vehicle is rented via a confirmed booking, its inventory status automatically transitions to `Rented`.
- **BR-005**: When a booking is cancelled or marked completed, the associated vehicle status returns to `Available` (unless flagged for maintenance).
- **BR-006**: Vehicles flagged under `Maintenance` or `Unavailable` cannot be reserved by retail customers in search results.
- **BR-007**: Every vehicle modification, addition, deletion, or status update creates a permanent entry in the Activity Logs audit trail.

### Booking & Reservation Rules
- **BR-008**: Every reservation must generate an irreversible, unique pickup code formatted as `RM-XXXX` (e.g. `RM-8472`).
- **BR-009**: The rental duration in days must be a positive integer $\ge 1$.
- **BR-010**: All pricing calculations are strictly computed on the backend:
  - Base subtotal = $\text{rentalPricePerDay} \times \text{days}$
  - Taxes & Fees = $\text{round}(\text{subtotal} \times 0.1125, 2)$ (11.25% standard tax)
  - Protection fee:
    - Basic Tier: $\$0/\text{day}$
    - Standard Tier: $\$15/\text{day} \times \text{days}$
    - Premium Tier: $\$28/\text{day} \times \text{days}$
  - Total Due = $\text{subtotal} + \text{taxesAndFees} + \text{protectionFee}$
- **BR-011**: Renter must provide a valid driver's license number and contact email.
- **BR-012**: Reservations can only be cancelled if the status is currently `Confirmed` or `Active`.

### Operations & Telemetry Rules
- **BR-013**: Remote vehicle commands (`lock`, `unlock`, `honk`, `immobilize`) require `operations` or `admin` role clearance.
- **BR-014**: Immobilization commands log high-severity operational audit records with the staff member's ID and timestamp.
- **BR-015**: Driver license verification action items must be marked `approved` or `rejected` by authorized staff before digital key handover dispatch.

### User & Security Rules
- **BR-016**: User email addresses must be unique and normalized to lowercase.
- **BR-017**: Passwords must contain a minimum of 6 characters (recommended 8+ with uppercase, number, symbol). Passwords must never be stored in plain text.
- **BR-018**: Only users with the `admin` role are authorized to permanently delete vehicles, execute bulk deletions, or clear activity logs.
- **BR-019**: Customers can only view and modify their own booking records.
- **BR-020**: Password reset verification codes expire after 15 minutes.
