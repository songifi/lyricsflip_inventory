import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import * as si from "systeminformation";
import { SystemMetricsDto } from "./dto/health-response.dto";

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource
  ) {}

  async checkDatabaseConnection(): Promise<{
    status: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();

    try {
      await this.dataSource.query("SELECT 1");
      const responseTime = Date.now() - startTime;

      return {
        status: "up",
        responseTime,
      };
    } catch (error) {
      return {
        status: "down",
        error: error.message,
      };
    }
  }

  async getSystemMetrics(): Promise<SystemMetricsDto> {
    try {
      const [memInfo, diskInfo] = await Promise.all([si.mem(), si.fsSize()]);

      // Get primary disk (usually the first one or root partition)
      const primaryDisk =
        diskInfo.find((disk) => disk.mount === "/") || diskInfo[0];

      return {
        memory: {
          total: Math.round(memInfo.total / 1024 / 1024), // MB
          used: Math.round(memInfo.used / 1024 / 1024), // MB
          free: Math.round(memInfo.free / 1024 / 1024), // MB
          percentage: Math.round((memInfo.used / memInfo.total) * 100),
        },
        disk: {
          total: Math.round(primaryDisk.size / 1024 / 1024 / 1024), // GB
          used: Math.round(primaryDisk.used / 1024 / 1024 / 1024), // GB
          free: Math.round(
            (primaryDisk.size - primaryDisk.used) / 1024 / 1024 / 1024
          ), // GB
          percentage: Math.round((primaryDisk.used / primaryDisk.size) * 100),
        },
        uptime: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to get system metrics: ${error.message}`);
    }
  }

  async checkReadiness(): Promise<{
    status: string;
    checks: Record<string, any>;
  }> {
    const checks = {};
    let overallStatus = "ready";

    try {
      // Database check
      const dbCheck = await this.checkDatabaseConnection();
      checks["database"] = dbCheck;

      if (dbCheck.status !== "up") {
        overallStatus = "not_ready";
      }

      // Memory check (fail if > 90% used)
      const metrics = await this.getSystemMetrics();
      const memoryHealthy = metrics.memory.percentage < 90;
      checks["memory"] = {
        status: memoryHealthy ? "healthy" : "critical",
        usage: `${metrics.memory.percentage}%`,
      };

      if (!memoryHealthy) {
        overallStatus = "not_ready";
      }

      // Disk check (fail if > 85% used)
      const diskHealthy = metrics.disk.percentage < 85;
      checks["disk"] = {
        status: diskHealthy ? "healthy" : "critical",
        usage: `${metrics.disk.percentage}%`,
      };

      if (!diskHealthy) {
        overallStatus = "not_ready";
      }
    } catch (error) {
      overallStatus = "not_ready";
      checks["error"] = error.message;
    }

    return {
      status: overallStatus,
      checks,
    };
  }

  async checkLiveness(): Promise<{
    status: string;
    uptime: number;
    timestamp: string;
  }> {
    // Basic liveness check - if this method runs, the app is alive
    return {
      status: "alive",
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
