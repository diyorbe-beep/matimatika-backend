import { Router } from 'express';
import { LearningController } from '../controllers/learningController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { UserRole } from '../types';
import { 
  moduleCreationSchema, 
  lessonCreationSchema, 
  questionCreationSchema,
  uuidParamSchema,
  paginationSchema 
} from '../middleware/validation';

const router = Router();

// Get all modules (public)
router.get('/modules', 
  validateRequest(paginationSchema, 'query'),
  LearningController.getModules
);

// Get specific module (public)
router.get('/modules/:id', 
  validateRequest(uuidParamSchema, 'params'),
  LearningController.getModule
);

// Get lessons for a module (public)
router.get('/modules/:id/lessons', 
  validateRequest(uuidParamSchema, 'params'),
  validateRequest(paginationSchema, 'query'),
  LearningController.getModuleLessons
);

// Get specific lesson (public)
router.get('/lessons/:id', 
  validateRequest(uuidParamSchema, 'params'),
  LearningController.getLesson
);

// Get questions for a lesson (requires authentication)
router.get('/lessons/:id/questions', 
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  LearningController.getLessonQuestions
);

// Submit quiz answers (requires authentication)
router.post('/lessons/:id/submit', 
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  LearningController.submitQuiz
);

// Create new module (admin only)
router.post('/modules', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  validateRequest(moduleCreationSchema),
  LearningController.createModule
);

// Update module (admin only)
router.put('/modules/:id', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  validateRequest(uuidParamSchema, 'params'),
  LearningController.updateModule
);

// Delete module (admin only)
router.delete('/modules/:id', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  validateRequest(uuidParamSchema, 'params'),
  LearningController.deleteModule
);

// Create new lesson (admin only)
router.post('/lessons', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  validateRequest(lessonCreationSchema),
  LearningController.createLesson
);

// Update lesson (admin only)
router.put('/lessons/:id', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  validateRequest(uuidParamSchema, 'params'),
  LearningController.updateLesson
);

// Delete lesson (admin only)
router.delete('/lessons/:id', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  validateRequest(uuidParamSchema, 'params'),
  LearningController.deleteLesson
);

// Create new question (admin only)
router.post('/questions', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  validateRequest(questionCreationSchema),
  LearningController.createQuestion
);

// Update question (admin only)
router.put('/questions/:id', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  validateRequest(uuidParamSchema, 'params'),
  LearningController.updateQuestion
);

// Delete question (admin only)
router.delete('/questions/:id', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  validateRequest(uuidParamSchema, 'params'),
  LearningController.deleteQuestion
);

export default router;
