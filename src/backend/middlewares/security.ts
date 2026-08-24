import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env';
import { logger } from '../config/logger';

export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Helmet-equivalent security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (ENV.isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin || '*';
  
  if (ENV.CORS_ORIGIN === '*' || (req.headers.origin && ENV.CORS_ORIGIN.includes(req.headers.origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', ENV.CORS_ORIGIN);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const isApi = req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/cars');
    if (isApi) {
      logger.info(
        `${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`,
        'HTTP'
      );
    }
  });

  next();
}
