"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN?.split(',').map(url => url.trim()).filter(url => url) ||
        (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:5173']),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    logLevel: process.env.LOG_LEVEL || 'info',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/mathquest',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    emailHost: process.env.EMAIL_HOST || 'localhost',
    emailPort: parseInt(process.env.EMAIL_PORT || '587', 10),
    emailUser: process.env.EMAIL_USER || '',
    emailPass: process.env.EMAIL_PASS || '',
    uploadMaxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10),
    uploadAllowedTypes: process.env.UPLOAD_ALLOWED_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/webp'],
};
exports.config = config;
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0 && config.nodeEnv === 'production') {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}
//# sourceMappingURL=app.js.map