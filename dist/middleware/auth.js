"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireOwnership = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = require("../config/app");
const connection_1 = require("../database/connection");
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            (0, logger_1.logSecurityEvent)('Missing access token', {
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
        const decoded = jsonwebtoken_1.default.verify(token, app_1.config.jwtSecret);
        const userQuery = `
      SELECT u.id, u.email, u.username, u.role, up.id as profile_id
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1 AND u.created_at IS NOT NULL
    `;
        const user = await connection_1.db.queryOne(userQuery, [decoded.userId]);
        if (!user) {
            (0, logger_1.logSecurityEvent)('Invalid token - user not found', {
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
        req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            profile_id: user.profile_id,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            (0, logger_1.logSecurityEvent)('Token expired', {
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
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            (0, logger_1.logSecurityEvent)('Invalid JWT token', {
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
        (0, logger_1.logSecurityEvent)('Authentication error', {
            error: error.message,
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
exports.authenticateToken = authenticateToken;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                timestamp: new Date().toISOString(),
            });
        }
        if (!roles.includes(req.user.role)) {
            (0, logger_1.logSecurityEvent)('Insufficient permissions', {
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
exports.requireRole = requireRole;
const requireOwnership = (resourceUserIdField = 'user_id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                timestamp: new Date().toISOString(),
            });
        }
        if (req.user.role === types_1.UserRole.ADMIN) {
            return next();
        }
        const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
        if (req.user.id !== resourceUserId) {
            (0, logger_1.logSecurityEvent)('Unauthorized resource access', {
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
exports.requireOwnership = requireOwnership;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return next();
        }
        const decoded = jsonwebtoken_1.default.verify(token, app_1.config.jwtSecret);
        const userQuery = `
      SELECT u.id, u.email, u.username, u.role, up.id as profile_id
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1
    `;
        const user = await connection_1.db.queryOne(userQuery, [decoded.userId]);
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
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map