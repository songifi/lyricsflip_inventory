import { Injectable, Inject } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TenantContextService } from './tenant-context.service';
import { Tenant } from './entities/tenant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TenantDatabaseService {
  private connections = new Map<string, DataSource>();

  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private tenantContext: TenantContextService
  ) {}

  async getTenantConnection(): Promise<DataSource> {
    const tenantId = this.tenantContext.getTenantId();
    
    if (this.connections.has(tenantId)) {
      return this.connections.get(tenantId);
    }

    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId }
    });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const connectionOptions: DataSourceOptions = {
      type: 'postgres', // or your database type
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: tenant.databaseName,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: false, // Use migrations in production
    };

    const connection = new DataSource(connectionOptions);
    await connection.initialize();
    
    this.connections.set(tenantId, connection);
    return connection;
  }

  async closeTenantConnection(tenantId: string): Promise<void> {
    const connection = this.connections.get(tenantId);
    if (connection) {
      await connection.destroy();
      this.connections.delete(tenantId);
    }
  }
}
