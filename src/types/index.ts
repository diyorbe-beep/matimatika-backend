export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  user_id: string;
  display_name: string;
  grade_level: GradeLevel;
  total_xp: number;
  current_level: number;
  hearts: number;
  last_heart_refill: Date;
  parent_id?: string;
  currency: number;
  created_at: Date;
  updated_at: Date;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  world_id: number;
  module_order: number;
  required_level: number;
  is_locked: boolean;
  created_at: Date;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  lesson_order: number;
  difficulty_level: DifficultyLevel;
  created_at: Date;
}

export interface Question {
  id: string;
  lesson_id: string;
  question_text: string;
  question_type: QuestionType;
  correct_answer: string;
  options?: string[];
  difficulty: DifficultyLevel;
  created_at: Date;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: ProgressStatus;
  score: number;
  attempts: number;
  best_score: number;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  requirement_type: AchievementRequirementType;
  requirement_value: number;
  created_at: Date;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: Date;
}

export interface WeeklyLeaderboard {
  id: string;
  user_id: string;
  week_start: Date;
  xp_earned: number;
  league: League;
  rank: number;
  created_at: Date;
  updated_at: Date;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  item_type: ShopItemType;
  price: number;
  rarity: AchievementRarity;
  is_active: boolean;
  created_at: Date;
}

export interface UserPurchase {
  id: string;
  user_id: string;
  shop_item_id: string;
  purchased_at: Date;
}

// Enums
export enum UserRole {
  STUDENT = 'student',
  PARENT = 'parent',
  ADMIN = 'admin',
}

export enum GradeLevel {
  GRADE_3 = 3,
  GRADE_4 = 4,
  GRADE_5 = 5,
  GRADE_6 = 6,
}

export enum DifficultyLevel {
  VERY_EASY = 1,
  EASY = 2,
  MEDIUM = 3,
  HARD = 4,
  VERY_HARD = 5,
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  DRAG_DROP = 'drag_drop',
  INPUT = 'input',
  TRUE_FALSE = 'true_false',
}

export enum ProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

export enum AchievementRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

export enum AchievementRequirementType {
  XP_THRESHOLD = 'xp_threshold',
  STREAK = 'streak',
  PERFECT_SCORE = 'perfect_score',
  LESSONS_COMPLETED = 'lessons_completed',
  TIME_SPENT = 'time_spent',
}

export enum League {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  DIAMOND = 'diamond',
}

export enum ShopItemType {
  AVATAR = 'avatar',
  ACCESSORY = 'accessory',
  BACKGROUND = 'background',
  EFFECT = 'effect',
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  grade_level?: GradeLevel;
  parent_id?: string;
}

export interface QuizSubmission {
  lesson_id: string;
  answers: Array<{
    question_id: string;
    answer: string;
    time_spent: number;
  }>;
  total_time: number;
}

export interface QuizResult {
  score: number;
  total_questions: number;
  correct_answers: number;
  xp_earned: number;
  hearts_lost: number;
  new_level?: number;
  achievements_earned: Achievement[];
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url?: string;
  xp_earned: number;
  rank: number;
  league: League;
  previous_rank?: number;
}

export interface UserStats {
  total_xp: number;
  current_level: number;
  lessons_completed: number;
  total_time_spent: number;
  average_score: number;
  current_streak: number;
  best_streak: number;
  achievements_count: number;
  hearts_remaining: number;
  currency: number;
}

export interface ProgressData {
  module: Module;
  lessons_completed: number;
  total_lessons: number;
  average_score: number;
  status: ProgressStatus;
  locked: boolean;
}

export interface LearningSession {
  id: string;
  user_id: string;
  lesson_id: string;
  start_time: Date;
  end_time?: Date;
  questions_answered: number;
  correct_answers: number;
  score: number;
  xp_earned: number;
  status: 'active' | 'completed' | 'abandoned';
}
