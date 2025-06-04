import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  StreamableFile,
  Res,
  ParseBoolPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { BackupRestoreService } from './backup-restore.service';

@ApiTags('system-backup')
@Controller('system-backup')
export class BackupRestoreController {
  constructor(private readonly backupRestoreService: BackupRestoreService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a system backup' })
  @ApiQuery({ 
    name: 'includeSecrets', 
    required: false, 
    description: 'Whether to include sensitive information in the backup',
    type: Boolean
  })
  @ApiResponse({ status: 201, description: 'Backup created successfully.' })
  @ApiResponse({ status: 400, description: 'Failed to create backup.' })
  async createBackup(
    @Query('includeSecrets', new ParseBoolPipe({ optional: true })) includeSecrets?: boolean
  ): Promise<{ filename: string }> {
    const filename = await this.backupRestoreService.createBackup(includeSecrets);
    return { filename };
  }

  @Get()
  @ApiOperation({ summary: 'List all available backups' })
  @ApiResponse({ status: 200, description: 'List of available backups.' })
  @ApiResponse({ status: 400, description: 'Failed to list backups.' })
  listBackups() {
    return this.backupRestoreService.listBackups();
  }

  @Get('download/:filename')
  @ApiOperation({ summary: 'Download a backup file' })
  @ApiParam({ name: 'filename', description: 'Backup filename' })
  @ApiResponse({ status: 200, description: 'The backup file.' })
  @ApiResponse({ status: 404, description: 'Backup file not found.' })
  async downloadBackup(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const backupDir = path.join(process.cwd(), 'backups');
    const filePath = path.join(backupDir, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Backup file ${filename} not found`);
    }
    
    const file = fs.createReadStream(filePath);
    
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    
    return new StreamableFile(file);
  }

  @Post('restore/:filename')
  @ApiOperation({ summary: 'Restore system from a backup' })
  @ApiParam({ name: 'filename', description: 'Backup filename' })
  @ApiQuery({ 
    name: 'restoreSettings', 
    required: false, 
    description: 'Whether to restore system settings',
    type: Boolean
  })
  @ApiQuery({ 
    name: 'restoreAlerts', 
    required: false, 
    description: 'Whether to restore alert thresholds',
    type: Boolean
  })
  @ApiQuery({ 
    name: 'restoreIntegrations', 
    required: false, 
    description: 'Whether to restore integration settings',
    type: Boolean
  })
  @ApiQuery({ 
    name: 'overwriteExisting', 
    required: false, 
    description: 'Whether to overwrite existing items',
    type: Boolean
  })
  @ApiResponse({ status: 200, description: 'Backup restored successfully.' })
  @ApiResponse({ status: 400, description: 'Failed to restore backup.' })
  @ApiResponse({ status: 404, description: 'Backup file not found.' })
  restoreBackup(
    @Param('filename') filename: string,
    @Query('restoreSettings', new ParseBoolPipe({ optional: true })) restoreSettings?: boolean,
    @Query('restoreAlerts', new ParseBoolPipe({ optional: true })) restoreAlerts?: boolean,
    @Query('restoreIntegrations', new ParseBoolPipe({ optional: true })) restoreIntegrations?: boolean,
    @Query('overwriteExisting', new ParseBoolPipe({ optional: true })) overwriteExisting?: boolean
  ) {
    return this.backupRestoreService.restoreFromBackup(filename, {
      restoreSettings,
      restoreAlerts,
      restoreIntegrations,
      overwriteExisting
    });
  }

  @Delete(':filename')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a backup file' })
  @ApiParam({ name: 'filename', description: 'Backup filename' })
  @ApiResponse({ status: 204, description: 'Backup file deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Failed to delete backup.' })
  @ApiResponse({ status: 404, description: 'Backup file not found.' })
  deleteBackup(@Param('filename') filename: string): Promise<void> {
    return this.backupRestoreService.deleteBackup(filename);
  }
}
