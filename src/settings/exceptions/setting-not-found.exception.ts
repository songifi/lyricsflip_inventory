import { NotFoundException } from '@nestjs/common';

export class SettingNotFoundException extends NotFoundException {
  constructor(key: string, companyId?: string) {
    const message = companyId
      ? `Setting with key '${key}' not found for company '${companyId}'`
      : `Setting with key '${key}' not found`;
    super(message);
  }
}



