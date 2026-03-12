import { Request, Response } from 'express';
export declare class LearningController {
    static getModules(req: Request, res: Response): Promise<void>;
    static getModule(req: Request, res: Response): Promise<void>;
    static getModuleLessons(req: Request, res: Response): Promise<void>;
    static getLesson(req: Request, res: Response): Promise<void>;
    static getLessonQuestions(req: Request, res: Response): Promise<void>;
    static submitQuiz(req: Request, res: Response): Promise<void>;
    static createModule(req: Request, res: Response): Promise<void>;
    static updateModule(req: Request, res: Response): Promise<void>;
    static deleteModule(req: Request, res: Response): Promise<void>;
    static createLesson(req: Request, res: Response): Promise<void>;
    static updateLesson(req: Request, res: Response): Promise<void>;
    static deleteLesson(req: Request, res: Response): Promise<void>;
    static createQuestion(req: Request, res: Response): Promise<void>;
    static updateQuestion(req: Request, res: Response): Promise<void>;
    static deleteQuestion(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=learningController.d.ts.map