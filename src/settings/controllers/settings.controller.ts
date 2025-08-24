import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SettingsService } from '../services/settings.service';
import { CreateSettingDto } from '../dto/create-setting.dto';
import { UpdateSettingDto } from '../dto/update-setting.dto';
import { UpdateSettingValueDto } from '../dto/setting-value.dto';
import { SettingQueryDto } from '../dto/setting-query.dto';
import { SettingResponseDto } from '../dto/setting-response.dto';
import { RestoreSettingsDto } from '../dto/setting-backup.dto';
import { SettingCategory } from '../entities/setting.entity';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createSettingDto: CreateSettingDto,
    @Request() req: any,
  ): Promise<SettingResponseDto> {
    return this.settingsService.create(createSettingDto, req.user.sub);
  }

  @Get()
  async findAll(@Query() query: SettingQueryDto): Promise<SettingResponseDto[]> {
    return this.settingsService.findAll(query);
  }

  @Get('categories')
  async getCategories(): Promise<{ category: SettingCategory; count: number }[]> {
    return this.settingsService.getCategories();
  }

  @Get('backup')
  async createBackup(
    @Query('scope') scope?: string,
    @Query('companyId') companyId?: string,
    @Query('description') description?: string,
  ) {
    return this.settingsService.createBackup(scope as any, companyId, description);
  }

  @Post('restore')
  @HttpCode(HttpStatus.OK)
  async restoreFromBackup(
    @Body() restoreDto: RestoreSettingsDto,
    @Request() req: any,
  ) {
    return this.settingsService.restoreFromBackup(restoreDto, req.user.sub);
  }

  @Get(':key')
  async findByKey(
    @Param('key') key: string,
    @Query('companyId') companyId?: string,
  ): Promise<SettingResponseDto> {
    return this.settingsService.findByKey(key, companyId);
  }

  @Put(':key')
  async updateByKey(
    @Param('key') key: string,
    @Body() updateDto: UpdateSettingValueDto,
    @Request() req: any,
    @Query('companyId') companyId?: string,
  ): Promise<SettingResponseDto> {
    return this.settingsService.updateByKey(key, updateDto, req.user.sub, companyId);
  }

  @Get(':key/history')
  async getSettingHistory(
    @Param('key') key: string,
    @Query('companyId') companyId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.settingsService.getSettingHistory(key, companyId, limit);
  }

  @Put(':id/full')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateSettingDto,
    @Request() req: any,
  ): Promise<SettingResponseDto> {
    return this.settingsService.update(id, updateDto, req.user.sub);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any,
  ): Promise<void> {
    return this.settingsService.delete(id, req.user.sub);
  }
}

