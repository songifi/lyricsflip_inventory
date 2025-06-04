import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

export class ExportReportDto {
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsOptional()
  @IsString()
  template?: string;
}