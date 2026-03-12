import { Pool } from 'pg';
export declare class DatabaseConnection {
    private static instance;
    private pool;
    private constructor();
    static getInstance(): DatabaseConnection;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(text: string, params?: any[]): Promise<any>;
    queryOne(text: string, params?: any[]): Promise<any>;
    transaction<T>(callback: (client: any) => Promise<T>): Promise<T>;
    healthCheck(): Promise<boolean>;
    getPool(): Pool | null;
    getPoolStats(): {
        totalCount: number;
        idleCount: number;
        waitingCount: number;
    };
}
export declare const db: DatabaseConnection;
//# sourceMappingURL=connection.d.ts.map