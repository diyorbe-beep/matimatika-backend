"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const app_1 = require("../config/app");
const connection_1 = require("../database/connection");
const validation_1 = require("../middleware/validation");
class AuthService {
    static async register(userData) {
        const validated = validation_1.userRegistrationSchema.parse(userData);
        const existingUser = await connection_1.db.queryOne('SELECT id FROM users WHERE email = $1 OR username = $2', [validated.email, validated.username]);
        if (existingUser) {
            throw new Error('User with this email or username already exists');
        }
        const passwordHash = await bcryptjs_1.default.hash(validated.password, this.SALT_ROUNDS);
        const result = await connection_1.db.transaction(async (client) => {
            const userQuery = `
        INSERT INTO users (username, email, password_hash, role, avatar_url, created_at, updated_at) 
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
        RETURNING id, username, email, role, avatar_url, created_at
      `;
            const user = await client.queryOne(userQuery, [
                validated.username,
                validated.email,
                passwordHash,
                validated.role,
                validated.avatar_url
            ]);
            const profileQuery = `
        INSERT INTO user_profiles (user_id, display_name, grade_level, parent_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id, display_name, grade_level, total_xp, current_level, hearts, currency
      `;
            const profile = await client.queryOne(profileQuery, [
                user.id,
                validated.username,
                validated.grade_level,
                validated.parent_id
            ]);
            return { user, profile };
        });
        const accessToken = 'temp-token';
        const refreshToken = 'temp-refresh-token';
        return {
            user: {
                id: result.user.id,
                username: result.user.username,
                email: result.user.email,
                role: result.user.role,
                avatar_url: result.user.avatar_url,
                profile: result.profile
            },
            accessToken,
            refreshToken,
            expiresIn: 900
        };
    }
    static async login(credentials) {
        const validated = validation_1.userLoginSchema.parse(credentials);
        const userQuery = `
      SELECT u.id, u.username, u.email, u.password_hash, u.role, u.avatar_url, 
             up.id as profile_id, up.display_name, up.grade_level, up.total_xp, 
             up.current_level, up.hearts, up.currency
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.email = $1 AND u.is_active = true AND u.is_banned = false
    `;
        const user = await connection_1.db.queryOne(userQuery, [validated.email]);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const isValidPassword = await bcryptjs_1.default.compare(validated.password, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }
        await connection_1.db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
        const accessToken = 'temp-token';
        const refreshToken = 'temp-refresh-token';
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar_url: user.avatar_url,
                profile: {
                    id: user.profile_id,
                    display_name: user.display_name,
                    grade_level: user.grade_level,
                    total_xp: user.total_xp,
                    current_level: user.current_level,
                    hearts: user.hearts,
                    currency: user.currency
                }
            },
            accessToken,
            refreshToken,
            expiresIn: 900
        };
    }
    static async refreshToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, app_1.config.jwtSecret);
            if (decoded.type !== 'refresh') {
                throw new Error('Invalid refresh token');
            }
            const userQuery = `
        SELECT u.id, u.username, u.email, u.role, u.avatar_url, 
               up.id as profile_id, up.display_name, up.grade_level, up.total_xp, 
               up.current_level, up.hearts, up.currency
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id = $1 AND u.is_active = true AND u.is_banned = false
      `;
            const user = await connection_1.db.queryOne(userQuery, [decoded.userId]);
            if (!user) {
                throw new Error('User not found');
            }
            const accessToken = 'temp-token';
            return {
                accessToken,
                expiresIn: 900
            };
        }
        catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }
    static async logout(userId, refreshToken) {
        return { success: true };
    }
    static async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, app_1.config.jwtSecret);
            const userQuery = `
        SELECT u.id, u.username, u.email, u.role, u.avatar_url, 
               up.id as profile_id, up.display_name, up.grade_level, up.total_xp, 
               up.current_level, up.hearts, up.currency
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id = $1 AND u.is_active = true AND u.is_banned = false
      `;
            const user = await connection_1.db.queryOne(userQuery, [decoded.userId]);
            if (!user) {
                throw new Error('User not found');
            }
            return {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar_url: user.avatar_url,
                profile: {
                    id: user.profile_id,
                    display_name: user.display_name,
                    grade_level: user.grade_level,
                    total_xp: user.total_xp,
                    current_level: user.current_level,
                    hearts: user.hearts,
                    currency: user.currency
                }
            };
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
    static async forgotPassword(email) {
        const user = await connection_1.db.queryOne('SELECT id, username FROM users WHERE email = $1 AND is_active = true', [email]);
        if (!user) {
            return { success: true };
        }
        const resetToken = (0, crypto_1.randomUUID)();
        const expiresAt = new Date(Date.now() + 3600000);
        await connection_1.db.query('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)', [user.id, resetToken, expiresAt]);
        return { success: true };
    }
    static async resetPassword(token, newPassword) {
        const resetTokenQuery = `
      SELECT user_id, expires_at 
      FROM password_reset_tokens 
      WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()
    `;
        const resetToken = await connection_1.db.queryOne(resetTokenQuery, [token]);
        if (!resetToken) {
            throw new Error('Invalid or expired reset token');
        }
        const passwordHash = await bcryptjs_1.default.hash(newPassword, this.SALT_ROUNDS);
        await connection_1.db.transaction(async (client) => {
            await client.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, resetToken.user_id]);
            await client.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE token = $1', [token]);
        });
        return { success: true };
    }
    static async changePassword(userId, currentPassword, newPassword) {
        if (!userId) {
            throw new Error('User ID is required');
        }
        const user = await connection_1.db.queryOne('SELECT password_hash FROM users WHERE id = $1 AND is_active = true', [userId]);
        if (!user) {
            throw new Error('User not found');
        }
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
        if (!isValidPassword) {
            throw new Error('Current password is incorrect');
        }
        const newPasswordHash = await bcryptjs_1.default.hash(newPassword, this.SALT_ROUNDS);
        await connection_1.db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newPasswordHash, userId]);
        return { success: true };
    }
    static async getCurrentUser(userId) {
        const userQuery = `
      SELECT u.id, u.username, u.email, u.role, u.avatar_url, u.created_at, u.last_login,
             up.id as profile_id, up.display_name, up.grade_level, up.total_xp, 
             up.current_level, up.hearts, up.currency, up.current_streak, up.best_streak,
             up.total_time_spent
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1 AND u.is_active = true AND u.is_banned = false
    `;
        const user = await connection_1.db.queryOne(userQuery, [userId]);
        if (!user) {
            throw new Error('User not found');
        }
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar_url: user.avatar_url,
            created_at: user.created_at,
            last_login: user.last_login,
            profile: {
                id: user.profile_id,
                display_name: user.display_name,
                grade_level: user.grade_level,
                total_xp: user.total_xp,
                current_level: user.current_level,
                hearts: user.hearts,
                currency: user.currency,
                current_streak: user.current_streak,
                best_streak: user.best_streak,
                total_time_spent: user.total_time_spent
            }
        };
    }
}
exports.AuthService = AuthService;
AuthService.SALT_ROUNDS = app_1.config.bcryptRounds;
AuthService.JWT_EXPIRES_IN = app_1.config.jwtExpiresIn;
AuthService.JWT_REFRESH_EXPIRES_IN = app_1.config.jwtRefreshExpiresIn;
//# sourceMappingURL=authService.js.map