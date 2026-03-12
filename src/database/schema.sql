-- MathQuest Academy Database Schema
-- Production-ready PostgreSQL schema with proper indexing and constraints

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('student', 'parent', 'admin');
CREATE TYPE grade_level AS ENUM (3, 4, 5, 6);
CREATE TYPE difficulty_level AS ENUM (1, 2, 3, 4, 5);
CREATE TYPE question_type AS ENUM ('multiple_choice', 'drag_drop', 'input', 'true_false');
CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE achievement_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
CREATE TYPE achievement_requirement_type AS ENUM ('xp_threshold', 'streak', 'perfect_score', 'lessons_completed', 'time_spent');
CREATE TYPE league AS ENUM ('bronze', 'silver', 'gold', 'diamond');
CREATE TYPE shop_item_type AS ENUM ('avatar', 'accessory', 'background', 'effect');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_banned BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    grade_level grade_level,
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
    hearts INTEGER DEFAULT 5 CHECK (hearts >= 0 AND hearts <= 5),
    last_heart_refill TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parent_id UUID REFERENCES users(id),
    currency INTEGER DEFAULT 0 CHECK (currency >= 0),
    current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
    best_streak INTEGER DEFAULT 0 CHECK (best_streak >= 0),
    total_time_spent INTEGER DEFAULT 0 CHECK (total_time_spent >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modules table
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    world_id INTEGER NOT NULL CHECK (world_id > 0),
    module_order INTEGER NOT NULL CHECK (module_order > 0),
    required_level INTEGER DEFAULT 1 CHECK (required_level >= 1),
    is_locked BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(world_id, module_order)
);

-- Lessons table
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    lesson_order INTEGER NOT NULL CHECK (lesson_order > 0),
    difficulty_level difficulty_level NOT NULL,
    estimated_time INTEGER CHECK (estimated_time > 0), -- in minutes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(module_id, lesson_order)
);

-- Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    correct_answer TEXT NOT NULL,
    options JSONB, -- For multiple choice questions
    difficulty difficulty_level NOT NULL,
    points INTEGER DEFAULT 10 CHECK (points > 0),
    explanation TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User progress table
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status progress_status DEFAULT 'not_started',
    score INTEGER DEFAULT 0 CHECK (score >= 0),
    attempts INTEGER DEFAULT 0 CHECK (attempts >= 0),
    best_score INTEGER DEFAULT 0 CHECK (best_score >= 0),
    time_spent INTEGER DEFAULT 0 CHECK (time_spent >= 0), -- in seconds
    completed_at TIMESTAMP,
    last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

-- Achievements table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(100) NOT NULL,
    rarity achievement_rarity NOT NULL,
    requirement_type achievement_requirement_type NOT NULL,
    requirement_value INTEGER NOT NULL CHECK (requirement_value > 0),
    reward_xp INTEGER DEFAULT 0 CHECK (reward_xp >= 0),
    reward_currency INTEGER DEFAULT 0 CHECK (reward_currency >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements table
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- Weekly leaderboard table
CREATE TABLE weekly_leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
    league league DEFAULT 'bronze',
    rank INTEGER CHECK (rank > 0),
    previous_rank INTEGER CHECK (previous_rank > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, week_start)
);

-- Shop items table
CREATE TABLE shop_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    item_type shop_item_type NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    rarity achievement_rarity NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_limited BOOLEAN DEFAULT false,
    limited_quantity INTEGER CHECK (limited_quantity > 0),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User purchases table
CREATE TABLE user_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shop_item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
    purchase_price INTEGER NOT NULL CHECK (purchase_price >= 0),
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_equipped BOOLEAN DEFAULT false,
    UNIQUE(user_id, shop_item_id)
);

-- Learning sessions table (for tracking real-time sessions)
CREATE TABLE learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    questions_answered INTEGER DEFAULT 0 CHECK (questions_answered >= 0),
    correct_answers INTEGER DEFAULT 0 CHECK (correct_answers >= 0),
    xp_earned INTEGER DEFAULT 0 CHECK (xp_earned >= 0),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email verification tokens table
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_grade_level ON user_profiles(grade_level);
CREATE INDEX idx_user_profiles_parent_id ON user_profiles(parent_id);
CREATE INDEX idx_user_profiles_total_xp ON user_profiles(total_xp DESC);
CREATE INDEX idx_user_profiles_current_level ON user_profiles(current_level DESC);

CREATE INDEX idx_modules_world_id ON modules(world_id);
CREATE INDEX idx_modules_is_active ON modules(is_active);
CREATE INDEX idx_modules_module_order ON modules(module_order);

CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_lessons_difficulty_level ON lessons(difficulty_level);
CREATE INDEX idx_lessons_is_active ON lessons(is_active);
CREATE INDEX idx_lessons_lesson_order ON lessons(lesson_order);

CREATE INDEX idx_questions_lesson_id ON questions(lesson_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_question_type ON questions(question_type);
CREATE INDEX idx_questions_is_active ON questions(is_active);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);
CREATE INDEX idx_user_progress_completed_at ON user_progress(completed_at DESC);
CREATE INDEX idx_user_progress_best_score ON user_progress(best_score DESC);

CREATE INDEX idx_achievements_rarity ON achievements(rarity);
CREATE INDEX idx_achievements_requirement_type ON achievements(requirement_type);
CREATE INDEX idx_achievements_is_active ON achievements(is_active);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_earned_at ON user_achievements(earned_at DESC);

CREATE INDEX idx_weekly_leaderboard_user_id ON weekly_leaderboard(user_id);
CREATE INDEX idx_weekly_leaderboard_week_start ON weekly_leaderboard(week_start);
CREATE INDEX idx_weekly_leaderboard_xp_earned ON weekly_leaderboard(xp_earned DESC);
CREATE INDEX idx_weekly_leaderboard_rank ON weekly_leaderboard(rank);
CREATE INDEX idx_weekly_leaderboard_league ON weekly_leaderboard(league);

CREATE INDEX idx_shop_items_item_type ON shop_items(item_type);
CREATE INDEX idx_shop_items_rarity ON shop_items(rarity);
CREATE INDEX idx_shop_items_is_active ON shop_items(is_active);
CREATE INDEX idx_shop_items_price ON shop_items(price);

CREATE INDEX idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX idx_user_purchases_shop_item_id ON user_purchases(shop_item_id);
CREATE INDEX idx_user_purchases_purchased_at ON user_purchases(purchased_at DESC);

CREATE INDEX idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_lesson_id ON learning_sessions(lesson_id);
CREATE INDEX idx_learning_sessions_start_time ON learning_sessions(start_time DESC);
CREATE INDEX idx_learning_sessions_status ON learning_sessions(status);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_resource_type ON audit_log(resource_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_leaderboard_updated_at BEFORE UPDATE ON weekly_leaderboard
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_items_updated_at BEFORE UPDATE ON shop_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_sessions_updated_at BEFORE UPDATE ON learning_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
