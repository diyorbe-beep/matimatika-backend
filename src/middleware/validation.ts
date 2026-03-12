import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserRole, GradeLevel, DifficultyLevel, QuestionType, AchievementRarity, ShopItemType } from '../types';
import { logSecurityEvent } from '../utils/logger';

export const validateRequest = (schema: z.ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
      schema.parse(data);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logSecurityEvent('Validation failed', {
          path: req.path,
          method: req.method,
          errors: validationErrors,
          ip: req.ip,
        });

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors,
          timestamp: new Date().toISOString(),
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        timestamp: new Date().toISOString(),
      });
    }
  };
};

// Sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (str: string): string => {
    return str
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);

  next();
};

// Rate limiting for sensitive operations
export const sensitiveOperationLimiter = (maxPerHour: number = 5) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}-${req.path}`;
    const now = Date.now();
    const record = attempts.get(key);

    if (!record || now > record.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + 3600000 }); // 1 hour
      return next();
    }

    if (record.count >= maxPerHour) {
      logSecurityEvent('Rate limit exceeded for sensitive operation', {
        ip: req.ip,
        path: req.path,
        attempts: record.count,
      });
      return res.status(429).json({
        success: false,
        error: 'Too many attempts. Please try again later.',
        timestamp: new Date().toISOString(),
      });
    }

    record.count++;
    next();
  };
};

// Validation schemas
export const userRegistrationSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  role: z.nativeEnum(UserRole, { errorMap: () => ({ message: 'Invalid user role' }) }),
  grade_level: z.nativeEnum(GradeLevel).optional(),
  parent_id: z.string().uuid().optional(),
  avatar_url: z.string().url().optional(),
});

export const userLoginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password must be less than 128 characters'),
});

export const passwordResetSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
});

export const passwordUpdateSchema = z.object({
  current_password: z.string()
    .min(1, 'Current password is required'),
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
});

export const userProfileUpdateSchema = z.object({
  display_name: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(100, 'Display name must be less than 100 characters')
    .optional(),
  grade_level: z.nativeEnum(GradeLevel).optional(),
  avatar_url: z.string().url().optional(),
});

export const quizSubmissionSchema = z.object({
  lesson_id: z.string().uuid('Invalid lesson ID'),
  answers: z.array(z.object({
    question_id: z.string().uuid('Invalid question ID'),
    answer: z.string().min(1, 'Answer is required'),
    time_spent: z.number().int().min(0, 'Time spent must be positive'),
  })).min(1, 'At least one answer is required'),
  total_time: z.number().int().min(0, 'Total time must be positive'),
});

export const questionCreationSchema = z.object({
  lesson_id: z.string().uuid('Invalid lesson ID'),
  question_text: z.string()
    .min(10, 'Question text must be at least 10 characters')
    .max(1000, 'Question text must be less than 1000 characters'),
  question_type: z.nativeEnum(QuestionType, { errorMap: () => ({ message: 'Invalid question type' }) }),
  correct_answer: z.string()
    .min(1, 'Correct answer is required')
    .max(500, 'Correct answer must be less than 500 characters'),
  options: z.array(z.string().max(500)).optional(),
  difficulty: z.nativeEnum(DifficultyLevel, { errorMap: () => ({ message: 'Invalid difficulty level' }) }),
});

export const moduleCreationSchema = z.object({
  name: z.string()
    .min(3, 'Module name must be at least 3 characters')
    .max(100, 'Module name must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  world_id: z.number().int().min(1, 'World ID must be positive'),
  module_order: z.number().int().min(1, 'Module order must be positive'),
  required_level: z.number().int().min(1, 'Required level must be positive'),
});

export const lessonCreationSchema = z.object({
  module_id: z.string().uuid('Invalid module ID'),
  title: z.string()
    .min(5, 'Lesson title must be at least 5 characters')
    .max(200, 'Lesson title must be less than 200 characters'),
  lesson_order: z.number().int().min(1, 'Lesson order must be positive'),
  difficulty_level: z.nativeEnum(DifficultyLevel, { errorMap: () => ({ message: 'Invalid difficulty level' }) }),
});

export const achievementCreationSchema = z.object({
  name: z.string()
    .min(3, 'Achievement name must be at least 3 characters')
    .max(100, 'Achievement name must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  icon: z.string()
    .min(1, 'Icon is required')
    .max(100, 'Icon must be less than 100 characters'),
  rarity: z.nativeEnum(AchievementRarity, { errorMap: () => ({ message: 'Invalid rarity' }) }),
  requirement_type: z.enum(['xp_threshold', 'streak', 'perfect_score', 'lessons_completed', 'time_spent']),
  requirement_value: z.number().int().min(1, 'Requirement value must be positive'),
});

export const shopItemCreationSchema = z.object({
  name: z.string()
    .min(3, 'Item name must be at least 3 characters')
    .max(100, 'Item name must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  item_type: z.nativeEnum(ShopItemType, { errorMap: () => ({ message: 'Invalid item type' }) }),
  price: z.number().int().min(0, 'Price must be non-negative'),
  rarity: z.nativeEnum(AchievementRarity, { errorMap: () => ({ message: 'Invalid rarity' }) }),
});

export const purchaseSchema = z.object({
  shop_item_id: z.string().uuid('Invalid shop item ID'),
});

export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(
    z.number().int().min(1, 'Page must be positive').default(1)
  ).optional(),
  limit: z.string().transform(Number).pipe(
    z.number().int().min(1, 'Limit must be positive').max(100, 'Limit cannot exceed 100').default(20)
  ).optional(),
});

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// Validation for query parameters
export const leaderboardQuerySchema = z.object({
  league: z.enum(['bronze', 'silver', 'gold', 'diamond']).optional(),
  week_start: z.string().datetime().optional(),
  page: z.string().transform(Number).pipe(
    z.number().int().min(1).default(1)
  ).optional(),
  limit: z.string().transform(Number).pipe(
    z.number().int().min(1).max(50).default(10)
  ).optional(),
});

export const progressQuerySchema = z.object({
  user_id: z.string().uuid().optional(),
  module_id: z.string().uuid().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
  page: z.string().transform(Number).pipe(
    z.number().int().min(1).default(1)
  ).optional(),
  limit: z.string().transform(Number).pipe(
    z.number().int().min(1).max(50).default(20)
  ).optional(),
});
