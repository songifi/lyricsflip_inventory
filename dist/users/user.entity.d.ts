export declare class User {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    refreshTokenHash: string | null;
    normalizeEmail(): void;
    setPassword(plain: string): Promise<void>;
    comparePassword(plain: string): Promise<boolean>;
}
