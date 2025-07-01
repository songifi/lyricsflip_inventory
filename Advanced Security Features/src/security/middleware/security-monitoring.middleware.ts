import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { SecurityMonitoringService } from "../services/security-monitoring.service";

@Injectable()
export class SecurityMonitoringMiddleware implements NestMiddleware {
  constructor(private securityMonitoring: SecurityMonitoringService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const userAgent = req.get("User-Agent") || "";

    // Record the request
    this.securityMonitoring.recordRequest(ip);

    // Check for suspicious activity
    if (
      this.securityMonitoring.detectSuspiciousActivity(ip, userAgent, req.url)
    ) {
      throw new HttpException(
        "Suspicious activity detected",
        HttpStatus.FORBIDDEN
      );
    }

    // Check rate limiting
    if (this.securityMonitoring.checkRateLimit(ip)) {
      throw new HttpException(
        "Rate limit exceeded",
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    next();
  }
}
