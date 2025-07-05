import { IsEnum, IsOptional, IsString, IsObject, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReportType, ReportFormat } from '../enums/report.enum';
import { ReportConfig } from '../interfaces/report-config.interface';

export class CreateReportDto {
  @ApiProperty({ description: 'Report name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ReportType, description: 'Type of report' })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({ enum: ReportFormat, description: 'Export format', required: false })
  @IsEnum(ReportFormat)
  @IsOptional()
  format?: ReportFormat;

  @ApiProperty({ description: 'Report configuration', required: false })
  @IsObject()
  @IsOptional()
  config?: ReportConfig;

  @ApiProperty({ description: 'Report expiration date', required: false })
  @IsDateString()
  @IsOptional()
  expiresAt?: Date;
}
