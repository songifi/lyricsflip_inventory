import { IsNotEmpty, IsString, IsEnum, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { ScheduleFrequency } from '../entities/report-schedule.entity';

export class CreateReportScheduleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  reportId: string;

  @IsEnum(ScheduleFrequency)
  frequency: ScheduleFrequency;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @IsOptional()
  @IsString()
  cronExpression?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsNotEmpty()
  @IsString()
  userId: string;
}