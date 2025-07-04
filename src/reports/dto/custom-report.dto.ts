import { IsString, IsArray, IsObject, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReportFormat } from '../enums/report.enum';
import { CustomReportField } from '../interfaces/report-config.interface';

export class CustomReportDto {
  @ApiProperty({ description: 'Report name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Report fields' })
  @IsArray()
  fields: CustomReportField[];

  @ApiProperty({ description: 'Data source joins', required: false })
  @IsArray()
  @IsOptional()
  joins?: Array<{
    table: string;
    on: string;
    type: 'inner' | 'left' | 'right';
  }>;

  @ApiProperty({ description: 'Filters', required: false })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;

  @ApiProperty({ description: 'Group by fields', required: false })
  @IsArray()
  @IsOptional()
  groupBy?: string[];

  @ApiProperty({ enum: ReportFormat, description: 'Export format', required: false })
  @IsEnum(ReportFormat)
  @IsOptional()
  format?: ReportFormat;
}
