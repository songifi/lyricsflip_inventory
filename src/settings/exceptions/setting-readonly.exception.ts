import { ForbiddenException } from '@nestjs/common';

export class SettingReadonlyException extends ForbiddenException {
  constructor(key: string) {
    super(`Setting '${key}' is read-only and cannot be modified`);
  }
}
