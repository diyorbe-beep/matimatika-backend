"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatabaseError = exports.createRateLimitError = exports.createConflictError = exports.createForbiddenError = exports.createUnauthorizedError = exports.createNotFoundError = exports.createValidationError = exports.notFound = exports.asyncHandler = exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("../utils/logger");
const app_1 = require("../config/app");
class AppError extends Error {
    constructor(message, statusCode = 500, code, details) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.code = code;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    const errorContext = {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        body: app_1.config.nodeEnv === 'development' ? req.body : undefined,
        params: req.params,
        query: req.query,
    };
    (0, logger_1.logError)(err, errorContext);
    if (err.name === 'QueryResultError' || err.message.includes('database')) {
        error = new AppError('Database operation failed', 500, 'DATABASE_ERROR');
    }
    if (err.message.includes('duplicate key')) {
        error = new AppError('Resource already exists', 409, 'DUPLICATE_RESOURCE');
    }
    if (err.message.includes('foreign key constraint')) {
        error = new AppError('Referenced resource not found', 400, 'FOREIGN_KEY_VIOLATION');
    }
    if (err.message.includes('invalid input syntax')) {
        error = new AppError('Invalid data format provided', 400, 'INVALID_INPUT');
    }
    if (err.name === 'JsonWebTokenError') {
        (0, logger_1.logSecurityEvent)('Invalid JWT token attempted', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
        });
        error = new AppError('Invalid authentication token', 401, 'INVALID_TOKEN');
    }
    if (err.name === 'TokenExpiredError') {
        error = new AppError('Authentication token expired', 401, 'TOKEN_EXPIRED');
    }
    if (err.name === 'ValidationError') {
        error = new AppError('Data validation failed', 400, 'VALIDATION_ERROR', err.details);
    }
    if (err.message.includes('Too many requests')) {
        error = new AppError('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
    }
    if (err.message.includes('File too large')) {
        error = new AppError('File size exceeds limit', 413, 'FILE_TOO_LARGE');
    }
    if (err.message.includes('Invalid file type')) {
        error = new AppError('Invalid file type', 400, 'INVALID_FILE_TYPE');
    }
    if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
        error = new AppError('Request timeout', 408, 'TIMEOUT');
    }
    if (err.message.includes('permission denied') || err.message.includes('access denied')) {
        (0, logger_1.logSecurityEvent)('Access denied', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            userId: req.user?.id,
        });
        error = new AppError('Access denied', 403, 'ACCESS_DENIED');
    }
    const statusCode = error.statusCode || 500;
    const isDevelopment = app_1.config.nodeEnv === 'development';
    const errorResponse = {
        success: false,
        error: {
            message: error.message,
            code: error.code || 'INTERNAL_ERROR',
            timestamp: new Date().toISOString(),
        },
    };
    if ((isDevelopment || error.isOperational) && error.details) {
        errorResponse.error.details = error.details;
    }
    if (isDevelopment && error.stack) {
        errorResponse.error.stack = error.stack;
    }
    if (req.requestId) {
        errorResponse.requestId = req.requestId;
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const notFound = (req, res, next) => {
    const error = new AppError(`Route not found - ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND');
    next(error);
};
exports.notFound = notFound;
const createValidationError = (message, details) => {
    return new AppError(message, 400, 'VALIDATION_ERROR', details);
};
exports.createValidationError = createValidationError;
const createNotFoundError = (resource) => {
    return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};
exports.createNotFoundError = createNotFoundError;
const createUnauthorizedError = (message = 'Unauthorized access') => {
    return new AppError(message, 401, 'UNAUTHORIZED');
};
exports.createUnauthorizedError = createUnauthorizedError;
const createForbiddenError = (message = 'Access forbidden') => {
    return new AppError(message, 403, 'FORBIDDEN');
};
exports.createForbiddenError = createForbiddenError;
const createConflictError = (message) => {
    return new AppError(message, 409, 'CONFLICT');
};
exports.createConflictError = createConflictError;
const createRateLimitError = (message = 'Rate limit exceeded') => {
    return new AppError(message, 429, 'RATE_LIMIT_EXCEEDED');
};
exports.createRateLimitError = createRateLimitError;
const createDatabaseError = (message = 'Database operation failed') => {
    return new AppError(message, 500, 'DATABASE_ERROR');
};
exports.createDatabaseError = createDatabaseError;
//# sourceMappingURL=errorHandler.js.map