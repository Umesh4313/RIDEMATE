import { FieldError, ValidationError } from '../utils/errors';

export function validateRegisterInput(body: any): void {
  const errors: FieldError[] = [];

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Full name is required (at least 2 characters).' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!body.email || typeof body.email !== 'string' || !emailRegex.test(body.email.trim())) {
    errors.push({ field: 'email', message: 'A valid email address is required.' });
  }

  if (!body.password || typeof body.password !== 'string' || body.password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters long.' });
  }

  if (body.role && !['admin', 'operations', 'customer'].includes(body.role)) {
    errors.push({ field: 'role', message: 'Role must be one of: customer, operations, admin.' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Registration validation failed.', errors);
  }
}

export function validateLoginInput(body: any): void {
  const errors: FieldError[] = [];

  if (!body.email || typeof body.email !== 'string' || !body.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required.' });
  }

  if (!body.password || typeof body.password !== 'string' || !body.password.trim()) {
    errors.push({ field: 'password', message: 'Password is required.' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Login validation failed.', errors);
  }
}

export function validateForgotPasswordInput(body: any): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!body.email || typeof body.email !== 'string' || !emailRegex.test(body.email.trim())) {
    throw new ValidationError('A valid email address is required.', [
      { field: 'email', message: 'Please provide a valid account email.' },
    ]);
  }
}

export function validateResetPasswordInput(body: any): void {
  const errors: FieldError[] = [];

  if (!body.email || typeof body.email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required.' });
  }

  if (!body.code || typeof body.code !== 'string' || body.code.trim().length !== 6) {
    errors.push({ field: 'code', message: 'A 6-digit verification code is required.' });
  }

  if (!body.newPassword || typeof body.newPassword !== 'string' || body.newPassword.length < 6) {
    errors.push({ field: 'newPassword', message: 'New password must be at least 6 characters.' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Password reset validation failed.', errors);
  }
}
