import { IsEnum, IsString, IsObject, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReportType, ReportFormat, ScheduleFrequency } from '../enums/report.enum';
import { ReportConfig } from '../interfaces/report-config.interface';

export class ScheduleReportDto {
  @ApiProperty({ description: 'Schedule name' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ReportType, description: 'Type of report' })
  @IsEnum(ReportType)
  reportType: ReportType;

  @ApiProperty({ enum: ReportFormat, description: 'Export format', required: false })
  @IsEnum(ReportFormat)
  @IsOptional()
  format?: ReportFormat;

  @ApiProperty({ enum: ScheduleFrequency, description: 'Schedule frequency' })
  @IsEnum(ScheduleFrequency)
  frequency: ScheduleFrequency;

  @ApiProperty({ description: 'Report configuration' })
  @IsObject()
  config: ReportConfig;

  @ApiProperty({ description: 'Email recipients', required: false })
  @IsArray()
  @IsOptional()
  recipients?: string[];

  @ApiProperty({ description: 'Is schedule active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
