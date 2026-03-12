import { Request, Response } from 'express';
export declare class ProgressController {
    static getUserProgress(req: Request, res: Response): Promise<void>;
    static getMyProgress(req: Request, res: Response): Promise<void>;
    static getLessonProgress(req: Request, res: Response): Promise<void>;
    static completeLesson(req: Request, res: Response): Promise<void>;
    static getProgressStats(req: Request, res: Response): Promise<void>;
    static getLeaderboard(req: Request, res: Response): Promise<void>;
    static getWeeklyLeaderboard(req: Request, res: Response): Promise<void>;
    static getModuleProgress(req: Request, res: Response): Promise<void>;
    static getLearningStreak(req: Request, res: Response): Promise<void>;
    static updateProgress(req: Request, res: Response): Promise<void>;
    static resetUserProgress(req: Request, res: Response): Promise<void>;
    static getProgressAnalytics(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=progressController.d.ts.map