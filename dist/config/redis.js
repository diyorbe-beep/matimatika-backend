"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheInvalidatePattern = exports.cacheDel = exports.cacheGet = exports.cacheSet = exports.disconnectRedis = exports.getRedisClient = exports.connectRedis = void 0;
const redis_1 = require("redis");
let redisClient;
const connectRedis = async () => {
    if (redisClient) {
        return redisClient;
    }
    try {
        redisClient = (0, redis_1.createClient)({
            socket: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
            },
            password: process.env.REDIS_PASSWORD || undefined,
        });
        redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });
        redisClient.on('connect', () => {
            console.log('Redis Client Connected');
        });
        await redisClient.connect();
        return redisClient;
    }
    catch (error) {
        console.error('Failed to connect to Redis:', error);
        if (process.env.NODE_ENV === 'development') {
            console.warn('Continuing without Redis in development mode');
            return null;
        }
        throw error;
    }
};
exports.connectRedis = connectRedis;
const getRedisClient = () => {
    return redisClient;
};
exports.getRedisClient = getRedisClient;
const disconnectRedis = async () => {
    if (redisClient) {
        await redisClient.disconnect();
        redisClient = null;
    }
};
exports.disconnectRedis = disconnectRedis;
const cacheSet = async (key, value, ttl = 3600) => {
    try {
        const client = (0, exports.getRedisClient)();
        if (client) {
            await client.setEx(key, ttl, JSON.stringify(value));
        }
    }
    catch (error) {
        console.error('Cache set error:', error);
    }
};
exports.cacheSet = cacheSet;
const cacheGet = async (key) => {
    try {
        const client = (0, exports.getRedisClient)();
        if (client) {
            const value = await client.get(key);
            return value ? JSON.parse(value) : null;
        }
        return null;
    }
    catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
};
exports.cacheGet = cacheGet;
const cacheDel = async (key) => {
    try {
        const client = (0, exports.getRedisClient)();
        if (client) {
            await client.del(key);
        }
    }
    catch (error) {
        console.error('Cache delete error:', error);
    }
};
exports.cacheDel = cacheDel;
const cacheInvalidatePattern = async (pattern) => {
    try {
        const client = (0, exports.getRedisClient)();
        if (client) {
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
            }
        }
    }
    catch (error) {
        console.error('Cache invalidate pattern error:', error);
    }
};
exports.cacheInvalidatePattern = cacheInvalidatePattern;
//# sourceMappingURL=redis.js.map