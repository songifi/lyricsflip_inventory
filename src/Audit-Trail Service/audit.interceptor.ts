import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap, catchError } from 'rxjs/operators';
  import { AuditService } from './audit.service';
  import { AuditAction, AuditEntityType } from './audit-log.entity';
  import { Reflector } from '@nestjs/core';
  
  export const AUDIT_METADATA_KEY = 'audit';
  
  export interface AuditMetadata {
    action: AuditAction;
    entityType: AuditEntityType;
    getEntityId?: (result: any, request: any) => string;
    reason?: string;
  }
  
  @Injectable()
  export class AuditInterceptor implements NestInterceptor {
    constructor(
      private auditService: AuditService,
      private reflector: Reflector,
    ) {}
  
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const auditMetadata = this.reflector.get<AuditMetadata>(
        AUDIT_METADATA_KEY,
        context.getHandler(),
      );
  
      if (!auditMetadata) {
        return next.handle();
      }
  
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      const transactionId = request.headers['x-transaction-id'] || 
                           `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
      return next.handle().pipe(
        tap(async (result) => {
          const entityId = auditMetadata.getEntityId
            ? auditMetadata.getEntityId(result, request)
            : request.params.id || result?.id;
  
          await this.auditService.logAction({
            action: auditMetadata.action,
            entityType: auditMetadata.entityType,
            entityId,
            userId: user?.id,
            userEmail: user?.email,
            sessionId: request.sessionID,
            ipAddress: request.ip,
            userAgent: request.get('User-Agent'),
            oldValues: request.body?.oldValues,
            newValues: request.body?.newValues || request.body,
            reason: auditMetadata.reason || request.body?.reason,
            transactionId,
            metadata: {
              endpoint: request.route?.path,
              method: request.method,
              params: request.params,
              query: request.query,
            },
            success: true,
          });
        }),
        catchError(async (error) => {
          const entityId = request.params.id;
  
          await this.auditService.logAction({
            action: auditMetadata.action,
            entityType: auditMetadata.entityType,
            entityId,
            userId: user?.id,
            userEmail: user?.email,
            sessionId: request.sessionID,
            ipAddress: request.ip,
            userAgent: request.get('User-Agent'),
            transactionId,
            success: false,
            errorMessage: error.message,
            metadata: {
              endpoint: request.route?.path,
              method: request.method,
              params: request.params,
              query: request.query,
            },
          });
  
          throw error;
        }),
      );
    }
  }
  