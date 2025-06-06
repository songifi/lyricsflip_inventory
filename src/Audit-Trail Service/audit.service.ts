import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog, AuditAction, AuditEntityType } from './audit-log.entity';

export interface AuditLogData {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  userId?: string;
  userEmail?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent?: string;
  oldValues?: any;
  newValues?: any;
  reason?: string;
  transactionId?: string;
  metadata?: any;
  success?: boolean;
  errorMessage?: string;
}

export interface AuditReportFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: AuditAction;
  entityType?: AuditEntityType;
  entityId?: string;
  success?: boolean;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async logAction(data: AuditLogData): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      ...data,
      changes: this.calculateChanges(data.oldValues, data.newValues),
      success: data.success ?? true,
    });

    return await this.auditLogRepository.save(auditLog);
  }

  async getAuditTrail(
    entityType: AuditEntityType,
    entityId: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return await this.auditLogRepository.find({
      where: { entityType, entityId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getUserActions(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AuditLog[]> {
    const where: any = { userId };
    
    if (startDate && endDate) {
      where.timestamp = Between(startDate, endDate);
    }

    return await this.auditLogRepository.find({
      where,
      order: { timestamp: 'DESC' },
    });
  }

  async generateAuditReport(filter: AuditReportFilter): Promise<{
    logs: AuditLog[];
    summary: {
      totalActions: number;
      successfulActions: number;
      failedActions: number;
      actionBreakdown: Record<string, number>;
      userBreakdown: Record<string, number>;
    };
  }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    if (filter.startDate && filter.endDate) {
      queryBuilder.andWhere('audit.timestamp BETWEEN :startDate AND :endDate', {
        startDate: filter.startDate,
        endDate: filter.endDate,
      });
    }

    if (filter.userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId: filter.userId });
    }

    if (filter.action) {
      queryBuilder.andWhere('audit.action = :action', { action: filter.action });
    }

    if (filter.entityType) {
      queryBuilder.andWhere('audit.entityType = :entityType', { 
        entityType: filter.entityType 
      });
    }

    if (filter.entityId) {
      queryBuilder.andWhere('audit.entityId = :entityId', { 
        entityId: filter.entityId 
      });
    }

    if (filter.success !== undefined) {
      queryBuilder.andWhere('audit.success = :success', { 
        success: filter.success 
      });
    }

    queryBuilder.orderBy('audit.timestamp', 'DESC');

    const logs = await queryBuilder.getMany();

    // Generate summary
    const totalActions = logs.length;
    const successfulActions = logs.filter(log => log.success).length;
    const failedActions = totalActions - successfulActions;

    const actionBreakdown = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const userBreakdown = logs.reduce((acc, log) => {
      if (log.userEmail) {
        acc[log.userEmail] = (acc[log.userEmail] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      logs,
      summary: {
        totalActions,
        successfulActions,
        failedActions,
        actionBreakdown,
        userBreakdown,
      },
    };
  }

  private calculateChanges(oldValues: any, newValues: any): any {
    if (!oldValues || !newValues) return null;

    const changes: any = {};
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

    for (const key of allKeys) {
      if (oldValues[key] !== newValues[key]) {
        changes[key] = {
          from: oldValues[key],
          to: newValues[key],
        };
      }
    }

    return Object.keys(changes).length > 0 ? changes : null;
  }
}