import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditLogService } from '../services/audit-log.service';
import { AuditAction, AuditStatus } from '../entities/audit-log.entity';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const startTime = Date.now();

    // Check if audit logging is disabled for this endpoint
    const skipAudit = this.reflector.get<boolean>('skipAudit', context.getHandler());
    if (skipAudit) {
      return next.handle();
    }

    const auditAction = this.getAuditAction(request.method);
    const entityType = this.getEntityType(request.route?.path);

    return next.handle().pipe(
      tap(async (response) => {
        try {
          const responseTime = Date.now() - startTime;
          
          await this.auditLogService.logActivity(
            user?.id,
            auditAction,
            entityType,
            request.params?.id,
            request.method === 'PUT' || request.method === 'PATCH' ? request.body : undefined,
            response,
            {
              responseTime,
              statusCode: context.switchToHttp().getResponse().statusCode,
              params: request.params,
              query: request.query,
            },
            request
          );
        } catch (error) {
          this.logger.error('Failed to log audit activity', error);
        }
      }),
      catchError(async (error) => {
        try {
          const responseTime = Date.now() - startTime;
          
          await this.auditLogService.create({
            userId: user?.id,
            userEmail: user?.email,
            action: auditAction,
            entityType,
            entityId: request.params?.id,
            ipAddress: request.ip,
            userAgent: request.get('user-agent'),
            module: request.route?.path?.split('/')[1],
            endpoint: `${request.method} ${request.route?.path}`,
            status: AuditStatus.FAILED,
            errorMessage: error.message,
            responseTime,
            metadata: {
              statusCode: error.status || 500,
              params: request.params,
              query: request.query,
            },
          });
        } catch (auditError) {
          this.logger.error('Failed to log audit error', auditError);
        }
        
        throw error;
      })
    );
  }

  private getAuditAction(method: string): AuditAction {
    switch (method.toUpperCase()) {
      case 'POST':
        return AuditAction.CREATE;
      case 'GET':
        return AuditAction.READ;
      case 'PUT':
      case 'PATCH':
        return AuditAction.UPDATE;
      case 'DELETE':
        return AuditAction.DELETE;
      default:
        return AuditAction.READ;
    }
  }

  private getEntityType(path: string): string {
    if (!path) return 'unknown';
    const segments = path.split('/').filter(Boolean);
    return segments[0] || 'unknown';
  }
}
