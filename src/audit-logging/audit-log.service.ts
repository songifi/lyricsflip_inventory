import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { AuditLog, AuditAction, AuditStatus } from './audit-log.entity';
import { CreateAuditLogDto, AuditLogQueryDto } from './audit-log.dto';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async createAuditLog(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const auditLog = this.auditLogRepository.create(createAuditLogDto);
      return await this.auditLogRepository.save(auditLog);
    } catch (error) {
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAuditLogs(query: AuditLogQueryDto): Promise<{
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 50, startDate, endDate, sortBy = 'createdAt', sortOrder = 'DESC', ...filters } = query;

    const where: FindOptionsWhere<AuditLog> = {};

    // Apply filters
    if (filters.entityName) where.entityName = filters.entityName;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    if (filters.sessionId) where.sessionId = filters.sessionId;

    // Date range filter
    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.createdAt = new Date(startDate);
    }

    const [data, total] = await this.auditLogRepository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAuditTrail(entityName: string, entityId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { entityName, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserActivity(userId: string, days: number = 30): Promise<AuditLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.auditLogRepository.find({
      where: {
        userId,
        createdAt: Between(startDate, new Date()),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getAuditStatistics(days: number = 30): Promise<{
    totalActions: number;
    actionBreakdown: Record<string, number>;
    userActivity: Record<string, number>;
    dailyActivity: Record<string, number>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.auditLogRepository.find({
      where: {
        createdAt: Between(startDate, new Date()),
      },
    });

    const totalActions = logs.length;
    const actionBreakdown = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const userActivity = logs.reduce((acc, log) => {
      if (log.userId) {
        acc[log.userId] = (acc[log.userId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const dailyActivity = logs.reduce((acc, log) => {
      const date = log.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalActions,
      actionBreakdown,
      userActivity,
      dailyActivity,
    };
  }

  async generateAuditReport(query: AuditLogQueryDto): Promise<{
    summary: any;
    logs: AuditLog[];
    metadata: any;
  }> {
    const result = await this.findAuditLogs(query);
    const statistics = await this.getAuditStatistics();

    return {
      summary: {
        totalLogs: result.total,
        dateRange: {
          from: query.startDate,
          to: query.endDate,
        },
        filters: query,
        statistics,
      },
      logs: result.data,
      metadata: {
        generatedAt: new Date(),
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }
}