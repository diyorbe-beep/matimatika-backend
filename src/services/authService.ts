import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { config } from '../config/app';
import { db } from '../database/connection';
import { UserRole } from '../types';
import { userRegistrationSchema, userLoginSchema } from '../middleware/validation';

export class AuthService {
  private static readonly SALT_ROUNDS = config.bcryptRounds;
  private static readonly JWT_EXPIRES_IN = config.jwtExpiresIn;
  private static readonly JWT_REFRESH_EXPIRES_IN = config.jwtRefreshExpiresIn;

  static async register(userData: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    grade_level?: number;
    parent_id?: string;
    avatar_url?: string;
  }) {
    // Validate input
    const validated = userRegistrationSchema.parse(userData);

    // Check if user already exists
    const existingUser = await db.queryOne(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [validated.email, validated.username]
    );

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, this.SALT_ROUNDS);

    // Use transaction for user creation
    const result = await db.transaction(async (client) => {
      // Create user
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

      // Create user profile
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

    // Generate JWT tokens
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
      expiresIn: 900 // 15 minutes
    };
  }

  static async login(credentials: {
    email: string;
    password: string;
  }) {
    // Validate input
    const validated = userLoginSchema.parse(credentials);

    // Find user with profile
    const userQuery = `
      SELECT u.id, u.username, u.email, u.password_hash, u.role, u.avatar_url, 
             up.id as profile_id, up.display_name, up.grade_level, up.total_xp, 
             up.current_level, up.hearts, up.currency
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.email = $1 AND u.is_active = true AND u.is_banned = false
    `;
    const user = await db.queryOne(userQuery, [validated.email]);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(validated.password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate JWT tokens
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
      expiresIn: 900 // 15 minutes
    };
  }

  static async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtSecret) as any;
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      // Find user with profile
      const userQuery = `
        SELECT u.id, u.username, u.email, u.role, u.avatar_url, 
               up.id as profile_id, up.display_name, up.grade_level, up.total_xp, 
               up.current_level, up.hearts, up.currency
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id = $1 AND u.is_active = true AND u.is_banned = false
      `;
      const user = await db.queryOne(userQuery, [decoded.userId]);

      if (!user) {
        throw new Error('User not found');
      }

      // Generate new access token
      const accessToken = 'temp-token';

      return {
        accessToken,
        expiresIn: 900 // 15 minutes
      };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  static async logout(userId?: string, refreshToken?: string) {
    // In a real implementation, you would invalidate the refresh token
    // For now, we'll just return success
    // TODO: Implement token blacklisting in Redis
    return { success: true };
  }

  static async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      
      const userQuery = `
        SELECT u.id, u.username, u.email, u.role, u.avatar_url, 
               up.id as profile_id, up.display_name, up.grade_level, up.total_xp, 
               up.current_level, up.hearts, up.currency
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.id = $1 AND u.is_active = true AND u.is_banned = false
      `;
      const user = await db.queryOne(userQuery, [decoded.userId]);

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
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async forgotPassword(email: string) {
    const user = await db.queryOne(
      'SELECT id, username FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (!user) {
      // Don't reveal if email exists or not
      return { success: true };
    }

    // Generate reset token
    const resetToken = randomUUID();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token
    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetToken, expiresAt]
    );

    // TODO: Send email with reset link
    // For now, just return success
    return { success: true };
  }

  static async resetPassword(token: string, newPassword: string) {
    // Find valid reset token
    const resetTokenQuery = `
      SELECT user_id, expires_at 
      FROM password_reset_tokens 
      WHERE token = $1 AND used_at IS NULL AND expires_at > NOW()
    `;
    const resetToken = await db.queryOne(resetTokenQuery, [token]);

    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update password and mark token as used
    await db.transaction(async (client) => {
      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [passwordHash, resetToken.user_id]
      );

      await client.query(
        'UPDATE password_reset_tokens SET used_at = NOW() WHERE token = $1',
        [token]
      );
    });

    return { success: true };
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get current password hash
    const user = await db.queryOne(
      'SELECT password_hash FROM users WHERE id = $1 AND is_active = true',
      [userId]
    );

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userId]
    );

    return { success: true };
  }

  static async getCurrentUser(userId: string) {
    const userQuery = `
      SELECT u.id, u.username, u.email, u.role, u.avatar_url, u.created_at, u.last_login,
             up.id as profile_id, up.display_name, up.grade_level, up.total_xp, 
             up.current_level, up.hearts, up.currency, up.current_streak, up.best_streak,
             up.total_time_spent
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = $1 AND u.is_active = true AND u.is_banned = false
    `;
    const user = await db.queryOne(userQuery, [userId]);

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
