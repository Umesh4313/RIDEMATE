# Deployment Guide: RIDEMATE

## Environment Variables
The application requires the following environment variables (defined in `.env` and documented in `.env.example`):

```env
# Server Port
PORT=3000

# Environment Mode
NODE_ENV=development

# Authentication & JWT
JWT_SECRET=ridemate-super-secret-jwt-key-production-change-me
JWT_EXPIRES_IN=24h

# Gemini AI Integration
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Allowed CORS Origins (comma separated or * for dev)
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_MAX_AUTH=10
RATE_LIMIT_MAX_API=120
RATE_LIMIT_WINDOW_MS=60000

# Storage & Persistence Path
DATA_STORAGE_DIR=./data
```

## Running Locally

### Development Mode (with Live Reload + Vite HMR)
```bash
npm run dev
```

### Production Build & Launch
```bash
# 1. Build frontend bundle and server bundle
npm run build

# 2. Run compiled production server
npm run start
```

## Health Checks
- Production health check endpoint: `GET /api/health`
- Response:
  ```json
  {
    "status": "ok",
    "uptime": 234.1,
    "timestamp": "2026-08-24T13:30:00Z",
    "totalCars": 12,
    "environment": "production"
  }
  ```
