import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../common/types/jwt-payload.type';
import type { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(cfg: ConfigService) {
    const jwtFromRequestFn = (req: Request): string | null => {
      const auth = req.headers?.authorization;
      if (!auth) return null;
      const [type, token] = auth.split(' ');
      return type === 'Bearer' && token ? token : null;
    };
    const secret = cfg.getOrThrow<string>('JWT_ACCESS_SECRET');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      jwtFromRequest: jwtFromRequestFn,
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
