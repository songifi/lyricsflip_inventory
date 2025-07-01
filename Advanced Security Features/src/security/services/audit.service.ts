import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs/promises";
import * as path from "path";

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId?: string;
  action: string;
  resource: string;
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  statusCode: number;
  duration: number;
  requestBody?: any;
  responseBody?: any;
  metadata?: any;
}

@Injectable()
export class AuditService {
  private readonly auditLogPath: string;

  constructor(private configService: ConfigService) {
    this.auditLogPath =
      this.configService.get<string>("AUDIT_LOG_PATH") || "./logs/audit.log";
  }

  async logAction(auditLog: Partial<AuditLog>): Promise<void> {
    const log: AuditLog = {
      id: this.generateId(),
      timestamp: new Date(),
      action: "UNKNOWN",
      resource: "UNKNOWN",
      method: "UNKNOWN",
      url: "UNKNOWN",
      ip: "UNKNOWN",
      userAgent: "UNKNOWN",
      statusCode: 0,
      duration: 0,
      ...auditLog,
    };

    await this.writeAuditLog(log);
  }

  private async writeAuditLog(log: AuditLog): Promise<void> {
    try {
      const logDir = path.dirname(this.auditLogPath);
      await fs.mkdir(logDir, { recursive: true });

      const logLine = JSON.stringify(log) + "\n";
      await fs.appendFile(this.auditLogPath, logLine);
    } catch (error) {
      console.error("Failed to write audit log:", error);
    }
  }

  async getAuditLogs(
    limit: number = 100,
    offset: number = 0,
    filters?: Partial<AuditLog>
  ): Promise<AuditLog[]> {
    try {
      const data = await fs.readFile(this.auditLogPath, "utf8");
      const logs = data
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line))
        .filter((log) => this.matchesFilters(log, filters))
        .slice(offset, offset + limit);

      return logs;
    } catch (error) {
      console.error("Failed to read audit logs:", error);
      return [];
    }
  }

  private matchesFilters(log: AuditLog, filters?: Partial<AuditLog>): boolean {
    if (!filters) return true;

    return Object.keys(filters).every((key) => {
      const filterValue = filters[key];
      const logValue = log[key];

      if (filterValue === undefined) return true;
      if (typeof filterValue === "string") {
        return logValue
          ?.toString()
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
      return logValue === filterValue;
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
