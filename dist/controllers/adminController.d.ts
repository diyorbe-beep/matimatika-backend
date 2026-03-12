import { Request, Response } from 'express';
export declare class AdminController {
    static getAllUsers(req: Request, res: Response): Promise<void>;
    static getUserById(req: Request, res: Response): Promise<void>;
    static updateUser(req: Request, res: Response): Promise<void>;
    static deleteUser(req: Request, res: Response): Promise<void>;
    static banUser(req: Request, res: Response): Promise<void>;
    static unbanUser(req: Request, res: Response): Promise<void>;
    static getSystemStats(req: Request, res: Response): Promise<void>;
    static getUserStats(req: Request, res: Response): Promise<void>;
    static getLearningStats(req: Request, res: Response): Promise<void>;
    static getGamificationStats(req: Request, res: Response): Promise<void>;
    static getRevenueStats(req: Request, res: Response): Promise<void>;
    static getAllModules(req: Request, res: Response): Promise<void>;
    static getAllLessons(req: Request, res: Response): Promise<void>;
    static getAllQuestions(req: Request, res: Response): Promise<void>;
    static getSystemHealth(req: Request, res: Response): Promise<void>;
    static getSystemLogs(req: Request, res: Response): Promise<void>;
    static createDatabaseBackup(req: Request, res: Response): Promise<void>;
    static restoreDatabase(req: Request, res: Response): Promise<void>;
    static getDatabaseStats(req: Request, res: Response): Promise<void>;
    static getUserActivityAnalytics(req: Request, res: Response): Promise<void>;
    static getLearningProgressAnalytics(req: Request, res: Response): Promise<void>;
    static getRevenueAnalytics(req: Request, res: Response): Promise<void>;
    static exportAnalytics(req: Request, res: Response): Promise<void>;
    static getSystemSettings(req: Request, res: Response): Promise<void>;
    static updateSystemSettings(req: Request, res: Response): Promise<void>;
    static broadcastNotification(req: Request, res: Response): Promise<void>;
    static getAllNotifications(req: Request, res: Response): Promise<void>;
    static getAuditLog(req: Request, res: Response): Promise<void>;
    static getSuspiciousActivity(req: Request, res: Response): Promise<void>;
    static lockUserAccount(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=adminController.d.ts.map