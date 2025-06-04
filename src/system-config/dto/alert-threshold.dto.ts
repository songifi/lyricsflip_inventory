import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AlertSeverity, AlertCategory } from '../entities/alert-threshold.entity';
import { Type } from 'class-transformer';

export class NotificationConfigDto {
  @ApiProperty({ description: 'Email recipients for notifications' })
  @IsString({ each: true })
  @IsOptional()
  emailRecipients?: string[];

  @ApiProperty({ description: 'SMS recipients for notifications' })
  @IsString({ each: true })
  @IsOptional()
  smsRecipients?: string[];

  @ApiProperty({ description: 'Whether to send push notifications' })
  @IsBoolean()
  @IsOptional()
  sendPushNotification?: boolean;

  @ApiProperty({ description: 'Notification message template' })
  @IsString()
  @IsOptional()
  messageTemplate?: string;
}

export class CreateAlertThresholdDto {
  @ApiProperty({ description: 'Name of the alert threshold' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the alert threshold' })
  @IsString()
  description: string;

  @ApiProperty({ 
    description: 'Category of the alert',
    enum: AlertCategory,
    default: AlertCategory.INVENTORY
  })
  @IsEnum(AlertCategory)
  category: AlertCategory;

  @ApiProperty({ 
    description: 'Severity of the alert',
    enum: AlertSeverity,
    default: AlertSeverity.WARNING
  })
  @IsEnum(AlertSeverity)
  severity: AlertSeverity;

  @ApiProperty({ description: 'Threshold value' })
  @IsNumber()
  threshold: number;

  @ApiProperty({ 
    description: 'Comparison operator',
    default: '>'
  })
  @IsString()
  operator: string;

  @ApiProperty({ description: 'Unit of measurement', required: false })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ description: 'Notification configuration', required: false })
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationConfigDto)
  @IsOptional()
  notificationConfig?: NotificationConfigDto;

  @ApiProperty({ 
    description: 'Whether the alert threshold is active',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateAlertThresholdDto {
  @ApiProperty({ description: 'Name of the alert threshold' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Description of the alert threshold' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Category of the alert',
    enum: AlertCategory
  })
  @IsEnum(AlertCategory)
  @IsOptional()
  category?: AlertCategory;

  @ApiProperty({ 
    description: 'Severity of the alert',
    enum: AlertSeverity
  })
  @IsEnum(AlertSeverity)
  @IsOptional()
  severity?: AlertSeverity;

  @ApiProperty({ description: 'Threshold value' })
  @IsNumber()
  @IsOptional()
  threshold?: number;

  @ApiProperty({ description: 'Comparison operator' })
  @IsString()
  @IsOptional()
  operator?: string;

  @ApiProperty({ description: 'Unit of measurement' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ description: 'Notification configuration' })
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationConfigDto)
  @IsOptional()
  notificationConfig?: NotificationConfigDto;

  @ApiProperty({ description: 'Whether the alert threshold is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
