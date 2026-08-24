import { Request, Response, NextFunction } from 'express';
import { backendCarService } from '../services/carService';
import { validateCarInput } from '../validators/carValidators';
import { sendSuccess } from '../utils/response';
import { HTTP_STATUS } from '../constants';
import { AuthenticatedRequest } from '../middlewares/auth';

class CarController {
  async getCars(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, brand, category, status, sortBy, sortOrder, minPrice, maxPrice, page, limit } = req.query;

      const result = await backendCarService.getCars({
        search: typeof search === 'string' ? search : undefined,
        brand: typeof brand === 'string' ? brand : undefined,
        category: typeof category === 'string' ? category : undefined,
        status: typeof status === 'string' ? status : undefined,
        sortBy: typeof sortBy === 'string' ? sortBy : undefined,
        sortOrder: sortOrder === 'desc' ? 'desc' : 'asc',
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 50,
      });

      sendSuccess(res, result.data, undefined, HTTP_STATUS.OK, {
        count: result.count,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      });
    } catch (err) {
      next(err);
    }
  }

  async getCarById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const car = await backendCarService.getCarById(id);
      sendSuccess(res, car, undefined, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }

  async createCar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      validateCarInput(req.body, false);
      const performedBy = req.user ? `${req.user.name} (${req.user.role})` : 'Ganesh J. (Super Admin)';
      const car = await backendCarService.createCar(req.body, performedBy);
      sendSuccess(res, car, 'Car added successfully.', HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }

  async updateCar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      validateCarInput(req.body, true);
      const performedBy = req.user ? `${req.user.name} (${req.user.role})` : 'Ganesh J. (Super Admin)';
      const car = await backendCarService.updateCar(id, req.body, performedBy);
      sendSuccess(res, car, 'Car updated successfully.', HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }

  async deleteCar(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const performedBy = req.user ? `${req.user.name} (${req.user.role})` : 'Ganesh J. (Super Admin)';
      const deleted = await backendCarService.deleteCar(id, performedBy);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Car '${deleted.name}' was successfully deleted.`,
        deletedId: id,
      });
    } catch (err) {
      next(err);
    }
  }

  async batchDelete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Array of vehicle IDs required.' });
        return;
      }
      const performedBy = req.user ? `${req.user.name} (${req.user.role})` : 'Ganesh J. (Super Admin)';
      const count = await backendCarService.batchDelete(ids, performedBy);
      sendSuccess(res, { deletedCount: count }, `Bulk deleted ${count} vehicles.`, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }

  async batchUpdateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ids, status } = req.body;
      if (!Array.isArray(ids) || !status) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'IDs array and status string required.' });
        return;
      }
      const performedBy = req.user ? `${req.user.name} (${req.user.role})` : 'Ganesh J. (Super Admin)';
      const count = await backendCarService.batchUpdateStatus(ids, status, performedBy);
      sendSuccess(res, { updatedCount: count }, `Bulk updated status of ${count} vehicles to "${status}".`, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }

  async resetDatabase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await backendCarService.resetDatabase();
      sendSuccess(res, { count }, 'Database reset to initial fleet records.', HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }
}

export const carController = new CarController();
