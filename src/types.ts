export type ScreenType = 'home' | 'search' | 'details' | 'bookings' | 'ops' | 'admin';
export type AdminTab =
  | 'dashboard'
  | 'customers-bookings'
  | 'inventory'
  | 'schedules'
  | 'analytics'
  | 'tax-settings'
  | 'policies'
  | 'vouchers'
  | 'payments'
  | 'audit-logs'
  | 'cars'
  | 'add-car'
  | 'records'
  | 'settings';

export interface CarRecord {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  registrationNumber: string;
  vin: string;
  category: 'Sedan' | 'SUV' | 'Luxury' | 'Electric' | 'Coupe' | 'Sports' | 'Convertible' | 'Truck';
  fuelType: 'Gas' | 'Hybrid' | 'Electric' | 'Diesel';
  transmission: 'Automatic' | 'Manual';
  seatingCapacity: number;
  color: string;
  mileage: number; // in miles
  price: number; // MSRP / Vehicle value in USD
  rentalPricePerDay: number; // Rental rate in USD/day
  discount: number; // Percentage discount 0-100
  status: 'Available' | 'Rented' | 'Maintenance' | 'Unavailable';
  images: string[];
  imageUrl: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  location: string;
  luggageBags?: number;
  mpgOrRange?: string;
  rating?: number;
  reviewsCount?: number;
  specs?: {
    engine?: string;
    acceleration?: string;
    topSpeed?: string;
    drivetrain?: string;
    climate?: string;
  };
}

export interface AdminActivityLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'status_change' | 'maintenance';
  title: string;
  details: string;
  carId?: string;
  carName?: string;
  user: string;
  timestamp: string;
}

export interface AdminStats {
  totalCars: number;
  availableCars: number;
  rentedCars: number;
  unavailableCars: number;
  maintenanceCars: number;
  averageRentalRate: number;
  totalFleetValuation: number;
  utilizationRate: number;
}

export interface Vehicle {
  id: string;
  name: string;
  year: number;
  make: string;
  model: string;
  category: string; // e.g. "Luxury SUV", "Executive Sedan", "Compact EV", "Family SUV"
  type: 'Sedan' | 'SUV' | 'Luxury' | 'Electric';
  pricePerDay: number;
  transmission: 'Automatic' | 'Manual';
  seats: number;
  luggageBags: number;
  fuelType: 'Gas' | 'Hybrid' | 'Electric';
  mpgOrRange: string; // e.g. "24 MPG", "32 MPG", "250mi Range", "300mi Range"
  available: boolean;
  featured?: boolean;
  tag?: string; // e.g. "Available", "EV", "Premium Selection"
  imageUrl: string;
  galleryImages: {
    hero: string;
    interior: string;
    wheel: string;
    trunk: string;
  };
  rating: number;
  reviewsCount: number;
  description: string;
  specs: {
    engine?: string;
    acceleration?: string;
    topSpeed?: string;
    drivetrain?: string;
    climate?: string;
  };
  location: string;
}

export interface SearchState {
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
}

export interface FilterState {
  vehicleTypes: string[];
  maxPrice: number;
  capacities: number[];
  transmissions: string[];
}

export interface Booking {
  id: string;
  pickupCode: string;
  vehicleId: string;
  vehicle: Vehicle;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  days: number;
  dailyRate: number;
  rentalRateTotal: number;
  taxesAndFees: number;
  protectionPlan: 'basic' | 'standard' | 'premium';
  protectionFee: number;
  totalDue: number;
  couponCode?: string;
  discountAmount?: number;
  discountPercent?: number;
  taxableAmount?: number;
  gstRate?: number;
  gstAmount?: number;
  status: 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  driverLicenseNumber: string;
  paymentMethodLast4: string;
  createdAt: string;
}

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  title: string | null;
  description: string | null;
  discountPercent: number;
  discountAmount: number;
  baseRentalPrice?: number;
  taxableAmount?: number;
  gstRate?: number;
  gstAmount?: number;
  finalPayableAmount?: number;
  originalTotal: number;
  discountedTotal: number;
  message: string;
  applicableUserType: string | null;
  qualifyingBookingCount?: number;
  isExistingCustomer?: boolean;
}

export interface AvailableCoupon {
  code: string;
  title: string;
  description: string;
  discountPercent: number;
  applicableUserType: string;
  minRentalDays: number;
  recommended: boolean;
}

export interface CustomerLoyaltyInfo {
  customerEmail: string;
  customerName: string;
  loyaltyTier: string;
  loyaltyPoints: number;
  totalBookings: number;
  totalSpent: number;
  qualifiedDiscountPercent: number;
  tierBadgeColor: string;
}

export interface ActionItem {
  id: string;
  type: 'id_verification' | 'handover' | 'license_update' | 'maintenance';
  title: string;
  userOrVehicle: string;
  timeOrLocation: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

export interface FleetVehicle {
  id: string;
  code: string;
  name: string;
  plate: string;
  category: string;
  status: 'Rented' | 'Available' | 'Maintenance';
  fuelBattery: number; // percentage 0-100
  mileage: number;
  location: string;
  currentCustomer?: string;
  nextService: string;
}

// ---------------- Admin Upgrade Types ----------------

export interface TaxCategoryItem {
  code: string;
  name: string;
  rate: number;
  enabled: boolean;
  description?: string;
}

export interface TaxAuditEntry {
  timestamp: string;
  changedBy: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  reason?: string;
}

export interface TaxSettingsData {
  id?: string;
  gstRate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cessRate: number;
  taxCategories: TaxCategoryItem[];
  updatedBy: string;
  updatedAt?: string;
  effectiveFrom?: string;
  auditTrail?: TaxAuditEntry[];
}

export interface CancellationTierItem {
  tierName: string;
  minHoursBeforePickup: number;
  maxHoursBeforePickup: number;
  feePercentage: number;
  description?: string;
}

export interface PolicySettingsData {
  id?: string;
  cancellationTiers: CancellationTierItem[];
  lateReturnHourlyFee: number;
  extraDaySurcharge: number;
  securityHoldAmount: number;
  taxApplicableOnSurcharges: boolean;
  updatedBy: string;
  updatedAt?: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  actor: string;
  targetType: string;
  targetId?: string;
  description: string;
  details?: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface CustomerProfileItem {
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  customerId?: string;
  membershipTier: string;
  loyaltyPoints: number;
  totalBookings: number;
  completedRentals: number;
  upcomingRentals: number;
  cancelledBookings: number;
  totalSpent: number;
  totalDiscountsReceived: number;
  refundsReceived: number;
  outstandingBalance: number;
}

export interface MonthlyAnalyticsStat {
  monthIndex: number;
  monthName: string;
  bookingsCount: number;
  grossRentalAmount: number;
  discountsGranted: number;
  rentalRevenueAfterDiscounts: number;
  gstCollected: number;
  refunds: number;
  netProfit: number;
}

export interface AdminAnalyticsData {
  year: number;
  month?: number;
  monthName?: string;
  hasBookingsForPeriod: boolean;
  totalBookings: number;
  completedRentals: number;
  cancelledBookings: number;
  grossRentalAmount: number;
  discountsGranted: number;
  rentalRevenueAfterDiscounts: number;
  gstCollected: number;
  additionalChargeRevenue: number;
  refundsIssued: number;
  operatingExpenses: number;
  netProfit: number;
  isEstimatedProfit: boolean;
  reportingTimezone: string;
  revenueRecognitionRule: string;
  monthlyStats: MonthlyAnalyticsStat[];
}

export interface VoucherAdminItem {
  voucherReference: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  carModel: string;
  category?: string;
  startDate: string;
  endDate: string;
  pickupLocation?: string;
  returnLocation?: string;
  baseRentalAmount: number;
  discountPercentage: number;
  discountAmount: number;
  couponCode?: string;
  taxableRentalAmount: number;
  gstRate: number;
  gstAmount: number;
  additionalCharges: number;
  totalPayableAmount: number;
  voucherStatus: string;
  issueDate: string;
}

export interface PaymentAdminItem {
  transactionReference: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  amountCharged: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionDate: string;
  refundAmount: number;
  refundStatus?: string;
  currency: string;
  gstAmount: number;
}

