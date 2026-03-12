import { Request, Response } from 'express';
// import { pool } from '../config/database'; // Disabled for mock mode
import { logUserAction } from '../utils/logger';

// Mock data storage with localStorage persistence
class MockUserStorage {
  private storageKey = 'mathquest_mock_users';

  // Load users from localStorage
  private loadUsers(): Map<string, any> {
    try {
      // Use global localStorage (Node.js global)
      const storage = (global as any).localStorage;
      if (storage) {
        const data = storage.getItem(this.storageKey);
        if (data) {
          const usersData = JSON.parse(data);
          return new Map(Object.entries(usersData));
        }
      }
    } catch (error) {
      console.log('Failed to load users from localStorage:', error);
    }
    return new Map();
  }

  // Save users to localStorage
  private saveUsers(users: Map<string, any>): void {
    try {
      // Use global localStorage (Node.js global)
      const storage = (global as any).localStorage;
      if (storage) {
        const usersData = Object.fromEntries(users);
        storage.setItem(this.storageKey, JSON.stringify(usersData));
        console.log('✅ Users saved to localStorage');
      }
    } catch (error) {
      console.log('Failed to save users to localStorage:', error);
    }
  }

  // Get user
  get(userId: string): any {
    const users = this.loadUsers();
    return users.get(userId);
  }

  // Set user
  set(userId: string, userData: any): void {
    const users = this.loadUsers();
    users.set(userId, userData);
    this.saveUsers(users);
  }

  // Get all users
  getAll(): any[] {
    const users = this.loadUsers();
    return Array.from(users.values());
  }
}

const mockStorage = new MockUserStorage();

export class UserController {
  static async getUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      // Try to get user from mock storage
      let user = mockStorage.get(userId);
      
      // If user doesn't exist, create a default one
      if (!user) {
        user = {
          id: userId,
          email: `user${userId}@example.com`,
          name: `User ${userId}`,
          avatar: '👤',
          hearts: 5,
          max_hearts: 5,
          streak: 0,
          weekly_streak: 0,
          last_active_date: new Date().toISOString(),
          daily_challenge_completed: false,
          league: 'Bronze',
          league_points: 0,
          coins: 0,
          xp: 0,
          xp_max: 100,
          level: 1,
          accessories: [],
          achievements: [],
          quiz_stats: { totalQuizzes: 0, correctAnswers: 0, totalTime: 0 },
          module_progress: {
            "addition-subtraction": 0,
            "multiplication-division": 0,
            "advanced-math": 0,
            "geometry": 0,
            "fractions": 0
          }
        };
        mockStorage.set(userId, user);
      }
      
      logUserAction('user_data_retrieved', userId, { userId });

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          hearts: user.hearts,
          maxHearts: user.max_hearts,
          streak: user.streak,
          weeklyStreak: user.weekly_streak,
          lastActiveDate: user.last_active_date,
          dailyChallengeCompleted: user.daily_challenge_completed,
          league: user.league,
          leaguePoints: user.league_points,
          coins: user.coins,
          xp: user.xp,
          xpMax: user.xp_max,
          level: user.level,
          accessories: user.accessories,
          achievements: user.achievements,
          quizStats: user.quiz_stats,
          moduleProgress: user.module_progress
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user data'
      });
    }
  }

  static async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const userData = req.body;

      // Get existing user or create default
      let user = mockStorage.get(userId);
      if (!user) {
        user = {
          id: userId,
          email: `user${userId}@example.com`,
          name: `User ${userId}`,
          avatar: '👤',
          hearts: 5,
          max_hearts: 5,
          streak: 0,
          weekly_streak: 0,
          last_active_date: new Date().toISOString(),
          daily_challenge_completed: false,
          league: 'Bronze',
          league_points: 0,
          coins: 0,
          xp: 0,
          xp_max: 100,
          level: 1,
          accessories: [],
          achievements: [],
          quiz_stats: { totalQuizzes: 0, correctAnswers: 0, totalTime: 0 },
          module_progress: {
            "addition-subtraction": 0,
            "multiplication-division": 0,
            "advanced-math": 0,
            "geometry": 0,
            "fractions": 0
          }
        };
      }

      // Update user data
      const updatedUser = {
        ...user,
        hearts: userData.hearts !== undefined ? userData.hearts : user.hearts,
        max_hearts: userData.maxHearts !== undefined ? userData.maxHearts : user.max_hearts,
        streak: userData.streak !== undefined ? userData.streak : user.streak,
        weekly_streak: userData.weeklyStreak !== undefined ? userData.weeklyStreak : user.weekly_streak,
        last_active_date: userData.lastActiveDate || user.last_active_date,
        daily_challenge_completed: userData.dailyChallengeCompleted !== undefined ? userData.dailyChallengeCompleted : user.daily_challenge_completed,
        league: userData.league || user.league,
        league_points: userData.leaguePoints !== undefined ? userData.leaguePoints : user.league_points,
        coins: userData.coins !== undefined ? userData.coins : user.coins,
        xp: userData.xp !== undefined ? userData.xp : user.xp,
        xp_max: userData.xpMax !== undefined ? userData.xpMax : user.xp_max,
        level: userData.level !== undefined ? userData.level : user.level,
        avatar: userData.avatar || user.avatar,
        accessories: userData.accessories || user.accessories,
        achievements: userData.achievements || user.achievements,
        quiz_stats: userData.quizStats || user.quiz_stats,
        module_progress: userData.moduleProgress || user.module_progress,
        updated_at: new Date().toISOString()
      };

      // Save to mock storage
      mockStorage.set(userId, updatedUser);

      logUserAction('user_data_updated', userId, userData);

      res.json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user data'
      });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      // Return all mock users sorted by XP
      const users = mockStorage.getAll().sort((a: any, b: any) => b.xp - a.xp);
      
      // Return only necessary fields for leaderboard
      const leaderboardData = users.map((user: any) => ({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        coins: user.coins,
        league: user.league,
        league_points: user.league_points
      }));

      res.json({
        success: true,
        data: leaderboardData
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get users'
      });
    }
  }
}
