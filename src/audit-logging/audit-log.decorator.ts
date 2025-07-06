import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_KEY = 'auditLog';

export interface AuditLogOptions {
  entityName: string;
  action: string;
  description?: string;
  includeRequestBody?: boolean;
  includeResponseBody?: boolean;
  logOnError?: boolean;
}

export const AuditLog = (options: AuditLogOptions) => SetMetadata(AUDIT_LOG_KEY, options);
