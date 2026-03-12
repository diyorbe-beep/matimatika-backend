"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const app_2 = require("./config/app");
const connection_1 = require("./database/connection");
const logger_1 = require("./utils/logger");
async function startServer() {
    try {
        await connection_1.db.connect();
        logger_1.logger.info('Database connected successfully');
        const server = app_1.default.listen(app_2.config.port, () => {
            logger_1.logger.info(`Server running on port ${app_2.config.port} in ${app_2.config.nodeEnv} mode`);
            logger_1.logger.info(`Health check available at http://localhost:${app_2.config.port}/health`);
            logger_1.logger.info(`API documentation at http://localhost:${app_2.config.port}/api`);
        });
        server.on('error', (error) => {
            if (error.syscall !== 'listen') {
                throw error;
            }
            const bind = typeof app_2.config.port === 'string'
                ? 'Pipe ' + app_2.config.port
                : 'Port ' + app_2.config.port;
            switch (error.code) {
                case 'EACCES':
                    logger_1.logger.error(`${bind} requires elevated privileges`);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    logger_1.logger.error(`${bind} is already in use`);
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });
        const gracefulShutdown = async (signal) => {
            logger_1.logger.info(`Received ${signal}. Shutting down gracefully...`);
            server.close(async () => {
                logger_1.logger.info('HTTP server closed');
                try {
                    await connection_1.db.disconnect();
                    logger_1.logger.info('Database disconnected');
                    process.exit(0);
                }
                catch (error) {
                    logger_1.logger.error('Error during shutdown', { error: error.message });
                    process.exit(1);
                }
            });
            setTimeout(() => {
                logger_1.logger.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 30000);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        return server;
    }
    catch (error) {
        logger_1.logger.error('Failed to start server', { error: error.message });
        process.exit(1);
    }
}
if (require.main === module) {
    startServer();
}
exports.default = startServer;
//# sourceMappingURL=server.js.map