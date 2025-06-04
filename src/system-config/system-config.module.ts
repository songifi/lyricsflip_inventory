import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemSettings } from './entities/system-settings.entity';
import { AlertThreshold } from './entities/alert-threshold.entity';
import { IntegrationSettings } from './entities/integration-settings.entity';
import { SystemSettingsService } from './system-settings.service';
import { AlertThresholdService } from './alert-threshold.service';
import { IntegrationSettingsService } from './integration-settings.service';
import { BackupRestoreService } from './backup-restore.service';
import { SystemSettingsController } from './system-settings.controller';
import { AlertThresholdController } from './alert-threshold.controller';
import { IntegrationSettingsController } from './integration-settings.controller';
import { BackupRestoreController } from './backup-restore.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemSettings,
      AlertThreshold,
      IntegrationSettings
    ])
  ],
  controllers: [
    SystemSettingsController,
    AlertThresholdController,
    IntegrationSettingsController,
    BackupRestoreController
  ],
  providers: [
    SystemSettingsService,
    AlertThresholdService,
    IntegrationSettingsService,
    BackupRestoreService
  ],
  exports: [
    SystemSettingsService,
    AlertThresholdService,
    IntegrationSettingsService,
    BackupRestoreService
  ]
})
export class SystemConfigModule {}
