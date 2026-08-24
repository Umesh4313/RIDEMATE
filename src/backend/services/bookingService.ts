import { bookingRepository } from '../repositories/bookingRepository';
import { carRepository } from '../repositories/carRepository';
import { activityLogRepository } from '../repositories/activityLogRepository';
import { BookingEntity } from '../models';
import { NotFoundError, ValidationError } from '../utils/errors';
import { PRICING } from '../constants';

export interface CreateBookingDTO {
  vehicleId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  driverLicenseNumber: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  pickupTime?: string;
  dropoffDate?: string;
  dropoffTime?: string;
  days: number;
  protectionPlan?: 'basic' | 'standard' | 'premium';
  paymentMethodLast4?: string;
}

class BookingService {
  async createBooking(dto: CreateBookingDTO): Promise<BookingEntity> {
    const vehicle = await carRepository.findById(dto.vehicleId);
    if (!vehicle) {
      throw new NotFoundError(`Vehicle with ID '${dto.vehicleId}' not found.`);
    }

    if (vehicle.status !== 'Available') {
      throw new ValidationError(`Vehicle '${vehicle.name}' is currently ${vehicle.status} and cannot be reserved.`);
    }

    const days = Math.max(1, Math.round(dto.days));
    const dailyRate = vehicle.rentalPricePerDay;
    const rentalRateTotal = dailyRate * days;
    const taxesAndFees = Math.round(rentalRateTotal * PRICING.TAX_RATE * 100) / 100;
    
    const protectionPlan = dto.protectionPlan || 'standard';
    const planRate = PRICING.PROTECTION_PLANS[protectionPlan] || 0;
    const protectionFee = planRate * days;
    const totalDue = Math.round((rentalRateTotal + taxesAndFees + protectionFee) * 100) / 100;

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const pickupCode = `RM-${randomDigits}`;

    const newBooking: BookingEntity = {
      id: `bk-${pickupCode.toLowerCase()}`,
      pickupCode,
      vehicleId: vehicle.id,
      vehicle: {
        id: vehicle.id,
        name: vehicle.name,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        category: vehicle.category,
        rentalPricePerDay: vehicle.rentalPricePerDay,
        imageUrl: vehicle.imageUrl,
        images: vehicle.images,
        specs: vehicle.specs,
        location: vehicle.location,
      },
      pickupLocation: dto.pickupLocation || vehicle.location || 'San Francisco International Airport (SFO)',
      dropoffLocation: dto.dropoffLocation || dto.pickupLocation || vehicle.location || 'San Francisco International Airport (SFO)',
      pickupDate: dto.pickupDate || new Date().toISOString().split('T')[0],
      pickupTime: dto.pickupTime || '10:00 AM',
      dropoffDate: dto.dropoffDate || new Date(Date.now() + days * 86400000).toISOString().split('T')[0],
      dropoffTime: dto.dropoffTime || '2:00 PM',
      days,
      dailyRate,
      rentalRateTotal,
      taxesAndFees,
      protectionPlan,
      protectionFee,
      totalDue,
      status: 'Confirmed',
      customerName: dto.customerName.trim(),
      customerEmail: dto.customerEmail.toLowerCase().trim(),
      customerPhone: dto.customerPhone.trim(),
      driverLicenseNumber: dto.driverLicenseNumber.trim().toUpperCase(),
      paymentMethodLast4: dto.paymentMethodLast4 || '4242',
      createdAt: new Date().toISOString(),
    };

    const created = await bookingRepository.create(newBooking);

    // Update vehicle status to Rented
    await carRepository.update(vehicle.id, { status: 'Rented' });

    await activityLogRepository.addLog(
      'booking',
      'New Reservation Confirmed',
      `Booking ${pickupCode} for ${newBooking.customerName} on ${vehicle.name} ($${totalDue} total).`,
      newBooking.customerName,
      vehicle
    );

    return created;
  }

  async getBookings(filter?: { status?: string; customerEmail?: string }) {
    return bookingRepository.findAll(filter);
  }

  async getBookingById(id: string): Promise<BookingEntity> {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new NotFoundError(`Booking with ID or code '${id}' not found.`);
    }
    return booking;
  }

  async cancelBooking(id: string, customerEmail?: string): Promise<BookingEntity> {
    const booking = await this.getBookingById(id);

    if (customerEmail && booking.customerEmail.toLowerCase() !== customerEmail.toLowerCase()) {
      throw new ValidationError('You are not authorized to cancel this reservation.');
    }

    if (booking.status === 'Cancelled') {
      return booking;
    }

    const updated = await bookingRepository.updateStatus(booking.id, 'Cancelled');
    if (!updated) {
      throw new NotFoundError('Booking record not found.');
    }

    // Release car back to Available
    if (booking.vehicleId) {
      await carRepository.update(booking.vehicleId, { status: 'Available' });
    }

    await activityLogRepository.addLog(
      'status_change',
      'Reservation Cancelled',
      `Reservation ${booking.pickupCode} was cancelled. Refund processed.`,
      booking.customerName
    );

    return updated;
  }

  async updateBookingStatus(id: string, status: BookingEntity['status']): Promise<BookingEntity> {
    const booking = await this.getBookingById(id);
    const updated = await bookingRepository.updateStatus(booking.id, status);
    if (!updated) {
      throw new NotFoundError('Booking record not found.');
    }

    if (status === 'Completed' || status === 'Cancelled') {
      await carRepository.update(booking.vehicleId, { status: 'Available' });
    } else if (status === 'Active') {
      await carRepository.update(booking.vehicleId, { status: 'Rented' });
    }

    return updated;
  }
}

export const bookingService = new BookingService();
