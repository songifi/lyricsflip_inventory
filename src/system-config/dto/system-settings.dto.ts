import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json'
}

export enum SettingCategory {
  SYSTEM = 'system',
  SECURITY = 'security',
  NOTIFICATION = 'notification',
  UI = 'ui',
  PERFORMANCE = 'performance',
  CUSTOM = 'custom'
}

export class CreateSystemSettingDto {
  @ApiProperty({ description: 'Unique key for the setting' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'Value of the setting' })
  @IsString()
  value: string;

  @ApiProperty({ description: 'Description of the setting', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Type of the setting value', 
    enum: SettingType,
    default: SettingType.STRING
  })
  @IsEnum(SettingType)
  @IsOptional()
  type?: string;

  @ApiProperty({ 
    description: 'Whether the setting contains sensitive information',
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isSecret?: boolean;

  @ApiProperty({ 
    description: 'Whether the setting can be edited',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isEditable?: boolean;

  @ApiProperty({ 
    description: 'Category of the setting',
    enum: SettingCategory,
    default: SettingCategory.SYSTEM
  })
  @IsEnum(SettingCategory)
  @IsOptional()
  category?: string;
}

export class UpdateSystemSettingDto {
  @ApiProperty({ description: 'Value of the setting' })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiProperty({ description: 'Description of the setting', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Whether the setting contains sensitive information',
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isSecret?: boolean;

  @ApiProperty({ 
    description: 'Whether the setting can be edited',
    default: true
  })
  @IsBoolean()
  @IsOptional()
  isEditable?: boolean;

  @ApiProperty({ 
    description: 'Category of the setting',
    enum: SettingCategory
  })
  @IsEnum(SettingCategory)
  @IsOptional()
  category?: string;
}
