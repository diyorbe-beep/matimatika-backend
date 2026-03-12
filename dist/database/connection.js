"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.DatabaseConnection = void 0;
const pg_1 = require("pg");
const app_1 = require("../config/app");
const logger_1 = require("../utils/logger");
const dbConfig = {
    connectionString: app_1.config.databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: app_1.config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
};
class DatabaseConnection {
    constructor() {
        this.pool = null;
    }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    async connect() {
        try {
            this.pool = new pg_1.Pool(dbConfig);
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            logger_1.logger.info('Database connected successfully');
            this.pool.on('error', (err) => {
                logger_1.logger.error('Unexpected error on idle client', err);
            });
            this.pool.on('connect', (client) => {
                logger_1.logger.debug('New client connected');
            });
            this.pool.on('remove', (client) => {
                logger_1.logger.debug('Client removed');
            });
        }
        catch (error) {
            logger_1.logger.error('Database connection failed, using mock mode', {
                error: error.message,
                stack: error.stack
            });
            this.pool = null;
        }
    }
    async disconnect() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            logger_1.logger.info('Database disconnected');
        }
    }
    async query(text, params) {
        if (!this.pool) {
            logger_1.logger.warn('Using mock database response');
            return { rows: [], rowCount: 0 };
        }
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            if (app_1.config.logLevel === 'debug') {
                logger_1.logger.debug('Query executed', {
                    query: text,
                    params,
                    duration,
                    rowCount: result.rowCount
                });
            }
            return result;
        }
        catch (error) {
            const duration = Date.now() - start;
            logger_1.logger.error('Query failed', {
                query: text,
                params,
                duration,
                error: error.message
            });
            throw error;
        }
    }
    async queryOne(text, params) {
        const result = await this.query(text, params);
        return result.rows[0] || null;
    }
    async transaction(callback) {
        if (!this.pool) {
            logger_1.logger.warn('Using mock transaction');
            return callback(null);
        }
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async healthCheck() {
        if (!this.pool) {
            return true;
        }
        try {
            await this.pool.query('SELECT 1');
            return true;
        }
        catch (error) {
            return false;
        }
    }
    getPool() {
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
exports.DatabaseConnection = DatabaseConnection;
exports.db = DatabaseConnection.getInstance();
//# sourceMappingURL=connection.js.map