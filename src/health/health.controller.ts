import { Controller, Get, HttpStatus, Res } from "@nestjs/common";
import { Response } from "express";
import { HealthService } from "./health.service";
import { HealthResponseDto, SystemMetricsDto } from "./dto/health-response.dto";

@Controller("health")
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth(@Res() res: Response): Promise<void> {
    try {
      const [dbCheck, metrics] = await Promise.all([
        this.healthService.checkDatabaseConnection(),
        this.healthService.getSystemMetrics(),
      ]);

      const isHealthy =
        dbCheck.status === "up" &&
        metrics.memory.percentage < 90 &&
        metrics.disk.percentage < 85;

      const response: HealthResponseDto = {
        status: isHealthy ? "ok" : "error",
        details: {
          database: dbCheck,
          system: metrics,
          uptime: Math.round(process.uptime()),
          timestamp: new Date().toISOString(),
        },
      };

      if (isHealthy) {
        response.info = { message: "All systems operational" };
      } else {
        response.error = { message: "Some systems are experiencing issues" };
      }

      const statusCode = isHealthy
        ? HttpStatus.OK
        : HttpStatus.SERVICE_UNAVAILABLE;
      res.status(statusCode).json(response);
    } catch (error) {
      const response: HealthResponseDto = {
        status: "error",
        error: { message: "Health check failed", details: error.message },
        details: {
          timestamp: new Date().toISOString(),
        },
      };
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  @Get("ready")
  async getReadiness(@Res() res: Response): Promise<void> {
    try {
      const readinessCheck = await this.healthService.checkReadiness();

      const statusCode =
        readinessCheck.status === "ready"
          ? HttpStatus.OK
          : HttpStatus.SERVICE_UNAVAILABLE;

      res.status(statusCode).json({
        status: readinessCheck.status,
        checks: readinessCheck.checks,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: "not_ready",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Get("live")
  async getLiveness(@Res() res: Response): Promise<void> {
    try {
      const livenessCheck = await this.healthService.checkLiveness();
      res.status(HttpStatus.OK).json(livenessCheck);
    } catch (error) {
      // If we can't even run this check, the app is likely dead
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: "dead",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Get("metrics")
  async getMetrics(@Res() res: Response): Promise<void> {
    try {
      const metrics = await this.healthService.getSystemMetrics();
      res.status(HttpStatus.OK).json(metrics);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: "Failed to retrieve system metrics",
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @Get("db")
  async getDatabaseHealth(@Res() res: Response): Promise<void> {
    try {
      const dbCheck = await this.healthService.checkDatabaseConnection();
      const statusCode =
        dbCheck.status === "up"
          ? HttpStatus.OK
          : HttpStatus.SERVICE_UNAVAILABLE;

      res.status(statusCode).json({
        ...dbCheck,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: "down",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
