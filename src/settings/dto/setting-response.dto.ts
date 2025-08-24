import { SettingScope, SettingType, SettingCategory } from '../entities/setting.entity';

export class SettingResponseDto {
  id: string;
  key: string;
  value: string;
  parsedValue: any;
  type: SettingType;
  scope: SettingScope;
  category: SettingCategory;
  companyId?: string;
  description?: string;
  validation?: any;
  metadata?: Record<string, any>;
  isActive: boolean;
  isReadonly: boolean;
  defaultValue?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

