"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logPerformance = exports.logSecurityEvent = exports.logError = exports.logUserAction = exports.morganStream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const logDir = 'logs';
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
}), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.prettyPrint());
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'mathquest-backend' },
    transports: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, 'combined.log'),
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
});
if (process.env.NODE_ENV !== 'production') {
    exports.logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
    }));
}
exports.morganStream = {
    write: (message) => {
        exports.logger.info(message.trim());
    },
};
const logUserAction = (userId, action, details) => {
    exports.logger.info('User action', {
        userId,
        action,
        details,
        timestamp: new Date().toISOString()
    });
};
exports.logUserAction = logUserAction;
const logError = (error, context) => {
    exports.logger.error('Application error', {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
    });
};
exports.logError = logError;
const logSecurityEvent = (event, details) => {
    exports.logger.warn('Security event', {
        event,
        details,
        timestamp: new Date().toISOString()
    });
};
exports.logSecurityEvent = logSecurityEvent;
const logPerformance = (operation, duration, details) => {
    exports.logger.info('Performance metric', {
        operation,
        duration,
        details,
        timestamp: new Date().toISOString()
    });
};
exports.logPerformance = logPerformance;
//# sourceMappingURL=logger.js.map