import { IsOptional, IsString } from 'class-validator';

export class UpdateSettingValueDto {
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

