import { CarEntity } from '../models';
import { INITIAL_CAR_RECORDS } from '../../data/adminMockData';

export interface CarFilterOptions {
  search?: string;
  brand?: string;
  category?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

class CarRepository {
  private cars: CarEntity[] = [];

  constructor() {
    this.resetToSeed();
  }

  resetToSeed(): void {
    // Clone deeply to ensure mutation isolation
    this.cars = JSON.parse(JSON.stringify(INITIAL_CAR_RECORDS));
  }

  async findAll(options: CarFilterOptions = {}): Promise<{ data: CarEntity[]; total: number; count: number; page: number; totalPages: number }> {
    let result = [...this.cars];
    const { search, brand, category, status, minPrice, maxPrice, sortBy, sortOrder = 'asc', page = 1, limit = 50 } = options;

    // Search filter
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.brand.toLowerCase().includes(q) ||
          c.model.toLowerCase().includes(q) ||
          c.registrationNumber.toLowerCase().includes(q) ||
          c.vin.toLowerCase().includes(q) ||
          c.color.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q)
      );
    }

    // Brand filter
    if (brand && brand !== 'All') {
      result = result.filter((c) => c.brand.toLowerCase() === brand.toLowerCase());
    }

    // Category filter
    if (category && category !== 'All') {
      result = result.filter((c) => c.category.toLowerCase() === category.toLowerCase());
    }

    // Status filter
    if (status && status !== 'All') {
      result = result.filter((c) => c.status.toLowerCase() === status.toLowerCase());
    }

    // Price range filters
    if (minPrice !== undefined && !isNaN(minPrice)) {
      result = result.filter((c) => c.rentalPricePerDay >= minPrice);
    }
    if (maxPrice !== undefined && !isNaN(maxPrice)) {
      result = result.filter((c) => c.rentalPricePerDay <= maxPrice);
    }

    // Sorting
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      result.sort((a: any, b: any) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name) * order;
        if (sortBy === 'brand') return a.brand.localeCompare(b.brand) * order;
        if (sortBy === 'price') return ((a.price || 0) - (b.price || 0)) * order;
        if (sortBy === 'rentalPricePerDay') return ((a.rentalPricePerDay || 0) - (b.rentalPricePerDay || 0)) * order;
        if (sortBy === 'year') return (a.year - b.year) * order;
        if (sortBy === 'mileage') return ((a.mileage || 0) - (b.mileage || 0)) * order;
        if (sortBy === 'createdAt') return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
        return 0;
      });
    }

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = result.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: paginatedData,
      total,
      count: paginatedData.length,
      page,
      totalPages,
    };
  }

  async findById(id: string): Promise<CarEntity | null> {
    const car = this.cars.find((c) => c.id === id);
    return car ? { ...car } : null;
  }

  async findByVinOrRegistration(vin: string, registrationNumber: string, excludeId?: string): Promise<CarEntity | null> {
    const duplicate = this.cars.find((c) => {
      if (excludeId && c.id === excludeId) return false;
      return (
        c.vin.toLowerCase() === vin.toLowerCase().trim() ||
        c.registrationNumber.toLowerCase() === registrationNumber.toLowerCase().trim()
      );
    });
    return duplicate ? { ...duplicate } : null;
  }

  async create(carData: CarEntity): Promise<CarEntity> {
    this.cars.unshift(carData);
    return { ...carData };
  }

  async update(id: string, updates: Partial<CarEntity>): Promise<CarEntity | null> {
    const index = this.cars.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const existing = this.cars[index];
    const updated: CarEntity = {
      ...existing,
      ...updates,
      id: existing.id, // Prevent ID overwrite
      updatedAt: new Date().toISOString(),
    };
    this.cars[index] = updated;
    return { ...updated };
  }

  async delete(id: string): Promise<CarEntity | null> {
    const index = this.cars.findIndex((c) => c.id === id);
    if (index === -1) return null;
    const [deleted] = this.cars.splice(index, 1);
    return deleted;
  }

  async batchDelete(ids: string[]): Promise<number> {
    const initialCount = this.cars.length;
    this.cars = this.cars.filter((c) => !ids.includes(c.id));
    return initialCount - this.cars.length;
  }

  async batchUpdateStatus(ids: string[], status: CarEntity['status']): Promise<number> {
    let updatedCount = 0;
    this.cars = this.cars.map((c) => {
      if (ids.includes(c.id)) {
        updatedCount++;
        return { ...c, status, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    return updatedCount;
  }

  async count(): Promise<number> {
    return this.cars.length;
  }

  async getRawList(): Promise<CarEntity[]> {
    return [...this.cars];
  }
}

export const carRepository = new CarRepository();
