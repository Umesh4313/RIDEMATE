import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import {
  validateRegisterInput,
  validateLoginInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
} from '../validators/authValidators';
import { sendSuccess } from '../utils/response';
import { HTTP_STATUS } from '../constants';
import { AuthenticatedRequest } from '../middlewares/auth';

class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      validateRegisterInput(req.body);
      const result = await authService.register(req.body);
      sendSuccess(res, result, 'User registered successfully.', HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      validateLoginInput(req.body);
      const result = await authService.login(req.body.email, req.body.password);
      sendSuccess(res, result, 'Login successful.', HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      validateForgotPasswordInput(req.body);
      const result = await authService.requestPasswordReset(req.body.email);
      sendSuccess(res, result, result.message, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      validateResetPasswordInput(req.body);
      const result = await authService.resetPassword(req.body.email, req.body.code, req.body.newPassword);
      sendSuccess(res, result, result.message, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Unauthorized' });
        return;
      }
      const profile = await authService.getProfile(req.user.userId);
      const { passwordHash, resetCode, resetCodeExpiresAt, ...safeProfile } = profile;
      sendSuccess(res, safeProfile, 'User profile retrieved.', HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
