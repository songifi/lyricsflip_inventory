mport { Inject } from '@nestjs/common';
import { TenantDatabaseService } from '../tenant-database.service';

export const InjectTenantRepository = (entity: any) => {
  return (target: any, key: string, index?: number) => {
    const repository = async (tenantDbService: TenantDatabaseService) => {
      const connection = await tenantDbService.getTenantConnection();
      return connection.getRepository(entity);
    };
    
    Inject(TenantDatabaseService)(target, key, index);
  };
};
