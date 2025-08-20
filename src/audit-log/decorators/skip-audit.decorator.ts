import { SetMetadata } from '@nestjs/common';

export const SkipAudit = () => SetMetadata('skipAudit', true);