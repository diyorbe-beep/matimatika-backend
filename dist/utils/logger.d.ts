import winston from 'winston';
export declare const logger: winston.Logger;
export declare const morganStream: {
    write: (message: string) => void;
};
export declare const logUserAction: (userId: string, action: string, details?: any) => void;
export declare const logError: (error: Error, context?: any) => void;
export declare const logSecurityEvent: (event: string, details?: any) => void;
export declare const logPerformance: (operation: string, duration: number, details?: any) => void;
//# sourceMappingURL=logger.d.ts.map