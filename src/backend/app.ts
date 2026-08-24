import express, { Express } from 'express';
import { securityHeaders, corsMiddleware, requestLogger } from './middlewares/security';
import { apiRateLimiter } from './middlewares/rateLimiter';
import { errorHandler, notFoundHandler } from './middlewares/error';
import v1Router from './routes/v1';
import legacyRouter from './routes/legacyRoutes';
import { healthController } from './controllers/healthController';

export function createApp(): Express {
  const app = express();

  // 1. Security & Diagnostic Middlewares
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(requestLogger);

  // 2. Body Parsers (with safe payload limits)
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // 3. Health check (no rate limit)
  app.get('/health', (req, res) => healthController.getHealth(req, res));
  app.get('/api/health', (req, res) => healthController.getHealth(req, res));

  // 4. Rate Limiting for API routes
  app.use('/api', apiRateLimiter);

  // 5. Versioned API Routes (/api/v1/*)
  app.use('/api/v1', v1Router);

  // 6. Legacy and direct routes (/cars, /api/cars, /api/stats, /api/cars/reset)
  app.use(legacyRouter);

  return app;
}

export function registerErrorHandlers(app: Express): void {
  app.use('/api/*', notFoundHandler);
  app.use(errorHandler);
}
