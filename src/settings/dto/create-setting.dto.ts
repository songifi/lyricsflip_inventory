import {
  IsEnum,
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  MaxLength,
  IsObject,
} from 'class-validator';
import { SettingScope, SettingType, SettingCategory } from '../entities/setting.entity';

export class CreateSettingDto {
  @IsString()
  @MaxLength(255)
  key: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsEnum(SettingType)
  type: SettingType;

  @IsEnum(SettingScope)
  scope: SettingScope;

  @IsEnum(SettingCategory)
  category: SettingCategory;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsObject()
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    options?: string[];
  };

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isReadonly?: boolean;

  @IsOptional()
  @IsString()
  defaultValue?: string;
}



