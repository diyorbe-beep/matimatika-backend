import { UserRole } from '../types';
export declare class AuthService {
    private static readonly SALT_ROUNDS;
    private static readonly JWT_EXPIRES_IN;
    private static readonly JWT_REFRESH_EXPIRES_IN;
    static register(userData: {
        username: string;
        email: string;
        password: string;
        role: UserRole;
        grade_level?: number;
        parent_id?: string;
        avatar_url?: string;
    }): Promise<{
        user: {
            id: any;
            username: any;
            email: any;
            role: any;
            avatar_url: any;
            profile: any;
        };
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    static login(credentials: {
        email: string;
        password: string;
    }): Promise<{
        user: {
            id: any;
            username: any;
            email: any;
            role: any;
            avatar_url: any;
            profile: {
                id: any;
                display_name: any;
                grade_level: any;
                total_xp: any;
                current_level: any;
                hearts: any;
                currency: any;
            };
        };
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    static refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        expiresIn: number;
    }>;
    static logout(userId?: string, refreshToken?: string): Promise<{
        success: boolean;
    }>;
    static verifyToken(token: string): Promise<{
        id: any;
        username: any;
        email: any;
        role: any;
        avatar_url: any;
        profile: {
            id: any;
            display_name: any;
            grade_level: any;
            total_xp: any;
            current_level: any;
            hearts: any;
            currency: any;
        };
    }>;
    static forgotPassword(email: string): Promise<{
        success: boolean;
    }>;
    static resetPassword(token: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    static getCurrentUser(userId: string): Promise<{
        id: any;
        username: any;
        email: any;
        role: any;
        avatar_url: any;
        created_at: any;
        last_login: any;
        profile: {
            id: any;
            display_name: any;
            grade_level: any;
            total_xp: any;
            current_level: any;
            hearts: any;
            currency: any;
            current_streak: any;
            best_streak: any;
            total_time_spent: any;
        };
    }>;
}
//# sourceMappingURL=authService.d.ts.map