import { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/bookingService';
import { validateBookingInput } from '../validators/bookingValidators';
import { sendSuccess } from '../utils/response';
import { HTTP_STATUS } from '../constants';
import { AuthenticatedRequest } from '../middlewares/auth';

class BookingController {
  async createBooking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      validateBookingInput(req.body);
      const booking = await bookingService.createBooking({
        ...req.body,
        customerEmail: req.body.customerEmail || req.user?.email,
        customerName: req.body.customerName || req.user?.name,
      });
      sendSuccess(res, booking, 'Reservation confirmed successfully.', HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }

  async getBookings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, customerEmail } = req.query;
      const filterEmail = req.user && req.user.role === 'customer' ? req.user.email : (customerEmail as string);
      const list = await bookingService.getBookings({
        status: typeof status === 'string' ? status : undefined,
        customerEmail: filterEmail,
      });
      sendSuccess(res, list, undefined, HTTP_STATUS.OK, { count: list.length, total: list.length });
    } catch (err) {
      next(err);
    }
  }

  async getBookingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const booking = await bookingService.getBookingById(id);
      sendSuccess(res, booking, undefined, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }

  async cancelBooking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const customerEmail = req.user && req.user.role === 'customer' ? req.user.email : undefined;
      const booking = await bookingService.cancelBooking(id, customerEmail);
      sendSuccess(res, booking, 'Reservation cancelled successfully.', HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }

  async updateBookingStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Status is required.' });
        return;
      }
      const booking = await bookingService.updateBookingStatus(id, status);
      sendSuccess(res, booking, `Booking status updated to ${status}.`, HTTP_STATUS.OK);
    } catch (err) {
      next(err);
    }
  }
}

export const bookingController = new BookingController();
