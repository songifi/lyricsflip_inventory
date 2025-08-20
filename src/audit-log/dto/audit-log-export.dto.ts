import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { AuditLogQueryDto } from './audit-log-query.dto';

export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  XLSX = 'xlsx',
}

export class AuditLogExportDto extends AuditLogQueryDto {
  @IsEnum(ExportFormat)
  format: ExportFormat = ExportFormat.CSV;

  @IsOptional()
  @IsDateString()
  exportStartDate?: string;

  @IsOptional()
  @IsDateString()
  exportEndDate?: string;
}