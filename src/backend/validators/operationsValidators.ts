import { FieldError, ValidationError } from '../utils/errors';

export function validateRemoteCommandInput(body: any): void {
  const errors: FieldError[] = [];

  if (!body.vehicleId || typeof body.vehicleId !== 'string') {
    errors.push({ field: 'vehicleId', message: 'Vehicle ID is required.' });
  }

  const allowedCommands = ['lock', 'unlock', 'honk', 'immobilize', 'start_engine', 'stop_engine'];
  if (!body.command || !allowedCommands.includes(body.command)) {
    errors.push({
      field: 'command',
      message: `Command must be one of: ${allowedCommands.join(', ')}.`,
    });
  }

  if (errors.length > 0) {
    throw new ValidationError('Remote command validation failed.', errors);
  }
}
