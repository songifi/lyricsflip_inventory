import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtPayload } from '../common/types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly cfg: ConfigService,
  ) {}

  private async signTokens(payload: JwtPayload) {
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

  async register(email: string, name: string, password: string) {
    const user = await this.users.createUser({ email, name, password });
    const roles = (user.roles ?? []).map((r) => r.name);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles,
    };
    const tokens = await this.signTokens(payload);
    await this.users.updateRefreshToken(user.id, tokens.refreshToken);
    return {
      user: { id: user.id, email: user.email, name: user.name },
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await user.comparePassword(password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const roles = (user.roles ?? []).map((r) => r.name);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles,
    };
    const tokens = await this.signTokens(payload);
    await this.users.updateRefreshToken(user.id, tokens.refreshToken);
    return {
      user: { id: user.id, email: user.email, name: user.name },
      ...tokens,
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const valid = await this.users.compareRefreshToken(userId, refreshToken);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const roles = (user.roles ?? []).map((r) => r.name);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles,
    };
    const tokens = await this.signTokens(payload);
    // rotate refresh token
    await this.users.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    await this.users.updateRefreshToken(userId, null);
    return { success: true };
  }
}
