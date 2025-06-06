import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column()
  domain: string;

  @Column({ name: 'database_name' })
  databaseName: string;

  @Column({ type: 'json', nullable: true })
  config: Record<string, any>;

  @Column({
    type: 'enum',
    enum: TenantStatus,
    default: TenantStatus.ACTIVE
  })
  status: TenantStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// 2. TENANT CONTEXT SERVICE
// src/tenant/tenant-context.service.ts
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  private tenantId: string;

  setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  hasTenant(): boolean {
    return !!this.tenantId;
  }
}

// 3. TENANT RESOLVER INTERFACE
// src/tenant/interfaces/tenant-resolver.interface.ts
export interface ITenantResolver {
  resolveTenant(request: any): Promise<string | null>;
}

// 4. DOMAIN-BASED TENANT RESOLVER
// src/tenant/resolvers/domain-tenant.resolver.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITenantResolver } from '../interfaces/tenant-resolver.interface';
import { Tenant } from './tenant.entity';

@Injectable()
export class DomainTenantResolver implements ITenantResolver {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>
  ) {}

  async resolveTenant(request: any): Promise<string | null> {
    const host = request.headers?.host || request.get?.('host');
    if (!host) return null;

    const domain = host.split(':')[0]; // Remove port if present
    const tenant = await this.tenantRepository.findOne({
      where: { domain, status: 'active' }
    });

    return tenant?.id || null;
  }
}

// 5. HEADER-BASED TENANT RESOLVER
// src/tenant/resolvers/header-tenant.resolver.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITenantResolver } from '../interfaces/tenant-resolver.interface';
import { Tenant } from './tenant.entity';

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