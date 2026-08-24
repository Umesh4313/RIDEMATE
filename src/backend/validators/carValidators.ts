import { FieldError, ValidationError } from '../utils/errors';

export function validateCarInput(body: any, isUpdate = false): void {
  const errors: FieldError[] = [];

  if (!isUpdate || body.name !== undefined) {
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Vehicle name is required (at least 2 characters).' });
    }
  }

  if (!isUpdate || body.brand !== undefined) {
    if (!body.brand || typeof body.brand !== 'string' || body.brand.trim().length < 2) {
      errors.push({ field: 'brand', message: 'Brand / Manufacturer is required.' });
    }
  }

  if (!isUpdate || body.model !== undefined) {
    if (!body.model || typeof body.model !== 'string' || body.model.trim().length < 1) {
      errors.push({ field: 'model', message: 'Model is required.' });
    }
  }

  if (!isUpdate || body.year !== undefined) {
    const yearNum = Number(body.year);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum) || yearNum < 1990 || yearNum > currentYear + 2) {
      errors.push({ field: 'year', message: `Year must be between 1990 and ${currentYear + 2}.` });
    }
  }

  if (!isUpdate || body.registrationNumber !== undefined) {
    if (!body.registrationNumber || typeof body.registrationNumber !== 'string' || body.registrationNumber.trim().length < 3) {
      errors.push({ field: 'registrationNumber', message: 'Registration / License Plate must be at least 3 characters.' });
    }
  }

  if (!isUpdate || body.vin !== undefined) {
    if (!body.vin || typeof body.vin !== 'string' || body.vin.trim().length < 8 || body.vin.trim().length > 17) {
      errors.push({ field: 'vin', message: 'VIN must be between 8 and 17 alphanumeric characters.' });
    }
  }

  if (!isUpdate || body.rentalPricePerDay !== undefined) {
    const rate = Number(body.rentalPricePerDay);
    if (isNaN(rate) || rate <= 0) {
      errors.push({ field: 'rentalPricePerDay', message: 'Daily rental price must be greater than $0.' });
    }
  }

  if (body.price !== undefined) {
    const priceNum = Number(body.price);
    if (isNaN(priceNum) || priceNum < 0) {
      errors.push({ field: 'price', message: 'Vehicle valuation MSRP cannot be negative.' });
    }
  }

  if (body.seatingCapacity !== undefined) {
    const seats = Number(body.seatingCapacity);
    if (isNaN(seats) || seats < 1 || seats > 15) {
      errors.push({ field: 'seatingCapacity', message: 'Seating capacity must be between 1 and 15.' });
    }
  }

  if (body.status !== undefined) {
    const validStatuses = ['Available', 'Rented', 'Maintenance', 'Unavailable'];
    if (!validStatuses.includes(body.status)) {
      errors.push({ field: 'status', message: `Status must be one of: ${validStatuses.join(', ')}.` });
    }
  }

  if (body.category !== undefined) {
    const validCategories = ['Sedan', 'SUV', 'Luxury', 'Electric', 'Coupe', 'Sports', 'Convertible', 'Truck'];
    if (!validCategories.includes(body.category)) {
      errors.push({ field: 'category', message: `Category must be one of: ${validCategories.join(', ')}.` });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Vehicle validation failed.', errors);
  }
}
