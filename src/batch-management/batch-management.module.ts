import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchManagementService } from './batch-management.service';
import { BatchManagementController } from './batch-management.controller';
import { Batch } from './entities/batch.entity';
import { BatchExpiryNotificationService } from './services/batch-expiry-notification.service';
import { BatchExpiryMonitoringService } from './services/batch-expiry-monitoring.service';

@Module({
  imports: [TypeOrmModule.forFeature([Batch])],
  controllers: [BatchManagementController],
  providers: [
    BatchManagementService,
    BatchExpiryNotificationService,
    BatchExpiryMonitoringService,
  ],
  exports: [BatchManagementService],
})
export class BatchManagementModule {} 