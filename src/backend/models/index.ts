export interface UserEntity {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'operations' | 'customer';
  phone?: string;
  driverLicenseNumber?: string;
  resetCode?: string;
  resetCodeExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CarEntity {
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
  mileage: number;
  price: number;
  rentalPricePerDay: number;
  discount: number;
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

export interface BookingEntity {
  id: string;
  pickupCode: string;
  vehicleId: string;
  vehicle?: Partial<CarEntity>;
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
  status: 'Confirmed' | 'Active' | 'Completed' | 'Cancelled';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  driverLicenseNumber: string;
  paymentMethodLast4: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ActionItemEntity {
  id: string;
  type: 'id_verification' | 'handover' | 'license_update' | 'maintenance';
  title: string;
  userOrVehicle: string;
  timeOrLocation: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
}

export interface FleetTelemetryEntity {
  id: string;
  code: string;
  name: string;
  plate: string;
  category: string;
  status: 'Rented' | 'Available' | 'Maintenance';
  fuelBattery: number;
  mileage: number;
  location: string;
  currentCustomer?: string;
  nextService: string;
}

export interface ActivityLogEntity {
  id: string;
  action: 'create' | 'update' | 'delete' | 'status_change' | 'maintenance' | 'booking';
  title: string;
  details: string;
  carId?: string;
  carName?: string;
  user: string;
  timestamp: string;
}
