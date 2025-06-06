import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditInterceptor } from './audit.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditService, AuditInterceptor],
  controllers: [AuditController],
  exports: [AuditService, AuditInterceptor],
})
export class AuditModule {}

// Example usage in inventory.service.ts
import { Injectable } from '@nestjs/common';
import { AuditService } from './audit/audit.service';
import { AuditAction, AuditEntityType } from './audit/audit-log.entity';

@Injectable()
export class InventoryService {
  constructor(private auditService: AuditService) {}

  async performStockTransfer(fromId: string, toId: string, quantity: number, userId: string) {
    const transactionId = `transfer_${Date.now()}`;

    try {
      // Perform the transfer logic here
      const result = await this.executeTransfer(fromId, toId, quantity);

      // Log successful transfer
      await this.auditService.logAction({
        action: AuditAction.TRANSFER,
        entityType: AuditEntityType.STOCK_MOVEMENT,
        entityId: result.id,
        userId,
        transactionId,
        newValues: {
          fromId,
          toId,
          quantity,
          transferDate: new Date(),
        },
        reason: 'Stock transfer between locations',
        ipAddress: '127.0.0.1', // Get from request context
        success: true,
      });

      return result;
    } catch (error) {
      // Log failed transfer
      await this.auditService.logAction({
        action: AuditAction.TRANSFER,
        entityType: AuditEntityType.STOCK_MOVEMENT,
        entityId: `${fromId}_${toId}`,
        userId,
        transactionId,
        success: false,
        errorMessage: error.message,
        ipAddress: '127.0.0.1',
      });

      throw error;
    }
  }

  private async executeTransfer(fromId: string, toId: string, quantity: number) {
    // Transfer implementation
    return { id: 'transfer_123', success: true };
  }
}