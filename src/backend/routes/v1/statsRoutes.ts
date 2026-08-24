import { Router } from 'express';
import { statsController } from '../../controllers/statsController';

const router = Router();

router.get('/', (req, res, next) => statsController.getDashboardStats(req, res, next));
router.get('/activity-logs', (req, res, next) => statsController.getActivityLogs(req, res, next));
router.delete('/activity-logs', (req, res, next) => statsController.clearActivityLogs(req, res, next));

export default router;
