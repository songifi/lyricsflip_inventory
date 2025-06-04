import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';
import * as extract from 'extract-zip';
import { SystemSettings } from './entities/system-settings.entity';
import { AlertThreshold } from './entities/alert-threshold.entity';
import { IntegrationSettings } from './entities/integration-settings.entity';
import { CreateSystemSettingDto } from './dto/system-settings.dto';
import { CreateAlertThresholdDto } from './dto/alert-threshold.dto';
import { CreateIntegrationSettingsDto } from './dto/integration-settings.dto';

@Injectable()
export class BackupRestoreService {
  private readonly logger = new Logger(BackupRestoreService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');

  constructor(
    @InjectRepository(SystemSettings)
    private readonly systemSettingsRepository: Repository<SystemSettings>,
    @InjectRepository(AlertThreshold)
    private readonly alertThresholdRepository: Repository<AlertThreshold>,
    @InjectRepository(IntegrationSettings)
    private readonly integrationSettingsRepository: Repository<IntegrationSettings>,
    private readonly dataSource: DataSource,
  ) {
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Create a backup of system configuration
   */
  async createBackup(includeSecrets: boolean = false): Promise<string> {
    try {
      // Create backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = `system-config-backup-${timestamp}.zip`;
      const backupPath = path.join(this.backupDir, backupFilename);
      
      // Create a write stream for the zip file
      const output = fs.createWriteStream(backupPath);
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });
      
      // Pipe archive data to the file
      archive.pipe(output);
      
      // Get all configuration data
      const systemSettings = await this.systemSettingsRepository.find();
      const alertThresholds = await this.alertThresholdRepository.find();
      const integrationSettings = await this.integrationSettingsRepository.find();
      
      // Filter out secrets if not including them
      const filteredSystemSettings = includeSecrets 
        ? systemSettings 
        : systemSettings.map(setting => {
            if (setting.isSecret) {
              return { ...setting, value: '[REDACTED]' };
            }
            return setting;
          });
      
      const filteredIntegrationSettings = includeSecrets
        ? integrationSettings
        : integrationSettings.map(integration => {
            // Redact sensitive information in config
            const config = { ...integration.config };
            if (integration.requiresAuthentication) {
              if (config.apiKey) config.apiKey = '[REDACTED]';
              if (config.password) config.password = '[REDACTED]';
              if (config.secret) config.secret = '[REDACTED]';
              if (config.token) config.token = '[REDACTED]';
            }
            return { ...integration, config };
          });
      
      // Add data to the archive
      archive.append(JSON.stringify(filteredSystemSettings, null, 2), { name: 'system-settings.json' });
      archive.append(JSON.stringify(alertThresholds, null, 2), { name: 'alert-thresholds.json' });
      archive.append(JSON.stringify(filteredIntegrationSettings, null, 2), { name: 'integration-settings.json' });
      
      // Add metadata
      const metadata = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        includesSecrets: includeSecrets,
      };
      archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });
      
      // Finalize the archive
      await archive.finalize();
      
      return backupFilename;
    } catch (error) {
      this.logger.error(`Error creating backup: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to create backup: ${error.message}`);
    }
  }

  /**
   * Restore system configuration from a backup file
   */
  async restoreFromBackup(backupFilename: string, options: { 
    restoreSettings?: boolean,
    restoreAlerts?: boolean,
    restoreIntegrations?: boolean,
    overwriteExisting?: boolean
  } = {}): Promise<{ 
    settingsRestored: number, 
    alertsRestored: number, 
    integrationsRestored: number 
  }> {
    const {
      restoreSettings = true,
      restoreAlerts = true,
      restoreIntegrations = true,
      overwriteExisting = false
    } = options;
    
    try {
      const backupPath = path.join(this.backupDir, backupFilename);
      
      if (!fs.existsSync(backupPath)) {
        throw new BadRequestException(`Backup file ${backupFilename} not found`);
      }
      
      // Create temp directory for extraction
      const tempDir = path.join(this.backupDir, 'temp-' + Date.now());
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Extract the backup
      await extract(backupPath, { dir: tempDir });
      
      // Read metadata
      const metadataPath = path.join(tempDir, 'metadata.json');
      if (!fs.existsSync(metadataPath)) {
        throw new BadRequestException('Invalid backup file: missing metadata');
      }
      
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      
      // Start a transaction
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      let settingsRestored = 0;
      let alertsRestored = 0;
      let integrationsRestored = 0;
      
      try {
        // Restore system settings
        if (restoreSettings) {
          const settingsPath = path.join(tempDir, 'system-settings.json');
          if (fs.existsSync(settingsPath)) {
            const settings: SystemSettings[] = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            
            for (const setting of settings) {
              // Skip redacted secrets
              if (setting.value === '[REDACTED]') continue;
              
              const dto: CreateSystemSettingDto = {
                key: setting.key,
                value: setting.value,
                description: setting.description,
                type: setting.type,
                isSecret: setting.isSecret,
                isEditable: setting.isEditable,
                category: setting.category
              };
              
              if (overwriteExisting) {
                const existingSetting = await this.systemSettingsRepository.findOne({
                  where: { key: setting.key }
                });
                
                if (existingSetting) {
                  await queryRunner.manager.update(SystemSettings, { id: existingSetting.id }, dto);
                } else {
                  await queryRunner.manager.save(SystemSettings, dto);
                }
              } else {
                const existingSetting = await this.systemSettingsRepository.findOne({
                  where: { key: setting.key }
                });
                
                if (!existingSetting) {
                  await queryRunner.manager.save(SystemSettings, dto);
                }
              }
              
              settingsRestored++;
            }
          }
        }
        
        // Restore alert thresholds
        if (restoreAlerts) {
          const alertsPath = path.join(tempDir, 'alert-thresholds.json');
          if (fs.existsSync(alertsPath)) {
            const alerts: AlertThreshold[] = JSON.parse(fs.readFileSync(alertsPath, 'utf8'));
            
            for (const alert of alerts) {
              const dto: CreateAlertThresholdDto = {
                name: alert.name,
                description: alert.description,
                category: alert.category,
                severity: alert.severity,
                threshold: alert.threshold,
                operator: alert.operator,
                unit: alert.unit,
                notificationConfig: alert.notificationConfig,
                isActive: alert.isActive
              };
              
              if (overwriteExisting) {
                // For alerts, we identify by name since there's no unique key
                const existingAlert = await this.alertThresholdRepository.findOne({
                  where: { name: alert.name }
                });
                
                if (existingAlert) {
                  await queryRunner.manager.update(AlertThreshold, { id: existingAlert.id }, dto);
                } else {
                  await queryRunner.manager.save(AlertThreshold, dto);
                }
              } else {
                const existingAlert = await this.alertThresholdRepository.findOne({
                  where: { name: alert.name }
                });
                
                if (!existingAlert) {
                  await queryRunner.manager.save(AlertThreshold, dto);
                }
              }
              
              alertsRestored++;
            }
          }
        }
        
        // Restore integration settings
        if (restoreIntegrations) {
          const integrationsPath = path.join(tempDir, 'integration-settings.json');
          if (fs.existsSync(integrationsPath)) {
            const integrations: IntegrationSettings[] = JSON.parse(fs.readFileSync(integrationsPath, 'utf8'));
            
            for (const integration of integrations) {
              // Skip if config contains redacted values
              const hasRedactedValues = JSON.stringify(integration.config).includes('[REDACTED]');
              if (hasRedactedValues) continue;
              
              const dto: CreateIntegrationSettingsDto = {
                name: integration.name,
                key: integration.key,
                type: integration.type,
                config: integration.config,
                isActive: integration.isActive,
                description: integration.description,
                version: integration.version,
                requiresAuthentication: integration.requiresAuthentication
              };
              
              if (overwriteExisting) {
                const existingIntegration = await this.integrationSettingsRepository.findOne({
                  where: { key: integration.key }
                });
                
                if (existingIntegration) {
                  await queryRunner.manager.update(IntegrationSettings, { id: existingIntegration.id }, dto);
                } else {
                  await queryRunner.manager.save(IntegrationSettings, dto);
                }
              } else {
                const existingIntegration = await this.integrationSettingsRepository.findOne({
                  where: { key: integration.key }
                });
                
                if (!existingIntegration) {
                  await queryRunner.manager.save(IntegrationSettings, dto);
                }
              }
              
              integrationsRestored++;
            }
          }
        }
        
        // Commit the transaction
        await queryRunner.commitTransaction();
        
        return {
          settingsRestored,
          alertsRestored,
          integrationsRestored
        };
      } catch (error) {
        // Rollback in case of error
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Release the query runner
        await queryRunner.release();
        
        // Clean up temp directory
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
      }
    } catch (error) {
      this.logger.error(`Error restoring backup: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to restore backup: ${error.message}`);
    }
  }

  /**
   * List available backup files
   */
  async listBackups(): Promise<{ filename: string, timestamp: Date, size: number }[]> {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('system-config-backup-') && file.endsWith('.zip'));
      
      return files.map(filename => {
        const filePath = path.join(this.backupDir, filename);
        const stats = fs.statSync(filePath);
        
        // Extract timestamp from filename
        const timestampMatch = filename.match(/system-config-backup-(.+)\.zip/);
        let timestamp = stats.mtime;
        
        if (timestampMatch && timestampMatch[1]) {
          const dateStr = timestampMatch[1].replace(/-/g, ':');
          timestamp = new Date(dateStr);
        }
        
        return {
          filename,
          timestamp,
          size: stats.size
        };
      }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by timestamp, newest first
    } catch (error) {
      this.logger.error(`Error listing backups: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to list backups: ${error.message}`);
    }
  }

  /**
   * Delete a backup file
   */
  async deleteBackup(backupFilename: string): Promise<void> {
    try {
      const backupPath = path.join(this.backupDir, backupFilename);
      
      if (!fs.existsSync(backupPath)) {
        throw new BadRequestException(`Backup file ${backupFilename} not found`);
      }
      
      fs.unlinkSync(backupPath);
    } catch (error) {
      this.logger.error(`Error deleting backup: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to delete backup: ${error.message}`);
    }
  }
}
