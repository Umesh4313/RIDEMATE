import { BookingEntity } from '../models';
import { INITIAL_BOOKINGS } from '../../data/mockData';

class BookingRepository {
  private bookings: BookingEntity[] = [];

  constructor() {
    this.resetToSeed();
  }

  resetToSeed(): void {
    this.bookings = JSON.parse(JSON.stringify(INITIAL_BOOKINGS));
  }

  async findAll(filter?: { status?: string; customerEmail?: string; vehicleId?: string }): Promise<BookingEntity[]> {
    let list = [...this.bookings];
    if (filter?.status && filter.status !== 'all') {
      list = list.filter((b) => b.status.toLowerCase() === filter.status!.toLowerCase());
    }
    if (filter?.customerEmail) {
      list = list.filter((b) => b.customerEmail.toLowerCase() === filter.customerEmail!.toLowerCase());
    }
    if (filter?.vehicleId) {
      list = list.filter((b) => b.vehicleId === filter.vehicleId);
    }
    return list;
  }

  async findById(id: string): Promise<BookingEntity | null> {
    const booking = this.bookings.find((b) => b.id === id || b.pickupCode.toLowerCase() === id.toLowerCase());
    return booking ? { ...booking } : null;
  }

  async create(booking: BookingEntity): Promise<BookingEntity> {
    this.bookings.unshift(booking);
    return { ...booking };
  }

  async update(id: string, updates: Partial<BookingEntity>): Promise<BookingEntity | null> {
    const index = this.bookings.findIndex((b) => b.id === id || b.pickupCode === id);
    if (index === -1) return null;
    const updated: BookingEntity = {
      ...this.bookings[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.bookings[index] = updated;
    return { ...updated };
  }

  async updateStatus(id: string, status: BookingEntity['status']): Promise<BookingEntity | null> {
    return this.update(id, { status });
  }

  async count(): Promise<number> {
    return this.bookings.length;
  }
}

export const bookingRepository = new BookingRepository();
