import { Request, Response } from 'express';
export declare class GamificationController {
    static getAchievements(req: Request, res: Response): Promise<void>;
    static getUserAchievements(req: Request, res: Response): Promise<void>;
    static unlockAchievement(req: Request, res: Response): Promise<void>;
    static getWeeklyLeaderboard(req: Request, res: Response): Promise<void>;
    static getAllTimeLeaderboard(req: Request, res: Response): Promise<void>;
    static getUserStats(req: Request, res: Response): Promise<void>;
    static getUserLevel(req: Request, res: Response): Promise<void>;
    static awardXP(req: Request, res: Response): Promise<void>;
    static updateLeague(req: Request, res: Response): Promise<void>;
    static getUserLeague(req: Request, res: Response): Promise<void>;
    static createAchievement(req: Request, res: Response): Promise<void>;
    static updateAchievement(req: Request, res: Response): Promise<void>;
    static deleteAchievement(req: Request, res: Response): Promise<void>;
    static getGamificationAnalytics(req: Request, res: Response): Promise<void>;
    static processWeeklyLeagueUpdate(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=gamificationController.d.ts.map