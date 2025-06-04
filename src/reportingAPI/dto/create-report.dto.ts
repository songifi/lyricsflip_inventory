import { IsEnum, IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';
import { ReportType } from '../entities/report.entity';

export class CreateReportDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(ReportType)
  type: ReportType;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @IsOptional()
  @IsString()
  userId?: string;
}