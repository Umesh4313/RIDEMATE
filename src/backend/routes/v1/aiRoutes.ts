import { Router } from 'express';
import { aiController } from '../../controllers/aiController';

const router = Router();

router.post('/generate-description', (req, res, next) => aiController.generateCarDescription(req, res, next));

export default router;
