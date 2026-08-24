# Error Handling Strategy: RIDEMATE

## Standard JSON Error Envelope
All error responses from the API adhere to a single unified schema:

```json
{
  "success": false,
  "message": "Human readable error description",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "registrationNumber",
      "message": "Registration number must be at least 3 characters."
    }
  ],
  "timestamp": "2026-08-24T13:30:00Z"
}
```

## Error Hierarchy

| Class | HTTP Status | Code | Description |
|---|---|---|---|
| `ValidationError` | `400 Bad Request` | `VALIDATION_ERROR` | Schema validation or missing fields |
| `UnauthorizedError` | `401 Unauthorized` | `UNAUTHORIZED` | Missing or invalid authentication token |
| `ForbiddenError` | `403 Forbidden` | `FORBIDDEN` | Insufficient role permissions |
| `NotFoundError` | `404 Not Found` | `NOT_FOUND` | Requested entity does not exist |
| `ConflictError` | `409 Conflict` | `CONFLICT` | Duplicate registration, VIN, or email |
| `RateLimitError` | `429 Too Many Requests` | `RATE_LIMIT_EXCEEDED` | Request threshold exceeded |
| `InternalServerError` | `500 Internal Server Error` | `INTERNAL_SERVER_ERROR` | Unhandled system exception |

## Centralized Error Middleware
- Catches both synchronous and asynchronous errors without application crash.
- Hides internal stack traces in production environments (`NODE_ENV === 'production'`).
- In development, includes helpful debug details for rapid developer feedback.
