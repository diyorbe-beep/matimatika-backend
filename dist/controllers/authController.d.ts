import { Request, Response } from 'express';
export declare class AuthController {
    static register(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static refreshToken(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static logout(req: Request, res: Response): Promise<void>;
    static verifyToken(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static forgotPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static resetPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static changePassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getCurrentUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=authController.d.ts.map