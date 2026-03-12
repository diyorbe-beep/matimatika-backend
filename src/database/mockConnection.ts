// Mock database connection for demonstration when PostgreSQL isn't available
import { logger } from '../utils/logger';

export interface MockQueryResult {
  rows: any[];
  rowCount: number;
}

class MockDatabaseConnection {
  private static instance: MockDatabaseConnection;
  private connected = false;

  static getInstance(): MockDatabaseConnection {
    if (!MockDatabaseConnection.instance) {
      MockDatabaseConnection.instance = new MockDatabaseConnection();
    }
    return MockDatabaseConnection.instance;
  }

  async connect(): Promise<void> {
    logger.info('Mock database: Connected (simulation mode)');
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    logger.info('Mock database: Disconnected');
    this.connected = false;
  }

  async query(text: string, params?: any[]): Promise<MockQueryResult> {
    if (!this.connected) {
      throw new Error('Mock database not connected');
    }

    // Mock responses based on query patterns
    if (text.includes('SELECT') && text.includes('users')) {
      if (text.includes('WHERE email =')) {
        return { rows: [], rowCount: 0 }; // No users found
      }
      if (text.includes('WHERE id =')) {
        return { rows: [], rowCount: 0 }; // No user found
      }
      return { rows: [], rowCount: 0 };
    }

    if (text.includes('INSERT') && text.includes('users')) {
      const mockUser = {
        id: 'mock-user-id',
        username: 'mockuser',
        email: params?.[0] || 'mock@example.com',
        role: 'student',
        avatar_url: '🦊',
        created_at: new Date().toISOString()
      };
      return { rows: [mockUser], rowCount: 1 };
    }

    if (text.includes('INSERT') && text.includes('user_profiles')) {
      const mockProfile = {
        id: 'mock-profile-id',
        display_name: params?.[1] || 'Mock User',
        grade_level: 3,
        total_xp: 0,
        current_level: 1,
        hearts: 5,
        currency: 100
      };
      return { rows: [mockProfile], rowCount: 1 };
    }

    // Default mock response
    return { rows: [], rowCount: 0 };
  }

  async queryOne(text: string, params?: any[]): Promise<any> {
    const result = await this.query(text, params);
    return result.rows[0] || null;
  }

  async transaction<T>(callback: (client: MockDatabaseConnection) => Promise<T>): Promise<T> {
    return callback(this);
  }

  async healthCheck(): Promise<boolean> {
    return this.connected;
  }
}

export const mockDb = MockDatabaseConnection.getInstance();
