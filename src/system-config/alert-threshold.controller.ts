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
import { AlertThresholdService } from './alert-threshold.service';
import { CreateAlertThresholdDto, UpdateAlertThresholdDto } from './dto/alert-threshold.dto';
import { AlertThreshold, AlertCategory, AlertSeverity } from './entities/alert-threshold.entity';

@ApiTags('alert-thresholds')
@Controller('alert-thresholds')
export class AlertThresholdController {
  constructor(private readonly alertThresholdService: AlertThresholdService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new alert threshold' })
  @ApiResponse({ status: 201, description: 'The alert threshold has been successfully created.', type: AlertThreshold })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  create(@Body(ValidationPipe) createAlertThresholdDto: CreateAlertThresholdDto): Promise<AlertThreshold> {
    return this.alertThresholdService.create(createAlertThresholdDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all alert thresholds' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category', enum: AlertCategory })
  @ApiQuery({ name: 'severity', required: false, description: 'Filter by severity', enum: AlertSeverity })
  @ApiResponse({ status: 200, description: 'List of alert thresholds.', type: [AlertThreshold] })
  findAll(
    @Query('category') category?: AlertCategory,
    @Query('severity') severity?: AlertSeverity
  ): Promise<AlertThreshold[]> {
    return this.alertThresholdService.findAll(category, severity);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active alert thresholds' })
  @ApiResponse({ status: 200, description: 'List of active alert thresholds.', type: [AlertThreshold] })
  findActive(): Promise<AlertThreshold[]> {
    return this.alertThresholdService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an alert threshold by ID' })
  @ApiParam({ name: 'id', description: 'Alert threshold ID' })
  @ApiResponse({ status: 200, description: 'The alert threshold.', type: AlertThreshold })
  @ApiResponse({ status: 404, description: 'Alert threshold not found.' })
  findOne(@Param('id') id: string): Promise<AlertThreshold> {
    return this.alertThresholdService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an alert threshold by ID' })
  @ApiParam({ name: 'id', description: 'Alert threshold ID' })
  @ApiResponse({ status: 200, description: 'The updated alert threshold.', type: AlertThreshold })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Alert threshold not found.' })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateAlertThresholdDto: UpdateAlertThresholdDto
  ): Promise<AlertThreshold> {
    return this.alertThresholdService.update(id, updateAlertThresholdDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an alert threshold by ID' })
  @ApiParam({ name: 'id', description: 'Alert threshold ID' })
  @ApiResponse({ status: 204, description: 'The alert threshold has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Alert threshold not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.alertThresholdService.remove(id);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle the active status of an alert threshold' })
  @ApiParam({ name: 'id', description: 'Alert threshold ID' })
  @ApiQuery({ name: 'active', description: 'Set to true to activate, false to deactivate' })
  @ApiResponse({ status: 200, description: 'The updated alert threshold.', type: AlertThreshold })
  @ApiResponse({ status: 404, description: 'Alert threshold not found.' })
  toggleActive(
    @Param('id') id: string,
    @Query('active') isActive: boolean
  ): Promise<AlertThreshold> {
    return this.alertThresholdService.toggleActive(id, isActive === true);
  }

  @Get('category/:category/severity/:severity')
  @ApiOperation({ summary: 'Get alert thresholds by category and severity' })
  @ApiParam({ name: 'category', description: 'Alert category', enum: AlertCategory })
  @ApiParam({ name: 'severity', description: 'Alert severity', enum: AlertSeverity })
  @ApiResponse({ status: 200, description: 'List of matching alert thresholds.', type: [AlertThreshold] })
  findByCategoryAndSeverity(
    @Param('category') category: AlertCategory,
    @Param('severity') severity: AlertSeverity
  ): Promise<AlertThreshold[]> {
    return this.alertThresholdService.findByCategoryAndSeverity(category, severity);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create multiple alert thresholds at once' })
  @ApiResponse({ status: 201, description: 'The alert thresholds have been successfully created.', type: [AlertThreshold] })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  bulkCreate(@Body(ValidationPipe) createAlertThresholdDtos: CreateAlertThresholdDto[]): Promise<AlertThreshold[]> {
    return this.alertThresholdService.bulkCreate(createAlertThresholdDtos);
  }
}
