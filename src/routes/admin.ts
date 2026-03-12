import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { UserRole } from '../types';
import { 
  uuidParamSchema,
  paginationSchema 
} from '../middleware/validation';

const router = Router();

// All admin routes require admin authentication
router.use(authenticateToken);
router.use(requireRole([UserRole.ADMIN]));

// User management
router.get('/users', 
  validateRequest(paginationSchema, 'query'),
  AdminController.getAllUsers
);

router.get('/users/:id', 
  validateRequest(uuidParamSchema, 'params'),
  AdminController.getUserById
);

router.put('/users/:id', 
  validateRequest(uuidParamSchema, 'params'),
  AdminController.updateUser
);

router.delete('/users/:id', 
  validateRequest(uuidParamSchema, 'params'),
  AdminController.deleteUser
);

router.post('/users/:id/ban', 
  validateRequest(uuidParamSchema, 'params'),
  AdminController.banUser
);

router.post('/users/:id/unban', 
  validateRequest(uuidParamSchema, 'params'),
  AdminController.unbanUser
);

// System statistics
router.get('/stats', AdminController.getSystemStats);

router.get('/stats/users', AdminController.getUserStats);

router.get('/stats/learning', AdminController.getLearningStats);

router.get('/stats/gamification', AdminController.getGamificationStats);

router.get('/stats/revenue', AdminController.getRevenueStats);

// Content management
router.get('/content/modules', 
  validateRequest(paginationSchema, 'query'),
  AdminController.getAllModules
);

router.get('/content/lessons', 
  validateRequest(paginationSchema, 'query'),
  AdminController.getAllLessons
);

router.get('/content/questions', 
  validateRequest(paginationSchema, 'query'),
  AdminController.getAllQuestions
);

// System health and monitoring
router.get('/health', AdminController.getSystemHealth);

router.get('/logs', 
  validateRequest(paginationSchema, 'query'),
  AdminController.getSystemLogs
);

// Database management
router.post('/database/backup', AdminController.createDatabaseBackup);

router.post('/database/restore', AdminController.restoreDatabase);

router.get('/database/stats', AdminController.getDatabaseStats);

// Analytics and reports
router.get('/analytics/user-activity', AdminController.getUserActivityAnalytics);

router.get('/analytics/learning-progress', AdminController.getLearningProgressAnalytics);

router.get('/analytics/revenue', AdminController.getRevenueAnalytics);

router.get('/analytics/export', AdminController.exportAnalytics);

// Settings management
router.get('/settings', AdminController.getSystemSettings);

router.put('/settings', AdminController.updateSystemSettings);

// Notification management
router.post('/notifications/broadcast', AdminController.broadcastNotification);

router.get('/notifications', 
  validateRequest(paginationSchema, 'query'),
  AdminController.getAllNotifications
);

// Security and audit
router.get('/security/audit-log', 
  validateRequest(paginationSchema, 'query'),
  AdminController.getAuditLog
);

router.get('/security/suspicious-activity', AdminController.getSuspiciousActivity);

router.post('/security/lock-user/:id', 
  validateRequest(uuidParamSchema, 'params'),
  AdminController.lockUserAccount
);

export default router;
