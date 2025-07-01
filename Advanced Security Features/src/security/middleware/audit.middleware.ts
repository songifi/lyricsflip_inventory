import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AuditService } from "../services/audit.service";

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(private auditService: AuditService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const originalSend = res.send;

    res.send = function (data) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Log the audit entry
      setImmediate(() => {
        const auditLog = {
          userId: req.user?.id,
          action: req.method,
          resource: req.route?.path || req.url,
          method: req.method,
          url: req.url,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get("User-Agent") || "Unknown",
          statusCode: res.statusCode,
          duration,
          requestBody: req.method !== "GET" ? req.body : undefined,
          responseBody: res.statusCode >= 400 ? data : undefined,
        };

        this.auditService.logAction(auditLog);
      });

      return originalSend.call(this, data);
    }.bind(this);

    next();
  }
}
