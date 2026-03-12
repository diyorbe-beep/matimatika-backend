import { Router } from 'express';
import { UserController } from '../controllers/userController';
// import { authenticateToken } from '../middleware/auth'; // Disabled for mock mode

const router = Router();

// Get user by ID
router.get('/:userId', UserController.getUser);

// Update user by ID
router.put('/:userId', UserController.updateUser);

// Get all users (for leaderboard)
router.get('/', UserController.getAllUsers);

export default router;
