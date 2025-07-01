import { Controller, Get, Post, Body, UseGuards, Query } from "@nestjs/common";
import { AuditService } from "../services/audit.service";
import { SecurityMonitoringService } from "../services/security-monitoring.service";
import { EncryptionService } from "../services/encryption.service";

@Controller("security")
export class SecurityController {
  constructor(
    private auditService: AuditService,
    private securityMonitoring: SecurityMonitoringService,
    private encryptionService: EncryptionService
  ) {}

  @Get("audit-logs")
  async getAuditLogs(
    @Query("limit") limit?: number,
    @Query("offset") offset?: number
  ) {
    return this.auditService.getAuditLogs(limit, offset);
  }

  @Get("alerts")
  getSecurityAlerts(@Query("limit") limit?: number) {
    return this.securityMonitoring.getAlerts(limit);
  }

  @Post("encrypt")
  encryptData(@Body("data") data: string) {
    return {
      encrypted: this.encryptionService.encryptData(data),
    };
  }

  @Post("decrypt")
  decryptData(@Body("encrypted") encrypted: string) {
    return {
      decrypted: this.encryptionService.decryptData(encrypted),
    };
  }
}
