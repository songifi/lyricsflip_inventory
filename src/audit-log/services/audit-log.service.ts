import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindManyOptions } from 'typeorm';
import { AuditLog, AuditAction, AuditStatus } from '../entities/audit-log.entity';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';
import { AuditLogQueryDto } from '../dto/audit-log-query.dto';
import { AuditLogExportDto, ExportFormat } from '../dto/audit-log-export.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);
  private readonly sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'creditCard'];

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    try {
      // Mask sensitive data
      const maskedData = this.maskSensitiveData(createAuditLogDto);
      
      // Set retention date (90 days by default)
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() + 90);

      const auditLog = this.auditLogRepository.create({
        ...maskedData,
        retentionDate,
      });

      return await this.auditLogRepository.save(auditLog);
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
      throw error;
    }
  }

  async findAll(query: AuditLogQueryDto): Promise<{ data: AuditLog[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', ...filters } = query;
    
    const whereClause: any = {};
    
    if (filters.userId) whereClause.userId = filters.userId;
    if (filters.userEmail) whereClause.userEmail = Like(`%${filters.userEmail}%`);
    if (filters.action) whereClause.action = filters.action;
    if (filters.entityType) whereClause.entityType = filters.entityType;
    if (filters.entityId) whereClause.entityId = filters.entityId;
    if (filters.status) whereClause.status = filters.status;
    if (filters.module) whereClause.module = filters.module;

    if (filters.startDate || filters.endDate) {
      whereClause.createdAt = Between(
        filters.startDate ? new Date(filters.startDate) : new Date(0),
        filters.endDate ? new Date(filters.endDate) : new Date()
      );
    }

    const findOptions: FindManyOptions<AuditLog> = {
      where: whereClause,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    };

    const [data, total] = await this.auditLogRepository.findAndCount(findOptions);

    return { data, total, page, limit };
  }

  async search(query: AuditLogQueryDto): Promise<{ data: AuditLog[]; total: number }> {
    const { search, ...filters } = query;
    
    if (!search) {
      const result = await this.findAll(filters);
      return { data: result.data, total: result.total };
    }

    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    
    queryBuilder.where(
      '(audit.userEmail ILIKE :search OR audit.entityType ILIKE :search OR audit.module ILIKE :search OR audit.endpoint ILIKE :search)',
      { search: `%${search}%` }
    );

    // Apply additional filters
    if (filters.userId) queryBuilder.andWhere('audit.userId = :userId', { userId: filters.userId });
    if (filters.action) queryBuilder.andWhere('audit.action = :action', { action: filters.action });
    if (filters.startDate) queryBuilder.andWhere('audit.createdAt >= :startDate', { startDate: filters.startDate });
    if (filters.endDate) queryBuilder.andWhere('audit.createdAt <= :endDate', { endDate: filters.endDate });

    queryBuilder.orderBy('audit.createdAt', 'DESC');
    queryBuilder.limit(filters.limit || 10);
    queryBuilder.offset(((filters.page || 1) - 1) * (filters.limit || 10));

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total };
  }

  async findByUserId(userId: string, query: AuditLogQueryDto): Promise<{ data: AuditLog[]; total: number }> {
    return this.findAll({ ...query, userId });
  }

  async generateReport(startDate: Date, endDate: Date): Promise<any> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    
    queryBuilder.where('audit.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });

    const [logs, total] = await queryBuilder.getManyAndCount();

    // Generate summary statistics
    const actionStats = await queryBuilder
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action')
      .getRawMany();

    const statusStats = await queryBuilder
      .select('audit.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.status')
      .getRawMany();

    const moduleStats = await queryBuilder
      .select('audit.module', 'module')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.module')
      .getRawMany();

    return {
      period: { startDate, endDate },
      summary: {
        totalLogs: total,
        actionBreakdown: actionStats,
        statusBreakdown: statusStats,
        moduleBreakdown: moduleStats,
      },
      logs: logs.slice(0, 1000), // Limit detailed logs in report
    };
  }

  async exportLogs(exportDto: AuditLogExportDto): Promise<string> {
    const { format, ...query } = exportDto;
    const { data } = await this.findAll(query);

    switch (format) {
      case ExportFormat.CSV:
        return this.exportToCsv(data);
      case ExportFormat.JSON:
        return JSON.stringify(data, null, 2);
      case ExportFormat.XLSX:
        return this.exportToXlsx(data);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private exportToCsv(logs: AuditLog[]): string {
    if (logs.length === 0) return '';

    const headers = [
      'id', 'userId', 'userEmail', 'action', 'entityType', 'entityId',
      'ipAddress', 'userAgent', 'status', 'module', 'endpoint', 'createdAt'
    ];

    const csvRows = [
      headers.join(','),
      ...logs.map(log => headers.map(header => {
        const value = log[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(','))
    ];

    return csvRows.join('\n');
  }

  private exportToXlsx(logs: AuditLog[]): string {
    // In a real implementation, you would use a library like 'xlsx'
    // For now, returning a placeholder
    return 'XLSX export functionality requires xlsx library implementation';
  }

  private maskSensitiveData(data: CreateAuditLogDto): CreateAuditLogDto {
    const masked = { ...data };
    const maskedFields: string[] = [];

    if (masked.oldValues) {
      masked.oldValues = this.maskObject(masked.oldValues, maskedFields);
    }

    if (masked.newValues) {
      masked.newValues = this.maskObject(masked.newValues, maskedFields);
    }

    if (maskedFields.length > 0) {
      masked.maskedFields = maskedFields;
      masked.isSensitive = true;
    }

    return masked;
  }

  private maskObject(obj: Record<string, any>, maskedFields: string[]): Record<string, any> {
    const masked = { ...obj };

    Object.keys(masked).forEach(key => {
      if (this.isSensitiveField(key)) {
        masked[key] = '***MASKED***';
        maskedFields.push(key);
      } else if (typeof masked[key] === 'object' && masked[key] !== null) {
        masked[key] = this.maskObject(masked[key], maskedFields);
      }
    });

    return masked;
  }

  private isSensitiveField(fieldName: string): boolean {
    return this.sensitiveFields.some(sensitive => 
      fieldName.toLowerCase().includes(sensitive.toLowerCase())
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupExpiredLogs(): Promise<void> {
    try {
      const result = await this.auditLogRepository
        .createQueryBuilder()
        .delete()
        .where('retentionDate < :now', { now: new Date() })
        .execute();

      this.logger.log(`Cleaned up ${result.affected} expired audit logs`);
    } catch (error) {
      this.logger.error('Failed to cleanup expired audit logs', error);
    }
  }

  async logActivity(
    userId: string,
    action: AuditAction,
    entityType?: string,
    entityId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    metadata?: Record<string, any>,
    request?: any
  ): Promise<void> {
    const auditLogDto: CreateAuditLogDto = {
      userId,
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
      metadata,
      ipAddress: request?.ip,
      userAgent: request?.get('user-agent'),
      module: request?.route?.path?.split('/')[1],
      endpoint: `${request?.method} ${request?.route?.path}`,
      status: AuditStatus.SUCCESS,
    };

    await this.create(auditLogDto);
  }
}
