import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { Logger } from "winston";
import { InjectLogger } from "nest-winston";

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(@InjectLogger() private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      this.logger.info("Request handled", {
        method,
        url: originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  }
}
