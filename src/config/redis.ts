import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType;

export const connectRedis = async (): Promise<RedisClientType> => {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient({
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
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    // In development, we can continue without Redis
    if (process.env.NODE_ENV === 'development') {
      console.warn('Continuing without Redis in development mode');
      return null as any;
    }
    throw error;
  }
};

export const getRedisClient = (): RedisClientType => {
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null as any;
  }
};

// Cache helper functions
export const cacheSet = async (
  key: string, 
  value: any, 
  ttl: number = 3600
): Promise<void> => {
  try {
    const client = getRedisClient();
    if (client) {
      await client.setEx(key, ttl, JSON.stringify(value));
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    if (client) {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    }
    return null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    if (client) {
      await client.del(key);
    }
  } catch (error) {
    console.error('Cache delete error:', error);
  }
};

export const cacheInvalidatePattern = async (pattern: string): Promise<void> => {
  try {
    const client = getRedisClient();
    if (client) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
    }
  } catch (error) {
    console.error('Cache invalidate pattern error:', error);
  }
};
