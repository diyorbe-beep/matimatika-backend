"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const xss_1 = __importDefault(require("xss"));
const app_1 = require("./config/app");
const logger_1 = require("./utils/logger");
const connection_1 = require("./database/connection");
const errorHandler_1 = require("./middleware/errorHandler");
const validation_1 = require("./middleware/validation");
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const learning_1 = __importDefault(require("./routes/learning"));
const progress_1 = __importDefault(require("./routes/progress"));
const gamification_1 = __importDefault(require("./routes/gamification"));
const shop_1 = __importDefault(require("./routes/shop"));
const admin_1 = __importDefault(require("./routes/admin"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", app_1.config.nodeEnv === 'development' ? "ws://localhost:5173" : ""],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
app.use((0, cors_1.default)({
    origin: app_1.config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'],
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: app_1.config.rateLimitWindowMs,
    max: app_1.config.rateLimitMaxRequests,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger_1.logger.warn('Rate limit exceeded', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            path: req.path,
            method: req.method,
        });
        res.status(429).json({
            success: false,
            error: 'Too many requests from this IP, please try again later.',
            timestamp: new Date().toISOString(),
        });
    },
});
app.use('/api', limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, express_mongo_sanitize_1.default)());
app.use(validation_1.sanitizeInput);
app.use((req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = (0, xss_1.default)(req.body[key], {
                    whiteList: {},
                    stripIgnoreTag: true,
                    stripIgnoreTagBody: ['script'],
                });
            }
        });
    }
    next();
});
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined', { stream: logger_1.morganStream }));
app.get('/health', async (req, res) => {
    try {
        const dbHealth = await connection_1.db.healthCheck();
        const memoryUsage = process.memoryUsage();
        const uptime = process.uptime();
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
            memory: {
                rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            },
            database: dbHealth ? 'connected' : 'disconnected',
            environment: app_1.config.nodeEnv,
            version: process.env.npm_package_version || '1.0.0',
        };
        res.status(200).json(health);
    }
    catch (error) {
        logger_1.logger.error('Health check failed', { error: error.message });
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Service unavailable',
        });
    }
});
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/users', users_1.default);
app.use('/api/v1/learning', learning_1.default);
app.use('/api/v1/progress', progress_1.default);
app.use('/api/v1/gamification', gamification_1.default);
app.use('/api/v1/shop', shop_1.default);
app.use('/api/v1/admin', admin_1.default);
app.use('/api/users', users_1.default);
app.use('/api/achievements', gamification_1.default);
app.use('/api/leaderboard', gamification_1.default);
app.get('/api', (req, res) => {
    res.json({
        name: 'MathQuest Academy API',
        version: '1.0.0',
        description: 'Interactive mathematics learning platform API',
        endpoints: {
            auth: '/api/v1/auth',
            users: '/api/v1/users',
            learning: '/api/v1/learning',
            progress: '/api/v1/progress',
            gamification: '/api/v1/gamification',
            shop: '/api/v1/shop',
            admin: '/api/v1/admin',
        },
        documentation: '/api/docs',
        health: '/health',
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
    });
});
app.use(errorHandler_1.errorHandler);
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    try {
        await connection_1.db.disconnect();
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Error during shutdown', { error: error.message });
        process.exit(1);
    }
});
process.on('SIGINT', async () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    try {
        await connection_1.db.disconnect();
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Error during shutdown', { error: error.message });
        process.exit(1);
    }
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection at:', { promise, reason });
});
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=app.js.map