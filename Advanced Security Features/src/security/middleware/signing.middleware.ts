import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { SigningService } from "../services/signing.service";

@Injectable()
export class SigningMiddleware implements NestMiddleware {
  constructor(private signingService: SigningService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const signature = req.headers["x-signature"] as string;
    const timestamp = req.headers["x-timestamp"] as string;

    if (!signature || !timestamp) {
      throw new UnauthorizedException("Missing signature or timestamp");
    }

    const timestampNum = parseInt(timestamp, 10);
    const now = Math.floor(Date.now() / 1000);

    // Check if request is within 5 minutes
    if (Math.abs(now - timestampNum) > 300) {
      throw new UnauthorizedException("Request timestamp too old");
    }

    const isValid = this.signingService.verifySignature(
      req.method,
      req.url,
      req.body,
      timestampNum,
      signature
    );

    if (!isValid) {
      throw new UnauthorizedException("Invalid signature");
    }

    next();
  }
}
