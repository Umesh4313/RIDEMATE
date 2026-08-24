import { FieldError, ValidationError } from '../utils/errors';

export function validateBookingInput(body: any): void {
  const errors: FieldError[] = [];

  if (!body.vehicleId || typeof body.vehicleId !== 'string') {
    errors.push({ field: 'vehicleId', message: 'Vehicle selection is required.' });
  }

  if (!body.customerName || typeof body.customerName !== 'string' || body.customerName.trim().length < 2) {
    errors.push({ field: 'customerName', message: 'Customer full name is required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!body.customerEmail || typeof body.customerEmail !== 'string' || !emailRegex.test(body.customerEmail.trim())) {
    errors.push({ field: 'customerEmail', message: 'A valid customer email is required.' });
  }

  if (!body.customerPhone || typeof body.customerPhone !== 'string') {
    errors.push({ field: 'customerPhone', message: 'Contact phone number is required.' });
  }

  if (!body.driverLicenseNumber || typeof body.driverLicenseNumber !== 'string') {
    errors.push({ field: 'driverLicenseNumber', message: 'Driver license number is required.' });
  }

  const daysNum = Number(body.days);
  if (isNaN(daysNum) || daysNum < 1) {
    errors.push({ field: 'days', message: 'Rental duration must be at least 1 day.' });
  }

  if (body.protectionPlan && !['basic', 'standard', 'premium'].includes(body.protectionPlan)) {
    errors.push({ field: 'protectionPlan', message: 'Protection plan must be basic, standard, or premium.' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Booking validation failed.', errors);
  }
}
