import { Injectable } from "@nestjs/common";
import { InjectLogger } from "nest-winston";
import { Logger } from "winston";

@Injectable()
export class AppLogger {
  constructor(@InjectLogger() private readonly logger: Logger) {}

  log(message: string, meta?: Record<string, unknown>) {
    this.logger.info(message, meta);
  }

  error(message: string, trace?: string) {
    this.logger.error(message, { trace });
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }
}
