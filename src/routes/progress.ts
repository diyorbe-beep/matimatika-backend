import { Router } from 'express';
import { ProgressController } from '../controllers/progressController';
import { authenticateToken, requireRole, optionalAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { UserRole } from '../types';
import { 
  uuidParamSchema,
  paginationSchema,
  progressQuerySchema 
} from '../middleware/validation';

const router = Router();

// Get user progress (requires authentication)
router.get('/user/:userId', 
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  validateRequest(paginationSchema, 'query'),
  ProgressController.getUserProgress
);

// Get current user's progress (requires authentication)
router.get('/my', 
  authenticateToken,
  validateRequest(paginationSchema, 'query'),
  ProgressController.getMyProgress
);

// Get progress for specific lesson (requires authentication)
router.get('/lesson/:lessonId', 
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  ProgressController.getLessonProgress
);

// Mark lesson as completed (requires authentication)
router.post('/lesson/:lessonId/complete', 
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  ProgressController.completeLesson
);

// Get overall progress statistics (requires authentication)
router.get('/stats/:userId?', 
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  ProgressController.getProgressStats
);

// Get leaderboard (public, but enhanced for authenticated users)
router.get('/leaderboard', 
  optionalAuth,
  validateRequest(paginationSchema, 'query'),
  ProgressController.getLeaderboard
);

// Get weekly leaderboard (public, but enhanced for authenticated users)
router.get('/leaderboard/weekly', 
  optionalAuth,
  validateRequest(paginationSchema, 'query'),
  ProgressController.getWeeklyLeaderboard
);

// Get module progress overview (requires authentication)
router.get('/modules/:moduleId', 
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  ProgressController.getModuleProgress
);

// Get learning streak (requires authentication)
router.get('/streak', 
  authenticateToken,
  ProgressController.getLearningStreak
);

// Update progress (internal use, requires authentication)
router.put('/update', 
  authenticateToken,
  ProgressController.updateProgress
);

// Reset user progress (admin only, or user for their own data)
router.post('/reset/:userId', 
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  ProgressController.resetUserProgress
);

// Get progress analytics (admin only)
router.get('/analytics', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  validateRequest(progressQuerySchema, 'query'),
  ProgressController.getProgressAnalytics
);

export default router;
