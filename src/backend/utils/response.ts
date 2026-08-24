import { Response } from 'express';
import { HTTP_STATUS } from '../constants';
import { FieldError } from './errors';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  total?: number;
  page?: number;
  totalPages?: number;
  errors?: FieldError[];
  code?: string;
  timestamp?: string;
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = HTTP_STATUS.OK,
  meta?: { count?: number; total?: number; page?: number; totalPages?: number }
): void {
  const payload: ApiResponse<T> = {
    success: true,
    ...(message ? { message } : {}),
    ...(data !== undefined ? { data } : {}),
    ...(meta || {}),
  };
  res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  code?: string,
  errors?: FieldError[]
): void {
  const payload: ApiResponse = {
    success: false,
    message,
    ...(code ? { code } : {}),
    ...(errors && errors.length > 0 ? { errors } : {}),
    timestamp: new Date().toISOString(),
  };
  res.status(statusCode).json(payload);
}
