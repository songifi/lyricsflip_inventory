import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../common/types/jwt-payload.type';
declare const RtStrategy_base: new (...args: any) => any;
export declare class RtStrategy extends RtStrategy_base {
    constructor(cfg: ConfigService);
    validate(payload: JwtPayload): Promise<JwtPayload>;
}
export {};
