import path from 'express';
import pathModule from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createApp, registerErrorHandlers } from './src/backend/app';
import { connectDatabase } from './src/backend/config/database';
import { ENV } from './src/backend/config/env';
import { logger } from './src/backend/config/logger';

async function bootstrap() {
  try {
    // 1. Initialize data layer
    await connectDatabase();

    // 2. Build modular Express application
    const app = createApp();

    // 3. Vite development middleware or production static asset server
    if (ENV.isDevelopment) {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      logger.info('Vite HMR Development Middleware mounted', 'Bootstrap');
    } else {
      const distPath = pathModule.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/cars')) {
          return next();
        }
        res.sendFile(pathModule.join(distPath, 'index.html'));
      });
      logger.info(`Static assets served from ${distPath}`, 'Bootstrap');
    }

    // 4. Register error and 404 interceptors
    registerErrorHandlers(app);

    // 5. Start listening
    const PORT = ENV.PORT;
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`RIDEMATE Production-Ready Server running on http://0.0.0.0:${PORT} [${ENV.NODE_ENV}]`, 'Server');
      logger.info(`- API v1 Endpoint: http://localhost:${PORT}/api/v1`, 'Server');
      logger.info(`- Health Check: http://localhost:${PORT}/api/health`, 'Server');
    });

    // Graceful shutdown handling
    const shutdown = () => {
      logger.info('Graceful shutdown initiated...', 'Server');
      server.close(() => {
        logger.info('HTTP server closed. Exiting process.', 'Server');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to bootstrap server', 'Bootstrap', error);
    process.exit(1);
  }
}

bootstrap();
