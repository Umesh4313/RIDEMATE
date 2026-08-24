import { carRepository, CarFilterOptions } from '../repositories/carRepository';
import { activityLogRepository } from '../repositories/activityLogRepository';
import { CarEntity } from '../models';
import { NotFoundError, ConflictError } from '../utils/errors';

class BackendCarService {
  async getCars(options: CarFilterOptions) {
    return carRepository.findAll(options);
  }

  async getCarById(id: string): Promise<CarEntity> {
    const car = await carRepository.findById(id);
    if (!car) {
      throw new NotFoundError(`Car with ID '${id}' not found.`);
    }
    return car;
  }

  async createCar(data: Partial<CarEntity>, performedBy: string = 'Super Admin'): Promise<CarEntity> {
    const reg = (data.registrationNumber || `CA-${Math.floor(1000 + Math.random() * 9000)}`).trim().toUpperCase();
    const vin = (data.vin || `VIN${Date.now()}`).trim().toUpperCase();

    // Check duplicate registration or VIN
    const duplicate = await carRepository.findByVinOrRegistration(vin, reg);
    if (duplicate) {
      throw new ConflictError(`Car with registration '${reg}' or VIN '${vin}' already exists.`);
    }

    const defaultImage =
      data.imageUrl ||
      (data.images && data.images.length > 0
        ? data.images[0]
        : 'https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?q=80&w=1200&auto=format&fit=crop');

    const newCar: CarEntity = {
      id: `car-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: (data.name || `${data.brand || 'Premium'} ${data.model || 'Vehicle'}`).trim(),
      brand: data.brand?.trim() || 'Other',
      model: data.model?.trim() || '',
      year: Number(data.year) || new Date().getFullYear(),
      registrationNumber: reg,
      vin: vin,
      category: data.category || 'Sedan',
      fuelType: data.fuelType || 'Gas',
      transmission: data.transmission || 'Automatic',
      seatingCapacity: Number(data.seatingCapacity) || 5,
      color: data.color?.trim() || 'Obsidian Black',
      mileage: Number(data.mileage) || 0,
      price: Number(data.price) || 50000,
      rentalPricePerDay: Number(data.rentalPricePerDay) || 100,
      discount: Number(data.discount) || 0,
      status: data.status || 'Available',
      images: data.images && data.images.length > 0 ? data.images : [defaultImage],
      imageUrl: defaultImage,
      description: data.description?.trim() || `Premium ${data.brand || ''} ${data.model || ''} vehicle.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      location: data.location?.trim() || 'San Francisco International Airport (SFO)',
      luggageBags: Number(data.luggageBags) || 3,
      mpgOrRange: data.mpgOrRange || (data.fuelType === 'Electric' ? '280mi Range' : '25 MPG'),
      rating: 5.0,
      reviewsCount: 0,
      specs: data.specs || {
        engine: `${data.fuelType || 'Gas'} Engine`,
        acceleration: '0-60 mph in 5.8s',
        topSpeed: '135 mph',
        drivetrain: 'All-Wheel Drive',
        climate: 'Automatic Climate Control',
      },
    };

    const created = await carRepository.create(newCar);

    await activityLogRepository.addLog(
      'create',
      'New Vehicle Added',
      `Added ${newCar.name} (${newCar.registrationNumber}) to fleet records.`,
      performedBy,
      newCar
    );

    return created;
  }

  async updateCar(id: string, updates: Partial<CarEntity>, performedBy: string = 'Super Admin'): Promise<CarEntity> {
    const existing = await carRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Car with ID '${id}' not found.`);
    }

    if (updates.vin || updates.registrationNumber) {
      const vinToCheck = (updates.vin || existing.vin).trim().toUpperCase();
      const regToCheck = (updates.registrationNumber || existing.registrationNumber).trim().toUpperCase();
      const duplicate = await carRepository.findByVinOrRegistration(vinToCheck, regToCheck, id);
      if (duplicate) {
        throw new ConflictError(`Car with registration '${regToCheck}' or VIN '${vinToCheck}' already exists.`);
      }
    }

    const updatedImages = updates.images && updates.images.length > 0 ? updates.images : existing.images;
    const updatedImageUrl = updates.imageUrl || updatedImages[0] || existing.imageUrl;

    const updated = await carRepository.update(id, {
      ...updates,
      images: updatedImages,
      imageUrl: updatedImageUrl,
    });

    if (!updated) {
      throw new NotFoundError(`Car with ID '${id}' not found.`);
    }

    const actionType = updates.status && updates.status !== existing.status ? 'status_change' : 'update';
    await activityLogRepository.addLog(
      actionType,
      'Vehicle Record Updated',
      `Updated ${updated.name} (Status: ${updated.status}, Rate: $${updated.rentalPricePerDay}/day).`,
      performedBy,
      updated
    );

    return updated;
  }

  async deleteCar(id: string, performedBy: string = 'Super Admin'): Promise<CarEntity> {
    const deleted = await carRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Car with ID '${id}' not found.`);
    }

    await activityLogRepository.addLog(
      'delete',
      'Vehicle Deleted',
      `Permanently removed ${deleted.name} (${deleted.registrationNumber}) from fleet records.`,
      performedBy,
      deleted
    );

    return deleted;
  }

  async batchDelete(ids: string[], performedBy: string = 'Super Admin'): Promise<number> {
    const deletedCount = await carRepository.batchDelete(ids);

    await activityLogRepository.addLog(
      'delete',
      'Batch Vehicle Deletion',
      `Bulk deleted ${deletedCount} vehicles from database.`,
      performedBy
    );

    return deletedCount;
  }

  async batchUpdateStatus(ids: string[], status: CarEntity['status'], performedBy: string = 'Super Admin'): Promise<number> {
    const updatedCount = await carRepository.batchUpdateStatus(ids, status);

    await activityLogRepository.addLog(
      'status_change',
      'Batch Status Update',
      `Bulk updated status of ${updatedCount} vehicles to "${status}".`,
      performedBy
    );

    return updatedCount;
  }

  async resetDatabase(): Promise<number> {
    carRepository.resetToSeed();
    activityLogRepository.resetToSeed();
    return carRepository.count();
  }
}

export const backendCarService = new BackendCarService();
