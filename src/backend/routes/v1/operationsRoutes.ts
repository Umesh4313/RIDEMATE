import { Router } from 'express';
import { operationsController } from '../../controllers/operationsController';
import { optionalAuthenticate } from '../../middlewares/auth';

const router = Router();

router.get('/telemetry', (req, res, next) => operationsController.getTelemetry(req, res, next));
router.post('/remote-command', optionalAuthenticate, (req, res, next) => operationsController.executeRemoteCommand(req, res, next));
router.get('/action-items', (req, res, next) => operationsController.getActionItems(req, res, next));
router.put('/action-items/:id', optionalAuthenticate, (req, res, next) => operationsController.updateActionItem(req, res, next));

export default router;
