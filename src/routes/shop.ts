import { Router } from 'express';
import { ShopController } from '../controllers/shopController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { validateRequest, sensitiveOperationLimiter } from '../middleware/validation';
import { UserRole } from '../types';
import { 
  uuidParamSchema,
  paginationSchema,
  purchaseSchema,
  shopItemCreationSchema 
} from '../middleware/validation';

const router = Router();

// Get all shop items (public)
router.get('/items', 
  validateRequest(paginationSchema, 'query'),
  ShopController.getShopItems
);

// Get specific shop item (public)
router.get('/items/:id', 
  validateRequest(uuidParamSchema, 'params'),
  ShopController.getShopItem
);

// Get user's purchases (requires authentication)
router.get('/purchases/:userId?', 
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  validateRequest(paginationSchema, 'query'),
  ShopController.getUserPurchases
);

// Get user's currency balance (requires authentication)
router.get('/currency/:userId?', 
  authenticateToken,
  validateRequest(uuidParamSchema, 'params'),
  ShopController.getUserCurrency
);

// Purchase shop item (requires authentication)
router.post('/purchase', 
  authenticateToken,
  sensitiveOperationLimiter(10), // Max 10 purchases per hour
  validateRequest(purchaseSchema),
  ShopController.purchaseItem
);

// Create new shop item (admin only)
router.post('/items', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  validateRequest(shopItemCreationSchema),
  ShopController.createShopItem
);

// Update shop item (admin only)
router.put('/items/:id', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  validateRequest(uuidParamSchema, 'params'),
  ShopController.updateShopItem
);

// Delete shop item (admin only)
router.delete('/items/:id', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  validateRequest(uuidParamSchema, 'params'),
  ShopController.deleteShopItem
);

// Award currency to user (admin only)
router.post('/currency/award', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  ShopController.awardCurrency
);

// Deduct currency from user (admin only)
router.post('/currency/deduct', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  ShopController.deductCurrency
);

// Get shop analytics (admin only)
router.get('/analytics', 
  authenticateToken,
  requireRole([UserRole.ADMIN]),
  ShopController.getShopAnalytics
);

// Get popular items (public)
router.get('/popular', 
  validateRequest(paginationSchema, 'query'),
  ShopController.getPopularItems
);

// Get items by category (public)
router.get('/category/:category', 
  validateRequest(paginationSchema, 'query'),
  ShopController.getItemsByCategory
);

// Get featured items (public)
router.get('/featured', 
  ShopController.getFeaturedItems
);

export default router;
