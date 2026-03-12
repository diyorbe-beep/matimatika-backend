"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const validation_2 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.post('/register', (0, validation_1.sensitiveOperationLimiter)(3), (0, validation_1.validateRequest)(validation_2.userRegistrationSchema), authController_1.AuthController.register);
router.post('/login', (0, validation_1.sensitiveOperationLimiter)(10), (0, validation_1.validateRequest)(validation_2.userLoginSchema), authController_1.AuthController.login);
router.post('/refresh', authController_1.AuthController.refreshToken);
router.post('/logout', auth_1.authenticateToken, authController_1.AuthController.logout);
router.get('/verify', auth_1.authenticateToken, authController_1.AuthController.verifyToken);
router.post('/forgot-password', (0, validation_1.sensitiveOperationLimiter)(3), (0, validation_1.validateRequest)(validation_2.passwordResetSchema), authController_1.AuthController.forgotPassword);
router.post('/reset-password', (0, validation_1.sensitiveOperationLimiter)(5), authController_1.AuthController.resetPassword);
router.post('/change-password', (0, validation_1.sensitiveOperationLimiter)(3), auth_1.authenticateToken, (0, validation_1.validateRequest)(validation_2.passwordUpdateSchema), authController_1.AuthController.changePassword);
router.get('/me', auth_1.authenticateToken, authController_1.AuthController.getCurrentUser);
exports.default = router;
//# sourceMappingURL=auth.js.map