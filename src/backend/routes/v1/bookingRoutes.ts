import { Router } from 'express';
import { bookingController } from '../../controllers/bookingController';
import { optionalAuthenticate, authenticate } from '../../middlewares/auth';

const router = Router();

router.post('/', optionalAuthenticate, (req, res, next) => bookingController.createBooking(req, res, next));
router.get('/', optionalAuthenticate, (req, res, next) => bookingController.getBookings(req, res, next));
router.get('/:id', (req, res, next) => bookingController.getBookingById(req, res, next));
router.post('/:id/cancel', optionalAuthenticate, (req, res, next) => bookingController.cancelBooking(req, res, next));
router.put('/:id/status', optionalAuthenticate, (req, res, next) => bookingController.updateBookingStatus(req, res, next));

export default router;
