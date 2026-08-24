import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { logger } from '../config/logger';
import { HTTP_STATUS, ERROR_CODES } from '../constants';
import { ENV } from '../config/env';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    logger.warn(`Operational Error [${err.code}]: ${err.message}`, req.path, {
      method: req.method,
      statusCode: err.statusCode,
      errors: err.errors,
    });
    sendError(res, err.message, err.statusCode, err.code, err.errors);
    return;
  }

  // Handle JSON parse errors from express.json()
  if (err.name === 'SyntaxError' && 'body' in err) {
    sendError(res, 'Malformed JSON payload.', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR);
    return;
  }

  // Unhandled system exceptions
  logger.error(`Unhandled Internal Error: ${err.message}`, req.path, err);
  const message = ENV.isProduction ? 'An unexpected internal server error occurred.' : err.message;
  sendError(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODES.INTERNAL_SERVER_ERROR);
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(
    res,
    `Cannot ${req.method} ${req.originalUrl} - Route not found`,
    HTTP_STATUS.NOT_FOUND,
    ERROR_CODES.NOT_FOUND
  );
}
