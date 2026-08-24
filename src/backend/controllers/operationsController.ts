import { Request, Response, NextFunction } from 'express';
import { operationsService } from '../services/operationsService';
import { validateRemoteCommandInput } from '../validators/operationsValidators';
import { sendSuccess } from '../utils/response';
import { HTTP_STATUS } from '../constants';
import { AuthenticatedRequest } from '../middlewares/auth';

class OperationsController {
  async getTelemetry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.query;
      const data = await operationsService.getTelemetry(typeof status === 'string' ? status : undefined);
      sendSuccess(res, data, undefined, HTTP_STATUS.OK, { count: data.length, total: data.length });
    } catch (err) {
      next(err);
    }
  }

  async executeRemoteCommand(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      validateRemoteCommandInput(req.body);
      const staffName = req.user ? `${req.user.name} (${req.user.role})` : 'Operations Staff';
      const result = await operationsService.executeRemoteCommand(req.body.vehicleId, req.body.command, staffName);
      sendSuccess(res, result, result.message, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }

  async getActionItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.query;
      const items = await operationsService.getActionItems(typeof status === 'string' ? status : undefined);
      sendSuccess(res, items, undefined, HTTP_STATUS.OK, { count: items.length, total: items.length });
    } catch (err) {
      next(err);
    }
  }

  async updateActionItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status || !['pending', 'approved', 'rejected', 'completed'].includes(status)) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Status must be one of: pending, approved, rejected, completed.',
        });
        return;
      }
      const staffName = req.user ? `${req.user.name} (${req.user.role})` : 'Staff';
      const updated = await operationsService.updateActionItem(id, status, staffName);
      sendSuccess(res, updated, `Action item status updated to ${status}.`, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }
}

export const operationsController = new OperationsController();
