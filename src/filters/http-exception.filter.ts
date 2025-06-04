import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import { Logger } from "winston";
import { InjectLogger } from "nest-winston";
import { ErrorResponse } from "../interfaces/error-response.interface";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(@InjectLogger() private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === "string" ? res : (res as any).message || message;
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error:
        exception instanceof HttpException
          ? exception.name
          : "InternalException",
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error("Exception thrown", {
      ...errorResponse,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json(errorResponse);
  }
}
