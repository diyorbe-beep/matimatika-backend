import { Router } from 'express';
import { MockQuestionsController } from '../controllers/mockQuestionsController';

const router = Router();

// Get questions for specific module and lesson
router.get('/:moduleId/:lessonIndex', MockQuestionsController.getLessonQuestions);

// Get all questions (for development)
router.get('/', MockQuestionsController.getAllQuestions);

export default router;
