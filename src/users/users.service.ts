import { Injectable } from '@nestjs/common';
import { AuditLogService } from '../audit-log/services/audit-log.service';
import { AuditAction } from '../audit-log/entities/audit-log.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly auditLogService: AuditLogService,
    // Other dependencies...
  ) {}

  async updateUser(id: string, updateData: any, currentUser: any): Promise<any> {
    const oldUser = await this.findById(id);
    
    // Perform the update
    const updatedUser = await this.update(id, updateData);

    // Manual audit logging for complex operations
    await this.auditLogService.logActivity(
      currentUser.id,
      AuditAction.UPDATE,
      'User',
      id,
      oldUser,
      updatedUser,
      { reason: 'User profile update' }
    );

    return updatedUser;
  }
}
