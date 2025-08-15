/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(message: string, statusCode: number = 500, code?: string, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set prototype explicitly for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation error for input validation failures
 */
export class ValidationError extends AppError {
  constructor(message: string, code?: string) {
    super(message, 400, code || 'VALIDATION_ERROR');
  }
}

/**
 * Authentication error for unauthorized access
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', code?: string) {
    super(message, 401, code || 'AUTHENTICATION_ERROR');
  }
}

/**
 * Authorization error for insufficient permissions
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', code?: string) {
    super(message, 403, code || 'AUTHORIZATION_ERROR');
  }
}

/**
 * Not found error for missing resources
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code?: string) {
    super(message, 404, code || 'NOT_FOUND_ERROR');
  }
}

/**
 * Conflict error for resource conflicts
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', code?: string) {
    super(message, 409, code || 'CONFLICT_ERROR');
  }
}

/**
 * Rate limit error for too many requests
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', code?: string) {
    super(message, 429, code || 'RATE_LIMIT_ERROR');
  }
}

/**
 * Database error for database operation failures
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', code?: string) {
    super(message, 500, code || 'DATABASE_ERROR');
  }
}

/**
 * External service error for third-party service failures
 */
export class ExternalServiceError extends AppError {
  constructor(message: string = 'External service error', code?: string) {
    super(message, 502, code || 'EXTERNAL_SERVICE_ERROR');
  }
}

/**
 * Error factory for creating appropriate error types
 */
export class ErrorFactory {
  /**
   * Create error based on error type
   */
  static create(type: string, message: string, code?: string): AppError {
    switch (type.toLowerCase()) {
      case 'validation':
        return new ValidationError(message, code);
      case 'authentication':
        return new AuthenticationError(message, code);
      case 'authorization':
        return new AuthorizationError(message, code);
      case 'notfound':
        return new NotFoundError(message, code);
      case 'conflict':
        return new ConflictError(message, code);
      case 'ratelimit':
        return new RateLimitError(message, code);
      case 'database':
        return new DatabaseError(message, code);
      case 'externalservice':
        return new ExternalServiceError(message, code);
      default:
        return new AppError(message, 500, code);
    }
  }

  /**
   * Create error from existing error
   */
  static fromError(error: Error, statusCode?: number, code?: string): AppError {
    if (error instanceof AppError) {
      return error;
    }

    return new AppError(
      error.message,
      statusCode || 500,
      code || 'INTERNAL_ERROR'
    );
  }

  /**
   * Create validation error from validation result
   */
  static fromValidation(validationResult: any): ValidationError {
    const message = validationResult.error?.message || 'Validation failed';
    const code = 'VALIDATION_ERROR';
    
    return new ValidationError(message, code);
  }
}

/**
 * Error codes enumeration
 */
export enum ErrorCodes {
  // Authentication & Authorization
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',

  // Validation
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_EMAIL_FORMAT = 'INVALID_EMAIL_FORMAT',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_DATE_FORMAT = 'INVALID_DATE_FORMAT',

  // Resource Management
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_IN_USE = 'RESOURCE_IN_USE',
  RESOURCE_DELETED = 'RESOURCE_DELETED',

  // Database
  DATABASE_CONNECTION_FAILED = 'DATABASE_CONNECTION_FAILED',
  DATABASE_QUERY_FAILED = 'DATABASE_QUERY_FAILED',
  DATABASE_CONSTRAINT_VIOLATION = 'DATABASE_CONSTRAINT_VIOLATION',
  DATABASE_TRANSACTION_FAILED = 'DATABASE_TRANSACTION_FAILED',

  // External Services
  EMAIL_SERVICE_FAILED = 'EMAIL_SERVICE_FAILED',
  FILE_STORAGE_FAILED = 'FILE_STORAGE_FAILED',
  PAYMENT_SERVICE_FAILED = 'PAYMENT_SERVICE_FAILED',

  // System
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * HTTP status codes mapping
 */
export const HTTP_STATUS_CODES = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  CONFLICT: 409,
  GONE: 410,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export type HttpStatusCode = typeof HTTP_STATUS_CODES[keyof typeof HTTP_STATUS_CODES];
