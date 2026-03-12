import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/app';
import { db } from '../database/connection';
import { UserRole } from '../types';
import { logSecurityEvent } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    profile_id?: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      logSecurityEvent('Missing access token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        timestamp: new Date().toISOString(),
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    
    // Verify user still exists and is active in database
    const userQuery = `
      SELECT u.id, u.email, u.username, u.role, up.id as profile_id
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1 AND u.created_at IS NOT NULL
    `;
    
    const user = await db.queryOne(userQuery, [decoded.userId]);

    if (!user) {
      logSecurityEvent('Invalid token - user not found', {
        userId: decoded.userId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      return res.status(401).json({
        success: false,
        error: 'Invalid token - user not found',
        timestamp: new Date().toISOString(),
      });
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      profile_id: user.profile_id,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logSecurityEvent('Token expired', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        timestamp: new Date().toISOString(),
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logSecurityEvent('Invalid JWT token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      return res.status(403).json({
        success: false,
        error: 'Invalid token',
        timestamp: new Date().toISOString(),
      });
    }

    logSecurityEvent('Authentication error', {
      error: (error as Error).message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });

    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      timestamp: new Date().toISOString(),
    });
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
    }

    if (!roles.includes(req.user.role)) {
      logSecurityEvent('Insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        ip: req.ip,
        path: req.path,
      });
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

export const requireOwnership = (resourceUserIdField = 'user_id') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
    }

    // Admins can access any resource
    if (req.user.role === UserRole.ADMIN) {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (req.user.id !== resourceUserId) {
      logSecurityEvent('Unauthorized resource access', {
        userId: req.user.id,
        resourceUserId,
        path: req.path,
        method: req.method,
      });
      return res.status(403).json({
        success: false,
        error: 'Access denied - resource ownership required',
        timestamp: new Date().toISOString(),
      });
    }

    next();
  };
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without authentication
    }

    // If token exists, verify it
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    
    const userQuery = `
      SELECT u.id, u.email, u.username, u.role, up.id as profile_id
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `;
    
    const user = await db.queryOne(userQuery, [decoded.userId]);

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        profile_id: user.profile_id,
      };
    }

    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};
