import { Request, Response } from 'express';
export declare class ShopController {
    static getShopItems(req: Request, res: Response): Promise<void>;
    static getShopItem(req: Request, res: Response): Promise<void>;
    static getUserPurchases(req: Request, res: Response): Promise<void>;
    static getUserCurrency(req: Request, res: Response): Promise<void>;
    static purchaseItem(req: Request, res: Response): Promise<void>;
    static createShopItem(req: Request, res: Response): Promise<void>;
    static updateShopItem(req: Request, res: Response): Promise<void>;
    static deleteShopItem(req: Request, res: Response): Promise<void>;
    static awardCurrency(req: Request, res: Response): Promise<void>;
    static deductCurrency(req: Request, res: Response): Promise<void>;
    static getShopAnalytics(req: Request, res: Response): Promise<void>;
    static getPopularItems(req: Request, res: Response): Promise<void>;
    static getItemsByCategory(req: Request, res: Response): Promise<void>;
    static getFeaturedItems(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=shopController.d.ts.map