"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
class AuthController {
    static async register(req, res) {
        try {
            const result = await authService_1.AuthService.register(req.body);
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: result
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('already exists')) {
                    return res.status(409).json({
                        success: false,
                        error: error.message
                    });
                }
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async login(req, res) {
        try {
            const result = await authService_1.AuthService.login(req.body);
            res.json({
                success: true,
                message: 'Login successful',
                data: result
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('Invalid')) {
                    return res.status(401).json({
                        success: false,
                        error: error.message
                    });
                }
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    error: 'Refresh token is required'
                });
            }
            const result = await authService_1.AuthService.refreshToken(refreshToken);
            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: result
            });
        }
        catch (error) {
            if (error instanceof Error) {
                return res.status(401).json({
                    success: false,
                    error: error.message
                });
            }
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            const userId = req.user?.id;
            await authService_1.AuthService.logout(userId, refreshToken);
            res.json({
                success: true,
                message: 'Logout successful'
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async verifyToken(req, res) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid token'
                });
            }
            res.json({
                success: true,
                data: { user }
            });
        }
        catch (error) {
            if (error instanceof Error) {
                return res.status(401).json({
                    success: false,
                    error: error.message
                });
            }
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({
                    success: false,
                    error: 'Email is required'
                });
            }
            await authService_1.AuthService.forgotPassword(email);
            res.json({
                success: true,
                message: 'Password reset instructions sent to your email'
            });
        }
        catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Token and new password are required'
                });
            }
            const result = await authService_1.AuthService.resetPassword(token, newPassword);
            res.json({
                success: true,
                message: 'Password reset successful',
                data: result
            });
        }
        catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async changePassword(req, res) {
        try {
            const { current_password, new_password } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }
            if (!current_password || !new_password) {
                return res.status(400).json({
                    success: false,
                    error: 'Current password and new password are required'
                });
            }
            if (new_password.length < 8) {
                return res.status(400).json({
                    success: false,
                    error: 'New password must be at least 8 characters long'
                });
            }
            const result = await authService_1.AuthService.changePassword(userId, current_password, new_password);
            res.json({
                success: true,
                message: 'Password changed successfully',
                data: result
            });
        }
        catch (error) {
            if (error instanceof Error) {
                if (error.message.includes('incorrect') || error.message.includes('not found')) {
                    return res.status(400).json({
                        success: false,
                        error: error.message
                    });
                }
                return res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
    static async getCurrentUser(req, res) {
        try {
            const user = req.user;
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }
            const userDetails = await authService_1.AuthService.getCurrentUser(user.id);
            res.json({
                success: true,
                data: userDetails
            });
        }
        catch (error) {
            if (error instanceof Error) {
                return res.status(404).json({
                    success: false,
                    error: error.message
                });
            }
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map