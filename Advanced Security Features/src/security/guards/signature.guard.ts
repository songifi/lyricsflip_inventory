import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { SigningService } from "../services/signing.service";

@Injectable()
export class SignatureGuard implements CanActivate {
  constructor(private signingService: SigningService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const signature = request.headers["x-signature"];
    const timestamp = request.headers["x-timestamp"];

    if (!signature || !timestamp) {
      throw new UnauthorizedException("Missing signature or timestamp");
    }

    const timestampNum = parseInt(timestamp, 10);
    const isValid = this.signingService.verifySignature(
      request.method,
      request.url,
      request.body,
      timestampNum,
      signature
    );

    if (!isValid) {
      throw new UnauthorizedException("Invalid signature");
    }

    return true;
  }
}
