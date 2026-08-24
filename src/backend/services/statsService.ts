import { carRepository } from '../repositories/carRepository';
import { activityLogRepository } from '../repositories/activityLogRepository';

class StatsService {
  async getDashboardStats() {
    const cars = await carRepository.getRawList();
    const total = cars.length;

    const available = cars.filter((c) => c.status === 'Available').length;
    const rented = cars.filter((c) => c.status === 'Rented').length;
    const maintenance = cars.filter((c) => c.status === 'Maintenance').length;
    const unavailable = cars.filter((c) => c.status === 'Unavailable').length;

    const totalFleetValuation = cars.reduce((sum, c) => sum + (c.price || 0), 0);
    const averageRentalRate =
      total > 0 ? Math.round(cars.reduce((sum, c) => sum + (c.rentalPricePerDay || 0), 0) / total) : 0;
    const utilizationRate = total > 0 ? Math.round((rented / total) * 100) : 0;

    const categoryBreakdown: Record<string, number> = {};
    cars.forEach((c) => {
      categoryBreakdown[c.category] = (categoryBreakdown[c.category] || 0) + 1;
    });

    const recentActivity = await activityLogRepository.getRecent(10);
    const recentlyAdded = cars.slice(0, 5);

    return {
      stats: {
        totalCars: total,
        availableCars: available,
        rentedCars: rented,
        unavailableCars: unavailable,
        maintenanceCars: maintenance,
        averageRentalRate,
        totalFleetValuation,
        utilizationRate,
      },
      categoryBreakdown,
      recentActivity,
      recentlyAdded,
    };
  }

  async getActivityLogs(limit: number = 50) {
    return activityLogRepository.getRecent(limit);
  }

  async clearActivityLogs() {
    return activityLogRepository.clear();
  }
}

export const statsService = new StatsService();
