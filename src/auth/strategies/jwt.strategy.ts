import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'your-secret-key'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userService.findOne(payload.sub);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    return {
      userId: payload.sub,
      email: payload.email,
      username: payload.username,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  }
} 