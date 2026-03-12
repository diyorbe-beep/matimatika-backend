-- Add module_progress column to users table
ALTER TABLE users 
ADD COLUMN module_progress JSONB DEFAULT '{
    "addition-subtraction": 0,
    "multiplication-division": 0,
    "advanced-math": 0,
    "geometry": 0,
    "fractions": 0
}'::jsonb;

-- Create index on module_progress for better query performance
CREATE INDEX idx_users_module_progress ON users USING GIN (module_progress);
