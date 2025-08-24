import { ConflictException } from '@nestjs/common';

export class SettingAlreadyExistsException extends ConflictException {
  constructor(key: string, scope: string, companyId?: string) {
    const message = companyId
      ? `Setting with key '${key}' already exists in ${scope} scope for company '${companyId}'`
      : `Setting with key '${key}' already exists in ${scope} scope`;
    super(message);
  }
}