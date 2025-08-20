import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class UsersService {
    private readonly repo;
    constructor(repo: Repository<User>);
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    createUser(params: {
        email: string;
        name: string;
        password: string;
    }): Promise<User>;
    updateRefreshToken(userId: string, refreshToken: string | null): Promise<User | null>;
    compareRefreshToken(userId: string, refreshToken: string): Promise<boolean>;
}
