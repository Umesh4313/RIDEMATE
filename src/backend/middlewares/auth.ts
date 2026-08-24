import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/crypto';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { Role } from '../constants';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token required.');
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    throw new UnauthorizedError('Invalid or expired authentication token.');
  }

  req.user = payload;
  next();
}

export function optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}

export function authorizeRoles(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(`Role '${req.user.role}' is not authorized to access this resource.`);
    }

    next();
  };
}
