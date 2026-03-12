import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserRole, GradeLevel, DifficultyLevel, QuestionType, AchievementRarity, ShopItemType } from '../types';
export declare const validateRequest: (schema: z.ZodSchema, source?: "body" | "query" | "params") => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const sanitizeInput: (req: Request, res: Response, next: NextFunction) => void;
export declare const sensitiveOperationLimiter: (maxPerHour?: number) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare const userRegistrationSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodNativeEnum<typeof UserRole>;
    grade_level: z.ZodOptional<z.ZodNativeEnum<typeof GradeLevel>>;
    parent_id: z.ZodOptional<z.ZodString>;
    avatar_url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    grade_level?: GradeLevel | undefined;
    parent_id?: string | undefined;
    avatar_url?: string | undefined;
}, {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    grade_level?: GradeLevel | undefined;
    parent_id?: string | undefined;
    avatar_url?: string | undefined;
}>;
export declare const userLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const passwordResetSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const passwordUpdateSchema: z.ZodObject<{
    current_password: z.ZodString;
    new_password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    current_password: string;
    new_password: string;
}, {
    current_password: string;
    new_password: string;
}>;
export declare const userProfileUpdateSchema: z.ZodObject<{
    display_name: z.ZodOptional<z.ZodString>;
    grade_level: z.ZodOptional<z.ZodNativeEnum<typeof GradeLevel>>;
    avatar_url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    grade_level?: GradeLevel | undefined;
    avatar_url?: string | undefined;
    display_name?: string | undefined;
}, {
    grade_level?: GradeLevel | undefined;
    avatar_url?: string | undefined;
    display_name?: string | undefined;
}>;
export declare const quizSubmissionSchema: z.ZodObject<{
    lesson_id: z.ZodString;
    answers: z.ZodArray<z.ZodObject<{
        question_id: z.ZodString;
        answer: z.ZodString;
        time_spent: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        time_spent: number;
        question_id: string;
        answer: string;
    }, {
        time_spent: number;
        question_id: string;
        answer: string;
    }>, "many">;
    total_time: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    lesson_id: string;
    answers: {
        time_spent: number;
        question_id: string;
        answer: string;
    }[];
    total_time: number;
}, {
    lesson_id: string;
    answers: {
        time_spent: number;
        question_id: string;
        answer: string;
    }[];
    total_time: number;
}>;
export declare const questionCreationSchema: z.ZodObject<{
    lesson_id: z.ZodString;
    question_text: z.ZodString;
    question_type: z.ZodNativeEnum<typeof QuestionType>;
    correct_answer: z.ZodString;
    options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    difficulty: z.ZodNativeEnum<typeof DifficultyLevel>;
}, "strip", z.ZodTypeAny, {
    lesson_id: string;
    question_text: string;
    question_type: QuestionType;
    correct_answer: string;
    difficulty: DifficultyLevel;
    options?: string[] | undefined;
}, {
    lesson_id: string;
    question_text: string;
    question_type: QuestionType;
    correct_answer: string;
    difficulty: DifficultyLevel;
    options?: string[] | undefined;
}>;
export declare const moduleCreationSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    world_id: z.ZodNumber;
    module_order: z.ZodNumber;
    required_level: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    world_id: number;
    module_order: number;
    required_level: number;
}, {
    name: string;
    description: string;
    world_id: number;
    module_order: number;
    required_level: number;
}>;
export declare const lessonCreationSchema: z.ZodObject<{
    module_id: z.ZodString;
    title: z.ZodString;
    lesson_order: z.ZodNumber;
    difficulty_level: z.ZodNativeEnum<typeof DifficultyLevel>;
}, "strip", z.ZodTypeAny, {
    module_id: string;
    title: string;
    lesson_order: number;
    difficulty_level: DifficultyLevel;
}, {
    module_id: string;
    title: string;
    lesson_order: number;
    difficulty_level: DifficultyLevel;
}>;
export declare const achievementCreationSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    icon: z.ZodString;
    rarity: z.ZodNativeEnum<typeof AchievementRarity>;
    requirement_type: z.ZodEnum<["xp_threshold", "streak", "perfect_score", "lessons_completed", "time_spent"]>;
    requirement_value: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    icon: string;
    rarity: AchievementRarity;
    requirement_type: "xp_threshold" | "streak" | "perfect_score" | "lessons_completed" | "time_spent";
    requirement_value: number;
}, {
    name: string;
    description: string;
    icon: string;
    rarity: AchievementRarity;
    requirement_type: "xp_threshold" | "streak" | "perfect_score" | "lessons_completed" | "time_spent";
    requirement_value: number;
}>;
export declare const shopItemCreationSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    item_type: z.ZodNativeEnum<typeof ShopItemType>;
    price: z.ZodNumber;
    rarity: z.ZodNativeEnum<typeof AchievementRarity>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    rarity: AchievementRarity;
    item_type: ShopItemType;
    price: number;
}, {
    name: string;
    description: string;
    rarity: AchievementRarity;
    item_type: ShopItemType;
    price: number;
}>;
export declare const purchaseSchema: z.ZodObject<{
    shop_item_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    shop_item_id: string;
}, {
    shop_item_id: string;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodDefault<z.ZodNumber>>>;
    limit: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodDefault<z.ZodNumber>>>;
}, "strip", z.ZodTypeAny, {
    page?: number | undefined;
    limit?: number | undefined;
}, {
    page?: string | undefined;
    limit?: string | undefined;
}>;
export declare const uuidParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const leaderboardQuerySchema: z.ZodObject<{
    league: z.ZodOptional<z.ZodEnum<["bronze", "silver", "gold", "diamond"]>>;
    week_start: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodDefault<z.ZodNumber>>>;
    limit: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodDefault<z.ZodNumber>>>;
}, "strip", z.ZodTypeAny, {
    page?: number | undefined;
    limit?: number | undefined;
    league?: "bronze" | "silver" | "gold" | "diamond" | undefined;
    week_start?: string | undefined;
}, {
    page?: string | undefined;
    limit?: string | undefined;
    league?: "bronze" | "silver" | "gold" | "diamond" | undefined;
    week_start?: string | undefined;
}>;
export declare const progressQuerySchema: z.ZodObject<{
    user_id: z.ZodOptional<z.ZodString>;
    module_id: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["not_started", "in_progress", "completed"]>>;
    page: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodDefault<z.ZodNumber>>>;
    limit: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodDefault<z.ZodNumber>>>;
}, "strip", z.ZodTypeAny, {
    status?: "not_started" | "in_progress" | "completed" | undefined;
    module_id?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    user_id?: string | undefined;
}, {
    status?: "not_started" | "in_progress" | "completed" | undefined;
    module_id?: string | undefined;
    page?: string | undefined;
    limit?: string | undefined;
    user_id?: string | undefined;
}>;
//# sourceMappingURL=validation.d.ts.map