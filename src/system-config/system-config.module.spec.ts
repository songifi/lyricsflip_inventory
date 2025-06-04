import { Test } from '@nestjs/testing';
import { SystemConfigModule } from './system-config.module';
import { SystemSettingsService } from './system-settings.service';
import { AlertThresholdService } from './alert-threshold.service';
import { IntegrationSettingsService } from './integration-settings.service';
import { BackupRestoreService } from './backup-restore.service';

describe('SystemConfigModule', () => {
  let systemSettingsService: SystemSettingsService;
  let alertThresholdService: AlertThresholdService;
  let integrationSettingsService: IntegrationSettingsService;
  let backupRestoreService: BackupRestoreService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [SystemConfigModule],
    }).compile();

    systemSettingsService = moduleRef.get<SystemSettingsService>(SystemSettingsService);
    alertThresholdService = moduleRef.get<AlertThresholdService>(AlertThresholdService);
    integrationSettingsService = moduleRef.get<IntegrationSettingsService>(IntegrationSettingsService);
    backupRestoreService = moduleRef.get<BackupRestoreService>(BackupRestoreService);
  });

  it('should provide SystemSettingsService', () => {
    expect(systemSettingsService).toBeDefined();
  });

  it('should provide AlertThresholdService', () => {
    expect(alertThresholdService).toBeDefined();
  });

  it('should provide IntegrationSettingsService', () => {
    expect(integrationSettingsService).toBeDefined();
  });

  it('should provide BackupRestoreService', () => {
    expect(backupRestoreService).toBeDefined();
  });
});
