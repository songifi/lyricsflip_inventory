import { IsOptional, IsEnum, IsUUID, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { SettingScope, SettingCategory } from '../entities/setting.entity';

export class SettingQueryDto {
  @IsOptional()
  @IsEnum(SettingScope)
  scope?: SettingScope;

  @IsOptional()
  @IsEnum(SettingCategory)
  category?: SettingCategory;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeInactive?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeReadonly?: boolean;
}
