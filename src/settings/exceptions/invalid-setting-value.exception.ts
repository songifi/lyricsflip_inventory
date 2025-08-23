import { BadRequestException } from '@nestjs/common';

export class InvalidSettingValueException extends BadRequestException {
  constructor(key: string, reason: string) {
    super(`Invalid value for setting '${key}': ${reason}`);
  }
}
