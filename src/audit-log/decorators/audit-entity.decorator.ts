import { SetMetadata } from '@nestjs/common';

export const AuditEntity = (entityType: string) => SetMetadata('auditEntity', entityType);