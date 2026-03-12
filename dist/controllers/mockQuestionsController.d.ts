import { Request, Response } from 'express';
declare class MockQuestionsController {
    private static generateQuestions;
    private static getLessonData;
    private static getAllModuleLessons;
    private static getDefaultQuestions;
    static getLessonQuestions(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getAllQuestions(req: Request, res: Response): Promise<void>;
}
export { MockQuestionsController };
//# sourceMappingURL=mockQuestionsController.d.ts.map