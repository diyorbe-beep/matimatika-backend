"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateCache = exports.cacheMiddleware = void 0;
const redis_1 = require("../config/redis");
const logger_1 = require("../utils/logger");
const cacheMiddleware = (ttl = 300) => {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }
        const key = `cache:${req.originalUrl}:${req.user?.id || 'anonymous'}`;
        try {
            const startTime = Date.now();
            const cachedData = await (0, redis_1.cacheGet)(key);
            if (cachedData) {
                const duration = Date.now() - startTime;
                (0, logger_1.logPerformance)('cache_hit', duration, { key, url: req.originalUrl });
                return res.json({
                    ...cachedData,
                    cached: true,
                    cacheTimestamp: new Date().toISOString()
                });
            }
            const originalJson = res.json;
            res.json = function (data) {
                const duration = Date.now() - startTime;
                (0, logger_1.logPerformance)('cache_miss', duration, { key, url: req.originalUrl });
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    (0, redis_1.cacheSet)(key, data, ttl).catch(console.error);
                }
                return originalJson.call(this, data);
            };
            next();
        }
        catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    };
};
exports.cacheMiddleware = cacheMiddleware;
const invalidateCache = (pattern) => {
    return async (req, res, next) => {
        const originalJson = res.json;
        res.json = function (data) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const { cacheInvalidatePattern } = require('../config/redis');
                cacheInvalidatePattern(pattern).catch(console.error);
            }
            return originalJson.call(this, data);
        };
        next();
    };
};
exports.invalidateCache = invalidateCache;
//# sourceMappingURL=cache.js.map