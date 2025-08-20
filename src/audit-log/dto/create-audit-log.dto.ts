import { IsEnum, IsOptional, IsString, IsUUID, IsObject, IsBoolean, IsNumber } from 'class-validator';
import { AuditAction, AuditStatus } from '../entities/audit-log.entity';

export class CreateAuditLogDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  userEmail?: string;

  @IsEnum(AuditAction)
  action: AuditAction;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsObject()
  oldValues?: Record<string, any>;

  @IsOptional()
  @IsObject()
  newValues?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsEnum(AuditStatus)
  status?: AuditStatus;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  @IsString()
  endpoint?: string;

  @IsOptional()
  @IsNumber()
  responseTime?: number;

  @IsOptional()
  @IsBoolean()
  isSensitive?: boolean;

  @IsOptional()
  maskedFields?: string[];
}