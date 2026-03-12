export interface MockQueryResult {
    rows: any[];
    rowCount: number;
}
declare class MockDatabaseConnection {
    private static instance;
    private connected;
    static getInstance(): MockDatabaseConnection;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query(text: string, params?: any[]): Promise<MockQueryResult>;
    queryOne(text: string, params?: any[]): Promise<any>;
    transaction<T>(callback: (client: MockDatabaseConnection) => Promise<T>): Promise<T>;
    healthCheck(): Promise<boolean>;
}
export declare const mockDb: MockDatabaseConnection;
export {};
//# sourceMappingURL=mockConnection.d.ts.map