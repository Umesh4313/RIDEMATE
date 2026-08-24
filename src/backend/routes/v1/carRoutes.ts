import { Router } from 'express';
import { carController } from '../../controllers/carController';
import { optionalAuthenticate, authenticate, authorizeRoles } from '../../middlewares/auth';
import { ROLES } from '../../constants';

const router = Router();

// Public vehicle queries
router.get('/', (req, res, next) => carController.getCars(req, res, next));
router.get('/:id', (req, res, next) => carController.getCarById(req, res, next));

// Vehicle mutations (Admin / Operations / Demo optional)
router.post('/', optionalAuthenticate, (req, res, next) => carController.createCar(req, res, next));
router.put('/:id', optionalAuthenticate, (req, res, next) => carController.updateCar(req, res, next));
router.delete('/:id', optionalAuthenticate, (req, res, next) => carController.deleteCar(req, res, next));

// Batch operations
router.post('/batch-delete', optionalAuthenticate, (req, res, next) => carController.batchDelete(req, res, next));
router.post('/batch-status', optionalAuthenticate, (req, res, next) => carController.batchUpdateStatus(req, res, next));

// Seed reset endpoint
router.post('/reset', (req, res, next) => carController.resetDatabase(req, res, next));

export default router;
