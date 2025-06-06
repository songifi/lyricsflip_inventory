import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantContextService } from './tenant-context.service';
import { TenantDatabaseService } from './tenant-database.service';
import { TenantConfigService } from './tenant-config.service';
import { TenantMigrationService } from './tenant-migration.service';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { DomainTenantResolver } from './resolvers/domain-tenant.resolver';
import { HeaderTenantResolver } from './resolvers/header-tenant.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant])
  ],
  providers: [
    TenantContextService,
    TenantDatabaseService,
    TenantConfigService,
    TenantMigrationService,
    {
      provide: 'TENANT_RESOLVER',
      useClass: process.env.TENANT_RESOLVER === 'domain' 
        ? DomainTenantResolver 
        : HeaderTenantResolver
    }
  ],
  exports: [
    TenantContextService,
    TenantDatabaseService,
    TenantConfigService,
    TenantMigrationService
  ]
})
export class TenantModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}
