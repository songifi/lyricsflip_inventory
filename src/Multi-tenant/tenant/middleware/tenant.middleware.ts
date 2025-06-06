import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContextService } from '../tenant-context.service';
import { ITenantResolver } from '../interfaces/tenant-resolver.interface';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    private tenantContext: TenantContextService,
    private tenantResolver: ITenantResolver
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = await this.tenantResolver.resolveTenant(req);
    
    if (!tenantId) {
      throw new BadRequestException('Tenant not found or invalid');
    }

    this.tenantContext.setTenantId(tenantId);
    next();
  }
}
