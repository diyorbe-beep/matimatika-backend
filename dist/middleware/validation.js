"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressQuerySchema = exports.leaderboardQuerySchema = exports.uuidParamSchema = exports.paginationSchema = exports.purchaseSchema = exports.shopItemCreationSchema = exports.achievementCreationSchema = exports.lessonCreationSchema = exports.moduleCreationSchema = exports.questionCreationSchema = exports.quizSubmissionSchema = exports.userProfileUpdateSchema = exports.passwordUpdateSchema = exports.passwordResetSchema = exports.userLoginSchema = exports.userRegistrationSchema = exports.sensitiveOperationLimiter = exports.sanitizeInput = exports.validateRequest = void 0;
const zod_1 = require("zod");
const types_1 = require("../types");
const logger_1 = require("../utils/logger");
const validateRequest = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
            schema.parse(data);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const validationErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code,
                }));
                (0, logger_1.logSecurityEvent)('Validation failed', {
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
exports.validateRequest = validateRequest;
const sanitizeInput = (req, res, next) => {
    const sanitizeString = (str) => {
        return str
            .trim()
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    };
    const sanitizeObject = (obj) => {
        if (typeof obj === 'string') {
            return sanitizeString(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }
        if (obj && typeof obj === 'object') {
            const sanitized = {};
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
exports.sanitizeInput = sanitizeInput;
const sensitiveOperationLimiter = (maxPerHour = 5) => {
    const attempts = new Map();
    return (req, res, next) => {
        const key = `${req.ip}-${req.path}`;
        const now = Date.now();
        const record = attempts.get(key);
        if (!record || now > record.resetTime) {
            attempts.set(key, { count: 1, resetTime: now + 3600000 });
            return next();
        }
        if (record.count >= maxPerHour) {
            (0, logger_1.logSecurityEvent)('Rate limit exceeded for sensitive operation', {
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
exports.sensitiveOperationLimiter = sensitiveOperationLimiter;
exports.userRegistrationSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must be less than 50 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
    email: zod_1.z.string()
        .email('Invalid email format')
        .max(255, 'Email must be less than 255 characters'),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must be less than 128 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    role: zod_1.z.nativeEnum(types_1.UserRole, { errorMap: () => ({ message: 'Invalid user role' }) }),
    grade_level: zod_1.z.nativeEnum(types_1.GradeLevel).optional(),
    parent_id: zod_1.z.string().uuid().optional(),
    avatar_url: zod_1.z.string().url().optional(),
});
exports.userLoginSchema = zod_1.z.object({
    email: zod_1.z.string()
        .email('Invalid email format')
        .max(255, 'Email must be less than 255 characters'),
    password: zod_1.z.string()
        .min(1, 'Password is required')
        .max(128, 'Password must be less than 128 characters'),
});
exports.passwordResetSchema = zod_1.z.object({
    email: zod_1.z.string()
        .email('Invalid email format')
        .max(255, 'Email must be less than 255 characters'),
});
exports.passwordUpdateSchema = zod_1.z.object({
    current_password: zod_1.z.string()
        .min(1, 'Current password is required'),
    new_password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must be less than 128 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
});
exports.userProfileUpdateSchema = zod_1.z.object({
    display_name: zod_1.z.string()
        .min(2, 'Display name must be at least 2 characters')
        .max(100, 'Display name must be less than 100 characters')
        .optional(),
    grade_level: zod_1.z.nativeEnum(types_1.GradeLevel).optional(),
    avatar_url: zod_1.z.string().url().optional(),
});
exports.quizSubmissionSchema = zod_1.z.object({
    lesson_id: zod_1.z.string().uuid('Invalid lesson ID'),
    answers: zod_1.z.array(zod_1.z.object({
        question_id: zod_1.z.string().uuid('Invalid question ID'),
        answer: zod_1.z.string().min(1, 'Answer is required'),
        time_spent: zod_1.z.number().int().min(0, 'Time spent must be positive'),
    })).min(1, 'At least one answer is required'),
    total_time: zod_1.z.number().int().min(0, 'Total time must be positive'),
});
exports.questionCreationSchema = zod_1.z.object({
    lesson_id: zod_1.z.string().uuid('Invalid lesson ID'),
    question_text: zod_1.z.string()
        .min(10, 'Question text must be at least 10 characters')
        .max(1000, 'Question text must be less than 1000 characters'),
    question_type: zod_1.z.nativeEnum(types_1.QuestionType, { errorMap: () => ({ message: 'Invalid question type' }) }),
    correct_answer: zod_1.z.string()
        .min(1, 'Correct answer is required')
        .max(500, 'Correct answer must be less than 500 characters'),
    options: zod_1.z.array(zod_1.z.string().max(500)).optional(),
    difficulty: zod_1.z.nativeEnum(types_1.DifficultyLevel, { errorMap: () => ({ message: 'Invalid difficulty level' }) }),
});
exports.moduleCreationSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(3, 'Module name must be at least 3 characters')
        .max(100, 'Module name must be less than 100 characters'),
    description: zod_1.z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description must be less than 1000 characters'),
    world_id: zod_1.z.number().int().min(1, 'World ID must be positive'),
    module_order: zod_1.z.number().int().min(1, 'Module order must be positive'),
    required_level: zod_1.z.number().int().min(1, 'Required level must be positive'),
});
exports.lessonCreationSchema = zod_1.z.object({
    module_id: zod_1.z.string().uuid('Invalid module ID'),
    title: zod_1.z.string()
        .min(5, 'Lesson title must be at least 5 characters')
        .max(200, 'Lesson title must be less than 200 characters'),
    lesson_order: zod_1.z.number().int().min(1, 'Lesson order must be positive'),
    difficulty_level: zod_1.z.nativeEnum(types_1.DifficultyLevel, { errorMap: () => ({ message: 'Invalid difficulty level' }) }),
});
exports.achievementCreationSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(3, 'Achievement name must be at least 3 characters')
        .max(100, 'Achievement name must be less than 100 characters'),
    description: zod_1.z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(500, 'Description must be less than 500 characters'),
    icon: zod_1.z.string()
        .min(1, 'Icon is required')
        .max(100, 'Icon must be less than 100 characters'),
    rarity: zod_1.z.nativeEnum(types_1.AchievementRarity, { errorMap: () => ({ message: 'Invalid rarity' }) }),
    requirement_type: zod_1.z.enum(['xp_threshold', 'streak', 'perfect_score', 'lessons_completed', 'time_spent']),
    requirement_value: zod_1.z.number().int().min(1, 'Requirement value must be positive'),
});
exports.shopItemCreationSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(3, 'Item name must be at least 3 characters')
        .max(100, 'Item name must be less than 100 characters'),
    description: zod_1.z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description must be less than 1000 characters'),
    item_type: zod_1.z.nativeEnum(types_1.ShopItemType, { errorMap: () => ({ message: 'Invalid item type' }) }),
    price: zod_1.z.number().int().min(0, 'Price must be non-negative'),
    rarity: zod_1.z.nativeEnum(types_1.AchievementRarity, { errorMap: () => ({ message: 'Invalid rarity' }) }),
});
exports.purchaseSchema = zod_1.z.object({
    shop_item_id: zod_1.z.string().uuid('Invalid shop item ID'),
});
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1, 'Page must be positive').default(1)).optional(),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1, 'Limit must be positive').max(100, 'Limit cannot exceed 100').default(20)).optional(),
});
exports.uuidParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid('Invalid ID format'),
});
exports.leaderboardQuerySchema = zod_1.z.object({
    league: zod_1.z.enum(['bronze', 'silver', 'gold', 'diamond']).optional(),
    week_start: zod_1.z.string().datetime().optional(),
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).default(1)).optional(),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(50).default(10)).optional(),
});
exports.progressQuerySchema = zod_1.z.object({
    user_id: zod_1.z.string().uuid().optional(),
    module_id: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(['not_started', 'in_progress', 'completed']).optional(),
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).default(1)).optional(),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().int().min(1).max(50).default(20)).optional(),
});
//# sourceMappingURL=validation.js.map