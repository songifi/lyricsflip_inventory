import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../common/types/jwt-payload.type';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(cfg: ConfigService);
    validate(payload: JwtPayload): Promise<JwtPayload>;
}
export {};
