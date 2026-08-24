export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export const ROLES = {
  ADMIN: 'admin',
  OPERATIONS: 'operations',
  CUSTOMER: 'customer',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const VEHICLE_STATUS = {
  AVAILABLE: 'Available',
  RENTED: 'Rented',
  MAINTENANCE: 'Maintenance',
  UNAVAILABLE: 'Unavailable',
} as const;

export const BOOKING_STATUS = {
  CONFIRMED: 'Confirmed',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} as const;

export const PRICING = {
  TAX_RATE: 0.1125, // 11.25% municipal tax and fees
  PROTECTION_PLANS: {
    basic: 0, // $0 per day
    standard: 15, // $15 per day
    premium: 28, // $28 per day
  },
} as const;
