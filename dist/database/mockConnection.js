"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDb = void 0;
const logger_1 = require("../utils/logger");
class MockDatabaseConnection {
    constructor() {
        this.connected = false;
    }
    static getInstance() {
        if (!MockDatabaseConnection.instance) {
            MockDatabaseConnection.instance = new MockDatabaseConnection();
        }
        return MockDatabaseConnection.instance;
    }
    async connect() {
        logger_1.logger.info('Mock database: Connected (simulation mode)');
        this.connected = true;
    }
    async disconnect() {
        logger_1.logger.info('Mock database: Disconnected');
        this.connected = false;
    }
    async query(text, params) {
        if (!this.connected) {
            throw new Error('Mock database not connected');
        }
        if (text.includes('SELECT') && text.includes('users')) {
            if (text.includes('WHERE email =')) {
                return { rows: [], rowCount: 0 };
            }
            if (text.includes('WHERE id =')) {
                return { rows: [], rowCount: 0 };
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
        return { rows: [], rowCount: 0 };
    }
    async queryOne(text, params) {
        const result = await this.query(text, params);
        return result.rows[0] || null;
    }
    async transaction(callback) {
        return callback(this);
    }
    async healthCheck() {
        return this.connected;
    }
}
exports.mockDb = MockDatabaseConnection.getInstance();
//# sourceMappingURL=mockConnection.js.map