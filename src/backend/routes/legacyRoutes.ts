import { Router } from 'express';
import { carController } from '../controllers/carController';
import { statsController } from '../controllers/statsController';
import { healthController } from '../controllers/healthController';
import { optionalAuthenticate } from '../middlewares/auth';

const legacyRouter = Router();

// 1. /cars endpoints
legacyRouter.get('/cars', (req, res, next) => carController.getCars(req, res, next));
legacyRouter.get('/cars/:id', (req, res, next) => carController.getCarById(req, res, next));
legacyRouter.post('/cars', optionalAuthenticate, (req, res, next) => carController.createCar(req, res, next));
legacyRouter.put('/cars/:id', optionalAuthenticate, (req, res, next) => carController.updateCar(req, res, next));
legacyRouter.delete('/cars/:id', optionalAuthenticate, (req, res, next) => carController.deleteCar(req, res, next));

// 2. /api/cars endpoints
legacyRouter.get('/api/cars', (req, res, next) => carController.getCars(req, res, next));
legacyRouter.get('/api/cars/:id', (req, res, next) => carController.getCarById(req, res, next));
legacyRouter.post('/api/cars', optionalAuthenticate, (req, res, next) => carController.createCar(req, res, next));
legacyRouter.put('/api/cars/:id', optionalAuthenticate, (req, res, next) => carController.updateCar(req, res, next));
legacyRouter.delete('/api/cars/:id', optionalAuthenticate, (req, res, next) => carController.deleteCar(req, res, next));
legacyRouter.post('/api/cars/reset', (req, res, next) => carController.resetDatabase(req, res, next));

// 3. /api/stats endpoint
legacyRouter.get('/api/stats', (req, res, next) => statsController.getDashboardStats(req, res, next));

// 4. /api/health endpoint
legacyRouter.get('/api/health', (req, res) => healthController.getHealth(req, res));

export default legacyRouter;
