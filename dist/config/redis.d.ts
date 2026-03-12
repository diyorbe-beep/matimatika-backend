import { RedisClientType } from 'redis';
export declare const connectRedis: () => Promise<RedisClientType>;
export declare const getRedisClient: () => RedisClientType;
export declare const disconnectRedis: () => Promise<void>;
export declare const cacheSet: (key: string, value: any, ttl?: number) => Promise<void>;
export declare const cacheGet: <T>(key: string) => Promise<T | null>;
export declare const cacheDel: (key: string) => Promise<void>;
export declare const cacheInvalidatePattern: (pattern: string) => Promise<void>;
//# sourceMappingURL=redis.d.ts.map