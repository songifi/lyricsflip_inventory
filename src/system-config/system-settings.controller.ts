import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ValidationPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SystemSettingsService } from './system-settings.service';
import { CreateSystemSettingDto, UpdateSystemSettingDto } from './dto/system-settings.dto';
import { SystemSettings } from './entities/system-settings.entity';

@ApiTags('system-settings')
@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new system setting' })
  @ApiResponse({ status: 201, description: 'The setting has been successfully created.', type: SystemSettings })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Setting with this key already exists.' })
  create(@Body(ValidationPipe) createSystemSettingDto: CreateSystemSettingDto): Promise<SystemSettings> {
    return this.systemSettingsService.create(createSystemSettingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all system settings' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter settings by category' })
  @ApiResponse({ status: 200, description: 'List of system settings.', type: [SystemSettings] })
  findAll(@Query('category') category?: string): Promise<SystemSettings[]> {
    return this.systemSettingsService.findAll(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a system setting by ID' })
  @ApiParam({ name: 'id', description: 'Setting ID' })
  @ApiResponse({ status: 200, description: 'The system setting.', type: SystemSettings })
  @ApiResponse({ status: 404, description: 'Setting not found.' })
  findOne(@Param('id') id: string): Promise<SystemSettings> {
    return this.systemSettingsService.findOne(id);
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'Get a system setting by key' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @ApiResponse({ status: 200, description: 'The system setting.', type: SystemSettings })
  @ApiResponse({ status: 404, description: 'Setting not found.' })
  findByKey(@Param('key') key: string): Promise<SystemSettings> {
    return this.systemSettingsService.findByKey(key);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a system setting by ID' })
  @ApiParam({ name: 'id', description: 'Setting ID' })
  @ApiResponse({ status: 200, description: 'The updated system setting.', type: SystemSettings })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Setting not found.' })
  @ApiResponse({ status: 409, description: 'Setting is not editable.' })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateSystemSettingDto: UpdateSystemSettingDto
  ): Promise<SystemSettings> {
    return this.systemSettingsService.update(id, updateSystemSettingDto);
  }

  @Patch('key/:key')
  @ApiOperation({ summary: 'Update a system setting by key' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @ApiResponse({ status: 200, description: 'The updated system setting.', type: SystemSettings })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Setting not found.' })
  @ApiResponse({ status: 409, description: 'Setting is not editable.' })
  updateByKey(
    @Param('key') key: string,
    @Body(ValidationPipe) updateSystemSettingDto: UpdateSystemSettingDto
  ): Promise<SystemSettings> {
    return this.systemSettingsService.updateByKey(key, updateSystemSettingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a system setting by ID' })
  @ApiParam({ name: 'id', description: 'Setting ID' })
  @ApiResponse({ status: 204, description: 'The setting has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Setting not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.systemSettingsService.remove(id);
  }

  @Delete('key/:key')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a system setting by key' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @ApiResponse({ status: 204, description: 'The setting has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Setting not found.' })
  removeByKey(@Param('key') key: string): Promise<void> {
    return this.systemSettingsService.removeByKey(key);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple system settings at once' })
  @ApiResponse({ status: 201, description: 'The settings have been successfully created.', type: [SystemSettings] })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  bulkCreate(@Body(ValidationPipe) createSystemSettingDtos: CreateSystemSettingDto[]): Promise<SystemSettings[]> {
    return this.systemSettingsService.bulkCreate(createSystemSettingDtos);
  }

  @Get('value/:key')
  @ApiOperation({ summary: 'Get only the value of a system setting by key' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @ApiResponse({ status: 200, description: 'The setting value.' })
  @ApiResponse({ status: 404, description: 'Setting not found.' })
  getValueByKey(@Param('key') key: string): Promise<string> {
    return this.systemSettingsService.getValueByKey(key);
  }
}
