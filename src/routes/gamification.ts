import { Router } from 'express';
import { GamificationController } from '../controllers/gamificationController';
import { authenticateToken, requireRole, optionalAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { UserRole } from '../types';
import { 
  uuidParamSchema,
  paginationSchema,
  leaderboardQuerySchema 
} from '../middleware/validation';

const router = Router();

// Get all achievements (public)
router.get('/achievements', 
  optionalAuth,
  validateRequest(paginationSchema, 'query'),
  GamificationController.getAchievements
);

// Get user's achievements (requires authentication)
router.get('/achievements/user/:userId?', 
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  validateRequest(paginationSchema, 'query'),
  GamificationController.getUserAchievements
);

// Unlock achievement (internal use, requires authentication)
router.post('/achievements/:id/unlock', 
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  GamificationController.unlockAchievement
);

// Get weekly leaderboard (public, but enhanced for authenticated users)
router.get('/leaderboard/weekly', 
  optionalAuth,
  validateRequest(leaderboardQuerySchema, 'query'),
  GamificationController.getWeeklyLeaderboard
);

// Get all-time leaderboard (public, but enhanced for authenticated users)
router.get('/leaderboard/all-time', 
  optionalAuth,
  validateRequest(leaderboardQuerySchema, 'query'),
  GamificationController.getAllTimeLeaderboard
);

// Get user's gamification stats (requires authentication)
router.get('/stats/:userId?', 
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  GamificationController.getUserStats
);

// Get user's level and XP (requires authentication)
router.get('/level/:userId?', 
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  GamificationController.getUserLevel
);

// Award XP to user (internal use, requires authentication)
router.post('/xp/award', 
  authenticateToken,
  GamificationController.awardXP
);

// Update user's league placement (internal use, admin only)
router.post('/league/update', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  GamificationController.updateLeague
);

// Get current league information (requires authentication)
router.get('/league/:userId?', 
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  GamificationController.getUserLeague
);

// Create new achievement (admin only)
router.post('/achievements', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  GamificationController.createAchievement
);

// Update achievement (admin only)
router.put('/achievements/:id', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  validateRequest(uuidParamSchema, 'params'),
  GamificationController.updateAchievement
);

// Delete achievement (admin only)
router.delete('/achievements/:id', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  validateRequest(uuidParamSchema, 'params'),
  GamificationController.deleteAchievement
);

// Get gamification analytics (admin only)
router.get('/analytics', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  GamificationController.getGamificationAnalytics
);

// Process weekly league updates (admin only)
router.post('/league/weekly-update', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  GamificationController.processWeeklyLeagueUpdate
);

export default router;
