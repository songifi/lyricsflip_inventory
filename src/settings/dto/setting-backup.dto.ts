import { IsArray, IsOptional, IsString } from 'class-validator';
import { SettingResponseDto } from './setting-response.dto';
import { CreateSettingDto } from './create-setting.dto';

export class SettingsBackupDto {
  @IsArray()
  settings: SettingResponseDto[];

  @IsString()
  version: string;

  @IsString()
  createdAt: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class RestoreSettingsDto {
  @IsArray()
  settings: CreateSettingDto[];

  @IsOptional()
  @IsString()
  reason?: string;
}