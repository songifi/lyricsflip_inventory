import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantContextService } from './tenant-context.service';

export interface TenantConfig {
  features: {
    analytics: boolean;
    reporting: boolean;
    multiCurrency: boolean;
  };
  limits: {
    maxUsers: number;
    maxStorage: number;
  };
  customizations: {
    theme: string;
    logo: string;
    brandColors: Record<string, string>;
  };
}

@Injectable()
export class TenantConfigService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private tenantContext: TenantContextService
  ) {}

  async getTenantConfig(): Promise<TenantConfig> {
    const tenantId = this.tenantContext.getTenantId();
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId }
    });

    return tenant?.config || this.getDefaultConfig();
  }

  async updateTenantConfig(config: Partial<TenantConfig>): Promise<void> {
    const tenantId = this.tenantContext.getTenantId();
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId }
    });

    if (tenant) {
      tenant.config = { ...tenant.config, ...config };
      await this.tenantRepository.save(tenant);
    }
  }

  private getDefaultConfig(): TenantConfig {
    return {
      features: {
        analytics: true,
        reporting: true,
        multiCurrency: false
      },
      limits: {
        maxUsers: 100,
        maxStorage: 1000
      },
      customizations: {
        theme: 'default',
        logo: '',
        brandColors: {
          primary: '#007bff',
          secondary: '#6c757d'
        }
      }
    };
  }
}