import { Request, Response, NextFunction } from 'express';
import { logger, logError, logSecurityEvent } from '../utils/logger';
import { config } from '../config/app';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err } as AppError;
  error.message = err.message;

  // Log error with context
  const errorContext = {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    body: config.nodeEnv === 'development' ? req.body : undefined,
    params: req.params,
    query: req.query,
  };

  logError(err, errorContext);

  // Database errors
  if (err.name === 'QueryResultError' || err.message.includes('database')) {
    error = new AppError('Database operation failed', 500, 'DATABASE_ERROR');
  }

  // PostgreSQL specific errors
  if (err.message.includes('duplicate key')) {
    error = new AppError('Resource already exists', 409, 'DUPLICATE_RESOURCE');
  }

  if (err.message.includes('foreign key constraint')) {
    error = new AppError('Referenced resource not found', 400, 'FOREIGN_KEY_VIOLATION');
  }

  if (err.message.includes('invalid input syntax')) {
    error = new AppError('Invalid data format provided', 400, 'INVALID_INPUT');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    logSecurityEvent('Invalid JWT token attempted', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });
    error = new AppError('Invalid authentication token', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Authentication token expired', 401, 'TOKEN_EXPIRED');
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = new AppError('Data validation failed', 400, 'VALIDATION_ERROR', (err as any).details);
  }

  // Rate limiting errors
  if (err.message.includes('Too many requests')) {
    error = new AppError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
  }

  // File upload errors
  if (err.message.includes('File too large')) {
    error = new AppError('File size exceeds limit', 413, 'FILE_TOO_LARGE');
  }

  if (err.message.includes('Invalid file type')) {
    error = new AppError('Invalid file type', 400, 'INVALID_FILE_TYPE');
  }

  // Network/timeout errors
  if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
    error = new AppError('Request timeout', 408, 'TIMEOUT');
  }

  // Permission errors
  if (err.message.includes('permission denied') || err.message.includes('access denied')) {
    logSecurityEvent('Access denied', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      userId: (req as any).user?.id,
    });
    error = new AppError('Access denied', 403, 'ACCESS_DENIED');
  }

  // Default to 500 if no status code
  const statusCode = error.statusCode || 500;
  const isDevelopment = config.nodeEnv === 'development';

  // Prepare error response
  const errorResponse: any = {
    success: false,
    error: {
      message: error.message,
      code: error.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    },
  };

  // Add details in development or for operational errors
  if ((isDevelopment || error.isOperational) && error.details) {
    errorResponse.error.details = error.details;
  }

  // Add stack trace in development
  if (isDevelopment && error.stack) {
    errorResponse.error.stack = error.stack;
  }

  // Add request ID if available
  if ((req as any).requestId) {
    errorResponse.requestId = (req as any).requestId;
  }

  res.status(statusCode).json(errorResponse);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route not found - ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND');
  next(error);
};

// Specific error creators
export const createValidationError = (message: string, details?: any) => {
  return new AppError(message, 400, 'VALIDATION_ERROR', details);
};

export const createNotFoundError = (resource: string) => {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

export const createUnauthorizedError = (message: string = 'Unauthorized access') => {
  return new AppError(message, 401, 'UNAUTHORIZED');
};

export const createForbiddenError = (message: string = 'Access forbidden') => {
  return new AppError(message, 403, 'FORBIDDEN');
};

export const createConflictError = (message: string) => {
  return new AppError(message, 409, 'CONFLICT');
};

export const createRateLimitError = (message: string = 'Rate limit exceeded') => {
  return new AppError(message, 429, 'RATE_LIMIT_EXCEEDED');
};

export const createDatabaseError = (message: string = 'Database operation failed') => {
  return new AppError(message, 500, 'DATABASE_ERROR');
};
