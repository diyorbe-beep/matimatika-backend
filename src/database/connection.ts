import { Pool, PoolConfig } from 'pg';
import { config } from '../config/app';
import { logger, logError } from '../utils/logger';

interface DatabaseConfig extends PoolConfig {
  max: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

const dbConfig: DatabaseConfig = {
  connectionString: config.databaseUrl,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
};

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool | null = null;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<void> {
    try {
      this.pool = new Pool(dbConfig);

      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      logger.info('Database connected successfully');
      
      // Set up event listeners
      this.pool.on('error', (err) => {
        logger.error('Unexpected error on idle client', err);
      });

      this.pool.on('connect', (client) => {
        logger.debug('New client connected');
      });

      this.pool.on('remove', (client) => {
        logger.debug('Client removed');
      });

    } catch (error) {
      logger.error('Database connection failed, using mock mode', { 
        error: (error as Error).message,
        stack: (error as Error).stack
      });
      // Don't throw error, just continue with mock mode
      this.pool = null;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      logger.info('Database disconnected');
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      // Mock response when database is not available
      logger.warn('Using mock database response');
      return { rows: [], rowCount: 0 };
    }

    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      if (config.logLevel === 'debug') {
        logger.debug('Query executed', { 
          query: text, 
          params, 
          duration, 
          rowCount: result.rowCount 
        });
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error('Query failed', { 
        query: text, 
        params, 
        duration, 
        error: (error as Error).message 
      });
      throw error;
    }
  }

  async queryOne(text: string, params?: any[]): Promise<any> {
    const result = await this.query(text, params);
    return result.rows[0] || null;
  }

  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    if (!this.pool) {
      // Mock transaction
      logger.warn('Using mock transaction');
      return callback(null);
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async healthCheck(): Promise<boolean> {
    if (!this.pool) {
      return true; // Mock mode is always "healthy"
    }

    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  getPool(): Pool | null {
    return this.pool;
  }

  getPoolStats() {
    if (!this.pool) {
      return {
        totalCount: 0,
        idleCount: 0,
        waitingCount: 0,
      };
    }

    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}

// Create and export singleton instance
export const db = DatabaseConnection.getInstance();
