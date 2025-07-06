import {
    Controller,
    Get,
    Query,
    Param,
    UseGuards,
    Header,
    StreamableFile,
  } from '@nestjs/common';
  import { AuditLogService } from './audit-log.service';
  import { AuditLogQueryDto } from './audit-log.dto';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { RolesGuard } from '../auth/roles.guard';
  import { Roles } from '../auth/roles.decorator';
  import { Role } from '../auth/role.enum';
  
  @Controller('audit-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.AUDITOR)
  export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) {}
  
    @Get()
    async getAuditLogs(@Query() query: AuditLogQueryDto) {
      return this.auditLogService.findAuditLogs(query);
    }
  
    @Get('trail/:entityName/:entityId')
    async getAuditTrail(
      @Param('entityName') entityName: string,
      @Param('entityId') entityId: string,
    ) {
      return this.auditLogService.getAuditTrail(entityName, entityId);
    }
  
    @Get('user/:userId')
    async getUserActivity(
      @Param('userId') userId: string,
      @Query('days') days: number = 30,
    ) {
      return this.auditLogService.getUserActivity(userId, days);
    }
  
    @Get('statistics')
    async getAuditStatistics(@Query('days') days: number = 30) {
      return this.auditLogService.getAuditStatistics(days);
    }
  
    @Get('report')
    async generateAuditReport(@Query() query: AuditLogQueryDto) {
      return this.auditLogService.generateAuditReport(query);
    }
  
    @Get('export')
    @Header('Content-Type', 'application/json')
    @Header('Content-Disposition', 'attachment; filename="audit-report.json"')
    async exportAuditReport(@Query() query: AuditLogQueryDto): Promise<StreamableFile> {
      const report = await this.auditLogService.generateAuditReport(query);
      const buffer = Buffer.from(JSON.stringify(report, null, 2));
      return new StreamableFile(buffer);
    }
  }