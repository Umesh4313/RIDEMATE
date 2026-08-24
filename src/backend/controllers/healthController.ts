import { Request, Response } from 'express';
import { carRepository } from '../repositories/carRepository';
import { getDatabaseStatus } from '../config/database';
import { ENV } from '../config/env';
import { HTTP_STATUS } from '../constants';

class HealthController {
  async getHealth(req: Request, res: Response): Promise<void> {
    const totalCars = await carRepository.count();
    const dbStatus = getDatabaseStatus();

    res.status(HTTP_STATUS.OK).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: ENV.NODE_ENV,
      totalCars,
      database: dbStatus,
      memory: process.memoryUsage(),
    });
  }
}

export const healthController = new HealthController();
