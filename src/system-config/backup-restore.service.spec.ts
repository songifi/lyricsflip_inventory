import { Test, TestingModule } from '@nestjs/testing';
import { BackupRestoreService } from './backup-restore.service';
import { SystemSettingsService } from './system-settings.service';
import { AlertThresholdService } from './alert-threshold.service';
import { IntegrationSettingsService } from './integration-settings.service';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');
jest.mock('path');
jest.mock('archiver');
jest.mock('extract-zip');

describe('BackupRestoreService', () => {
  let service: BackupRestoreService;
  let systemSettingsService: SystemSettingsService;
  let alertThresholdService: AlertThresholdService;
  let integrationSettingsService: IntegrationSettingsService;

  const mockSystemSettingsService = {
    findAll: jest.fn(),
    bulkCreate: jest.fn(),
  };

  const mockAlertThresholdService = {
    findAll: jest.fn(),
    bulkCreate: jest.fn(),
  };

  const mockIntegrationSettingsService = {
    findAll: jest.fn(),
    bulkCreate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupRestoreService,
        {
          provide: SystemSettingsService,
          useValue: mockSystemSettingsService,
        },
        {
          provide: AlertThresholdService,
          useValue: mockAlertThresholdService,
        },
        {
          provide: IntegrationSettingsService,
          useValue: mockIntegrationSettingsService,
        },
      ],
    }).compile();

    service = module.get<BackupRestoreService>(BackupRestoreService);
    systemSettingsService = module.get<SystemSettingsService>(SystemSettingsService);
    alertThresholdService = module.get<AlertThresholdService>(AlertThresholdService);
    integrationSettingsService = module.get<IntegrationSettingsService>(IntegrationSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBackup', () => {
    it('should create a backup file with system settings, alert thresholds, and integration settings', async () => {
      const systemSettings = [{ key: 'test', value: 'value' }];
      const alertThresholds = [{ name: 'test', thresholdValue: 10 }];
      const integrationSettings = [{ key: 'test', config: {} }];
      
      jest.spyOn(systemSettingsService, 'findAll').mockResolvedValue(systemSettings as any);
      jest.spyOn(alertThresholdService, 'findAll').mockResolvedValue(alertThresholds as any);
      jest.spyOn(integrationSettingsService, 'findAll').mockResolvedValue(integrationSettings as any);
      
      // Mock fs.existsSync to return false for the backup directory
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      
      // Mock fs.mkdirSync to do nothing
      jest.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
      
      // Mock path.join to return a fixed path
      jest.spyOn(path, 'join').mockReturnValue('/mock/path/backup.zip');
      
      // Mock Date.now() to return a fixed timestamp
      const mockDate = new Date('2023-01-01T00:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      
      // Mock the archiver functionality
      const mockArchiver = {
        pipe: jest.fn().mockReturnThis(),
        append: jest.fn().mockReturnThis(),
        finalize: jest.fn().mockImplementation(() => Promise.resolve()),
      };
      
      jest.mock('archiver', () => jest.fn().mockReturnValue(mockArchiver));
      
      const result = await service.createBackup(false);
      
      expect(result).toBeDefined();
      expect(systemSettingsService.findAll).toHaveBeenCalled();
      expect(alertThresholdService.findAll).toHaveBeenCalled();
      expect(integrationSettingsService.findAll).toHaveBeenCalled();
    });
  });

  describe('listBackups', () => {
    it('should return a list of available backup files', async () => {
      const mockFiles = ['backup-20230101.zip', 'backup-20230102.zip'];
      
      // Mock fs.existsSync to return true for the backup directory
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      
      // Mock fs.readdirSync to return mock files
      jest.spyOn(fs, 'readdirSync').mockReturnValue(mockFiles as any);
      
      // Mock fs.statSync to return mock stats
      jest.spyOn(fs, 'statSync').mockReturnValue({
        isFile: () => true,
        size: 1024,
        mtime: new Date('2023-01-01T00:00:00Z'),
      } as any);
      
      const result = await service.listBackups();
      
      expect(result).toHaveLength(2);
      expect(result[0].filename).toBe('backup-20230101.zip');
      expect(result[1].filename).toBe('backup-20230102.zip');
    });
  });

  describe('deleteBackup', () => {
    it('should delete a backup file', async () => {
      const filename = 'backup-20230101.zip';
      
      // Mock path.join to return a fixed path
      jest.spyOn(path, 'join').mockReturnValue('/mock/path/backup-20230101.zip');
      
      // Mock fs.existsSync to return true for the backup file
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      
      // Mock fs.unlinkSync to do nothing
      jest.spyOn(fs, 'unlinkSync').mockImplementation(() => undefined);
      
      await service.deleteBackup(filename);
      
      expect(fs.unlinkSync).toHaveBeenCalledWith('/mock/path/backup-20230101.zip');
    });
    
    it('should throw an error if the backup file does not exist', async () => {
      const filename = 'backup-20230101.zip';
      
      // Mock path.join to return a fixed path
      jest.spyOn(path, 'join').mockReturnValue('/mock/path/backup-20230101.zip');
      
      // Mock fs.existsSync to return false for the backup file
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      
      await expect(service.deleteBackup(filename)).rejects.toThrow();
    });
  });

  // Note: The restoreFromBackup method is more complex to test due to its dependencies
  // on extract-zip and file system operations. In a real-world scenario, you would
  // need to mock these dependencies more thoroughly.
});
