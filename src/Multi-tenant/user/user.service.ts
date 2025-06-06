import { Injectable } from '@nestjs/common';
import { TenantDatabaseService } from '../tenant/tenant-database.service';
import { TenantContextService } from '../tenant/tenant-context.service';

@Injectable()
export class UserService {
  constructor(
    private tenantDbService: TenantDatabaseService,
    private tenantContext: TenantContextService
  ) {}

  async findAll() {
    const connection = await this.tenantDbService.getTenantConnection();
    const userRepository = connection.getRepository('User');
    return userRepository.find();
  }

  async create(userData: any) {
    const connection = await this.tenantDbService.getTenantConnection();
    const userRepository = connection.getRepository('User');
    
    // Add tenant context to user data
    const userWithTenant = {
      ...userData,
      tenantId: this.tenantContext.getTenantId()
    };
    
    return userRepository.save(userWithTenant);
  }
}

// 14. ENVIRONMENT CONFIGURATION
// .env
DATABASE_URL=postgresql://user:password@localhost:5432/main_db
TENANT_RESOLVER=domain # or 'header'
JWT_SECRET=your-jwt-secret
