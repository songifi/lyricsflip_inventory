import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITenantResolver } from '../interfaces/tenant-resolver.interface';
import { Tenant } from '../entities/tenant.entity';

@Injectable()
export class HeaderTenantResolver implements ITenantResolver {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>
  ) {}

  async resolveTenant(request: any): Promise<string | null> {
    const tenantCode = request.headers?.['x-tenant-id'] || 
                      request.headers?.['X-Tenant-ID'];
    
    if (!tenantCode) return null;

    const tenant = await this.tenantRepository.findOne({
      where: { code: tenantCode, status: 'active' }
    });

    return tenant?.id || null;
  }
}
