import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/aiService';
import { sendSuccess } from '../utils/response';
import { HTTP_STATUS } from '../constants';
import { ValidationError } from '../utils/errors';

class AIController {
  async generateCarDescription(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { brand, model, year, category, fuelType, specs } = req.body;
      if (!brand || !model) {
        throw new ValidationError('Brand and Model are required for AI description generation.');
      }
      const description = await aiService.generateCarDescription({
        brand,
        model,
        year,
        category,
        fuelType,
        specs,
      });
      sendSuccess(res, { description }, 'Vehicle description generated.', HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }
}

export const aiController = new AIController();
