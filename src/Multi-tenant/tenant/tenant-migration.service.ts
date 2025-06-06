import { Injectable } from '@nestjs/common';
import { TenantDatabaseService } from './tenant-database.service';
import { Repository } from 'typeorm';

export interface MigrationOptions {
  fromTenantId: string;
  toTenantId: string;
  entities: string[];
  includeData: boolean;
  transformData?: (data: any) => any;
}

@Injectable()
export class TenantMigrationService {
  constructor(
    private tenantDbService: TenantDatabaseService
  ) {}

  async migrateTenantData(options: MigrationOptions): Promise<void> {
    const sourceConnection = await this.getTenantConnectionById(options.fromTenantId);
    const targetConnection = await this.getTenantConnectionById(options.toTenantId);

    for (const entityName of options.entities) {
      await this.migrateEntity(
        sourceConnection.getRepository(entityName),
        targetConnection.getRepository(entityName),
        options
      );
    }
  }

  private async migrateEntity(
    sourceRepo: Repository<any>,
    targetRepo: Repository<any>,
    options: MigrationOptions
  ): Promise<void> {
    if (!options.includeData) return;

    const data = await sourceRepo.find();
    
    for (const record of data) {
      const transformedRecord = options.transformData 
        ? options.transformData(record) 
        : record;
      
      // Remove ID to allow auto-generation
      delete transformedRecord.id;
      
      await targetRepo.save(transformedRecord);
    }
  }

  private async getTenantConnectionById(tenantId: string) {
    // Temporarily set tenant context to get connection
    const originalTenantId = this.tenantDbService['tenantContext'].getTenantId();
    this.tenantDbService['tenantContext'].setTenantId(tenantId);
    
    const connection = await this.tenantDbService.getTenantConnection();
    
    // Restore original tenant context
    this.tenantDbService['tenantContext'].setTenantId(originalTenantId);
    
    return connection;
  }
}