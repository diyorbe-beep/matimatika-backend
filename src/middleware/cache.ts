import { Request, Response, NextFunction } from 'express';
import { cacheGet, cacheSet } from '../config/redis';
import { logPerformance } from '../utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}:${req.user?.id || 'anonymous'}`;
    
    try {
      const startTime = Date.now();
      
      // Try to get from cache
      const cachedData = await cacheGet(key);
      
      if (cachedData) {
        const duration = Date.now() - startTime;
        logPerformance('cache_hit', duration, { key, url: req.originalUrl });
        
        return res.json({
          ...cachedData,
          cached: true,
          cacheTimestamp: new Date().toISOString()
        });
      }

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data: any) {
        const duration = Date.now() - startTime;
        logPerformance('cache_miss', duration, { key, url: req.originalUrl });
        
        // Cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheSet(key, data, ttl).catch(console.error);
        }
        
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

export const invalidateCache = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    
    res.json = function(data: any) {
      // Invalidate cache on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const { cacheInvalidatePattern } = require('../config/redis');
        cacheInvalidatePattern(pattern).catch(console.error);
      }
      
      return originalJson.call(this, data);
    };

    next();
  };
};
