"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    users;
    jwt;
    cfg;
    constructor(users, jwt, cfg) {
        this.users = users;
        this.jwt = jwt;
        this.cfg = cfg;
    }
    async signTokens(payload) {
        const access = await this.jwt.signAsync(payload, {
            secret: this.cfg.get('JWT_ACCESS_SECRET'),
            expiresIn: this.cfg.get('JWT_ACCESS_TTL') ?? '15m',
        });
        const refresh = await this.jwt.signAsync(payload, {
            secret: this.cfg.get('JWT_REFRESH_SECRET'),
            expiresIn: this.cfg.get('JWT_REFRESH_TTL') ?? '7d',
        });
        return { accessToken: access, refreshToken: refresh };
    }
    async register(email, name, password) {
        const user = await this.users.createUser({ email, name, password });
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
        };
        const tokens = await this.signTokens(payload);
        await this.users.updateRefreshToken(user.id, tokens.refreshToken);
        return {
            user: { id: user.id, email: user.email, name: user.name },
            ...tokens,
        };
    }
    async login(email, password) {
        const user = await this.users.findByEmail(email);
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const ok = await user.comparePassword(password);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
        };
        const tokens = await this.signTokens(payload);
        await this.users.updateRefreshToken(user.id, tokens.refreshToken);
        return {
            user: { id: user.id, email: user.email, name: user.name },
            ...tokens,
        };
    }
    async refresh(userId, refreshToken) {
        const valid = await this.users.compareRefreshToken(userId, refreshToken);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        const user = await this.users.findById(userId);
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
        };
        const tokens = await this.signTokens(payload);
        await this.users.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }
    async logout(userId) {
        await this.users.updateRefreshToken(userId, null);
        return { success: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map