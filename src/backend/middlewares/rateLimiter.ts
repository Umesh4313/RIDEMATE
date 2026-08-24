import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../utils/errors';
import { ENV } from '../config/env';

interface ClientRecord {
  timestamps: number[];
}

export function createRateLimiter(options: { maxRequests: number; windowMs: number }) {
  const clients = new Map<string, ClientRecord>();

  // Periodically clean stale records
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of clients.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < options.windowMs);
      if (record.timestamps.length === 0) {
        clients.delete(ip);
      }
    }
  }, Math.max(options.windowMs, 30000));

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let record = clients.get(ip);
    if (!record) {
      record = { timestamps: [] };
      clients.set(ip, record);
    }

    // Filter to current window
    record.timestamps = record.timestamps.filter((t) => now - t < options.windowMs);

    if (record.timestamps.length >= options.maxRequests) {
      const oldest = record.timestamps[0];
      const resetInSeconds = Math.ceil((oldest + options.windowMs - now) / 1000);
      res.setHeader('Retry-After', resetInSeconds);
      throw new RateLimitError(`Too many requests. Please try again in ${resetInSeconds} seconds.`);
    }

    record.timestamps.push(now);
    next();
  };
}

export const authRateLimiter = createRateLimiter({
  maxRequests: ENV.RATE_LIMIT_MAX_AUTH,
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
});

export const apiRateLimiter = createRateLimiter({
  maxRequests: ENV.RATE_LIMIT_MAX_API,
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
});
