import { pool } from '../src/config/database';

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.DB_NAME = 'mathquest_test';
});

// Global test teardown
afterAll(async () => {
  // Close database connection
  await pool.end();
});

// Clean up database before each test
beforeEach(async () => {
  try {
    await pool.query('BEGIN');
    
    // Clean up test data
    await pool.query('DELETE FROM user_achievements WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['%test%']);
    await pool.query('DELETE FROM user_purchases WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['%test%']);
    await pool.query('DELETE FROM user_progress WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['%test%']);
    await pool.query('DELETE FROM quiz_sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['%test%']);
    await pool.query('DELETE FROM leaderboard WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['%test%']);
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['%test%']);
    
    await pool.query('COMMIT');
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
});
