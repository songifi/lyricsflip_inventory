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
  ValidationPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { IntegrationSettingsService } from './integration-settings.service';
import { CreateIntegrationSettingsDto, UpdateIntegrationSettingsDto } from './dto/integration-settings.dto';
import { IntegrationSettings, IntegrationType } from './entities/integration-settings.entity';

@ApiTags('integration-settings')
@Controller('integration-settings')
export class IntegrationSettingsController {
  constructor(private readonly integrationSettingsService: IntegrationSettingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new integration setting' })
  @ApiResponse({ status: 201, description: 'The integration setting has been successfully created.', type: IntegrationSettings })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Integration with this key already exists.' })
  create(@Body(ValidationPipe) createIntegrationSettingsDto: CreateIntegrationSettingsDto): Promise<IntegrationSettings> {
    return this.integrationSettingsService.create(createIntegrationSettingsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all integration settings' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by integration type', enum: IntegrationType })
  @ApiResponse({ status: 200, description: 'List of integration settings.', type: [IntegrationSettings] })
  findAll(@Query('type') type?: IntegrationType): Promise<IntegrationSettings[]> {
    return this.integrationSettingsService.findAll(type);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active integration settings' })
  @ApiResponse({ status: 200, description: 'List of active integration settings.', type: [IntegrationSettings] })
  findActive(): Promise<IntegrationSettings[]> {
    return this.integrationSettingsService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an integration setting by ID' })
  @ApiParam({ name: 'id', description: 'Integration setting ID' })
  @ApiResponse({ status: 200, description: 'The integration setting.', type: IntegrationSettings })
  @ApiResponse({ status: 404, description: 'Integration setting not found.' })
  findOne(@Param('id') id: string): Promise<IntegrationSettings> {
    return this.integrationSettingsService.findOne(id);
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'Get an integration setting by key' })
  @ApiParam({ name: 'key', description: 'Integration setting key' })
  @ApiResponse({ status: 200, description: 'The integration setting.', type: IntegrationSettings })
  @ApiResponse({ status: 404, description: 'Integration setting not found.' })
  findByKey(@Param('key') key: string): Promise<IntegrationSettings> {
    return this.integrationSettingsService.findByKey(key);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an integration setting by ID' })
  @ApiParam({ name: 'id', description: 'Integration setting ID' })
  @ApiResponse({ status: 200, description: 'The updated integration setting.', type: IntegrationSettings })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Integration setting not found.' })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateIntegrationSettingsDto: UpdateIntegrationSettingsDto
  ): Promise<IntegrationSettings> {
    return this.integrationSettingsService.update(id, updateIntegrationSettingsDto);
  }

  @Patch('key/:key')
  @ApiOperation({ summary: 'Update an integration setting by key' })
  @ApiParam({ name: 'key', description: 'Integration setting key' })
  @ApiResponse({ status: 200, description: 'The updated integration setting.', type: IntegrationSettings })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Integration setting not found.' })
  updateByKey(
    @Param('key') key: string,
    @Body(ValidationPipe) updateIntegrationSettingsDto: UpdateIntegrationSettingsDto
  ): Promise<IntegrationSettings> {
    return this.integrationSettingsService.updateByKey(key, updateIntegrationSettingsDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an integration setting by ID' })
  @ApiParam({ name: 'id', description: 'Integration setting ID' })
  @ApiResponse({ status: 204, description: 'The integration setting has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Integration setting not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.integrationSettingsService.remove(id);
  }

  @Delete('key/:key')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an integration setting by key' })
  @ApiParam({ name: 'key', description: 'Integration setting key' })
  @ApiResponse({ status: 204, description: 'The integration setting has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Integration setting not found.' })
  removeByKey(@Param('key') key: string): Promise<void> {
    return this.integrationSettingsService.removeByKey(key);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle the active status of an integration setting' })
  @ApiParam({ name: 'id', description: 'Integration setting ID' })
  @ApiQuery({ name: 'active', description: 'Set to true to activate, false to deactivate' })
  @ApiResponse({ status: 200, description: 'The updated integration setting.', type: IntegrationSettings })
  @ApiResponse({ status: 404, description: 'Integration setting not found.' })
  toggleActive(
    @Param('id') id: string,
    @Query('active') isActive: boolean
  ): Promise<IntegrationSettings> {
    return this.integrationSettingsService.toggleActive(id, isActive === true);
  }

  @Patch(':id/config')
  @ApiOperation({ summary: 'Update the configuration of an integration setting' })
  @ApiParam({ name: 'id', description: 'Integration setting ID' })
  @ApiResponse({ status: 200, description: 'The updated integration setting.', type: IntegrationSettings })
  @ApiResponse({ status: 404, description: 'Integration setting not found.' })
  updateConfig(
    @Param('id') id: string,
    @Body() config: Record<string, any>
  ): Promise<IntegrationSettings> {
    return this.integrationSettingsService.updateConfig(id, config);
  }
}
