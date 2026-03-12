import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest, sensitiveOperationLimiter } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { 
  userRegistrationSchema, 
  userLoginSchema, 
  passwordResetSchema, 
  passwordUpdateSchema 
} from '../middleware/validation';

const router = Router();

// Register new user
router.post('/register', 
  sensitiveOperationLimiter(3), // Max 3 registrations per hour per IP
  validateRequest(userRegistrationSchema), 
  AuthController.register
);

// Login user
router.post('/login', 
  sensitiveOperationLimiter(10), // Max 10 login attempts per hour per IP
  validateRequest(userLoginSchema), 
  AuthController.login
);

// Refresh access token
router.post('/refresh', AuthController.refreshToken);

// Logout user
router.post('/logout', authenticateToken, AuthController.logout);

// Verify token validity
router.get('/verify', authenticateToken, AuthController.verifyToken);

// Request password reset
router.post('/forgot-password', 
  sensitiveOperationLimiter(3),
  validateRequest(passwordResetSchema), 
  AuthController.forgotPassword
);

// Reset password with token
router.post('/reset-password', 
  sensitiveOperationLimiter(5),
  AuthController.resetPassword
);

// Change password (requires authentication)
router.post('/change-password', 
  sensitiveOperationLimiter(3),
  authenticateToken, 
  validateRequest(passwordUpdateSchema),
  AuthController.changePassword
);

// Get current user info
router.get('/me', authenticateToken, AuthController.getCurrentUser);

export default router;
