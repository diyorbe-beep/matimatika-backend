interface AppConfig {
    port: number;
    nodeEnv: string;
    corsOrigin: string[];
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtRefreshExpiresIn: string;
    bcryptRounds: number;
    logLevel: string;
    databaseUrl: string;
    redisUrl: string;
    emailHost: string;
    emailPort: number;
    emailUser: string;
    emailPass: string;
    uploadMaxSize: number;
    uploadAllowedTypes: string[];
}
declare const config: AppConfig;
export { config, AppConfig };
//# sourceMappingURL=app.d.ts.map