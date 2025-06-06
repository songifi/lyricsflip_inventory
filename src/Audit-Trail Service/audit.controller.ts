import { Controller, Get, Query, Param } from '@nestjs/common';
import { AuditService, AuditReportFilter } from './audit.service';
import { AuditAction, AuditEntityType } from './audit-log.entity';

@Controller('audit')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get('trail/:entityType/:entityId')
  async getAuditTrail(
    @Param('entityType') entityType: AuditEntityType,
    @Param('entityId') entityId: string,
    @Query('limit') limit?: number,
  ) {
    return await this.auditService.getAuditTrail(
      entityType,
      entityId,
      limit ? parseInt(limit.toString()) : 50,
    );
  }

  @Get('user/:userId')
  async getUserActions(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.auditService.getUserActions(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('report')
  async generateReport(@Query() filter: AuditReportFilter) {
    const reportFilter: AuditReportFilter = {
      startDate: filter.startDate ? new Date(filter.startDate) : undefined,
      endDate: filter.endDate ? new Date(filter.endDate) : undefined,
      userId: filter.userId,
      action: filter.action,
      entityType: filter.entityType,
      entityId: filter.entityId,
      success: filter.success !== undefined ? filter.success === 'true' : undefined,
    };

    return await this.auditService.generateAuditReport(reportFilter);
  }

  @Get('export')
  async exportAuditLogs(@Query() filter: AuditReportFilter) {
    const report = await this.auditService.generateAuditReport(filter);
    
    // Convert to CSV format
    const csvHeaders = [
      'Timestamp',
      'Action',
      'Entity Type',
      'Entity ID',
      'User Email',
      'IP Address',
      'Success',
      'Changes',
      'Reason',
    ];

    const csvRows = report.logs.map(log => [
      log.timestamp.toISOString(),
      log.action,
      log.entityType,
      log.entityId,
      log.userEmail || '',
      log.ipAddress,
      log.success,
      log.changes ? JSON.stringify(log.changes) : '',
      log.reason || '',
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return {
      content: csvContent,
      filename: `audit_report_${new Date().toISOString().split('T')[0]}.csv`,
      summary: report.summary,
    };
  }
}
