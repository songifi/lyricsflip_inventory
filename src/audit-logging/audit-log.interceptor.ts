import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { Observable, tap, catchError } from 'rxjs';
  import { AuditLogService } from './audit-log.service';
  import { AUDIT_LOG_KEY, AuditLogOptions } from './audit-log.decorator';
  import { AuditAction, AuditStatus } from './audit-log.entity';
  
  @Injectable()
  export class AuditLogInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuditLogInterceptor.name);
  
    constructor(
      private readonly auditLogService: AuditLogService,
      private readonly reflector: Reflector,
    ) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const auditOptions = this.reflector.get<AuditLogOptions>(
        AUDIT_LOG_KEY,
        context.getHandler(),
      );
  
      if (!auditOptions) {
        return next.handle();
      }
  
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      const sessionId = request.sessionID;
      const ipAddress = request.ip;
      const userAgent = request.get('User-Agent');
      const transactionId = request.headers['x-transaction-id'] || this.generateTransactionId();
      const correlationId = request.headers['x-correlation-id'] || this.generateCorrelationId();
  
      const baseLogData = {
        entityName: auditOptions.entityName,
        action: auditOptions.action as AuditAction,
        userId: user?.id,
        userEmail: user?.email,
        sessionId,
        ipAddress,
        userAgent,
        transactionId,
        correlationId,
        description: auditOptions.description,
        metadata: {
          endpoint: `${request.method} ${request.url}`,
          params: request.params,
          query: request.query,
        },
      };
  
      if (auditOptions.includeRequestBody) {
        baseLogData.metadata.requestBody = request.body;
      }
  
      return next.handle().pipe(
        tap(async (response) => {
          try {
            const logData = {
              ...baseLogData,
              status: AuditStatus.SUCCESS,
              entityId: this.extractEntityId(response, request),
              newValues: auditOptions.includeResponseBody ? response : undefined,
            };
  
            await this.auditLogService.createAuditLog(logData);
          } catch (error) {
            this.logger.error('Failed to create audit log', error.stack);
          }
        }),
        catchError(async (error) => {
          try {
            if (auditOptions.logOnError !== false) {
              const logData = {
                ...baseLogData,
                status: AuditStatus.FAILED,
                errorMessage: error.message,
              };
  
              await this.auditLogService.createAuditLog(logData);
            }
          } catch (auditError) {
            this.logger.error('Failed to create error audit log', auditError.stack);
          }
          throw error;
        }),
      );
    }
  
    private extractEntityId(response: any, request: any): string | undefined {
      // Try to extract entity ID from response or request params
      return response?.id || request.params?.id;
    }
  
    private generateTransactionId(): string {
      return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  
    private generateCorrelationId(): string {
      return `cor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  