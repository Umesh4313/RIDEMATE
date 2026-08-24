import { Request, Response, NextFunction } from 'express';
import { statsService } from '../services/statsService';
import { sendSuccess } from '../utils/response';
import { HTTP_STATUS } from '../constants';

class StatsController {
  async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await statsService.getDashboardStats();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        ...data,
      });
    } catch (err) {
      next(err);
    }
  }

  async getActivityLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const logs = await statsService.getActivityLogs(limit);
      sendSuccess(res, logs, undefined, HTTP_STATUS.OK, { count: logs.length, total: logs.length });
    } catch (err) {
      next(err);
    }
  }

  async clearActivityLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await statsService.clearActivityLogs();
      sendSuccess(res, [], 'Activity logs cleared.', HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }
}

export const statsController = new StatsController();
