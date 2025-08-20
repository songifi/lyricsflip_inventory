import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
  Header,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuditLogService } from '../services/audit-log.service';
import { AuditLogQueryDto } from '../dto/audit-log-query.dto';
import { AuditLogExportDto } from '../dto/audit-log-export.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles('admin', 'auditor')
  @ApiOperation({ summary: 'Get all audit logs with filtering' })
  @ApiResponse({ status: 200, description: 'Returns paginated audit logs' })
  async findAll(@Query() query: AuditLogQueryDto) {
    try {
      return await this.auditLogService.findAll(query);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve audit logs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('search')
  @Roles('admin', 'auditor')
  @ApiOperation({ summary: 'Search audit logs with text search' })
  @ApiResponse({ status: 200, description: 'Returns search results' })
  async search(@Query() query: AuditLogQueryDto) {
    try {
      return await this.auditLogService.search(query);
    } catch (error) {
      throw new HttpException(
        'Failed to search audit logs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('reports')
  @Roles('admin', 'auditor')
  @ApiOperation({ summary: 'Generate audit log report' })
  @ApiResponse({ status: 200, description: 'Returns audit log report' })
  async generateReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    try {
      if (!startDate || !endDate) {
        throw new HttpException(
          'Start date and end date are required',
          HttpStatus.BAD_REQUEST
        );
      }

      return await this.auditLogService.generateReport(
        new Date(startDate),
        new Date(endDate)
      );
    } catch (error) {
      throw new HttpException(
        'Failed to generate report',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('export')
  @Roles('admin', 'auditor')
  @ApiOperation({ summary: 'Export audit logs in various formats' })
  @ApiResponse({ status: 200, description: 'Returns exported data' })
  async exportLogs(
    @Query() exportDto: AuditLogExportDto,
    @Res() res: Response,
  ) {
    try {
      const exportData = await this.auditLogService.exportLogs(exportDto);
      const timestamp = new Date().toISOString().split('T')[0];
      
      switch (exportDto.format) {
        case ExportFormat.CSV:
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${timestamp}.csv"`);
          break;
        case ExportFormat.JSON:
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${timestamp}.json"`);
          break;
        case ExportFormat.XLSX:
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${timestamp}.xlsx"`);
          break;
      }

      res.send(exportData);
    } catch (error) {
      throw new HttpException(
        'Failed to export audit logs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserAuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get(':id/audit-logs')
  @Roles('admin', 'auditor', 'user')
  @ApiOperation({ summary: 'Get audit logs for a specific user' })
  @ApiResponse({ status: 200, description: 'Returns user audit logs' })
  async getUserAuditLogs(
    @Param('id') userId: string,
    @Query() query: AuditLogQueryDto,
  ) {
    try {
      return await this.auditLogService.findByUserId(userId, query);
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve user audit logs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
