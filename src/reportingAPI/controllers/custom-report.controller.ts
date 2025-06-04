import { Controller, Get, Post, Body, Param, Query, Delete, Put } from '@nestjs/common';
import { CustomReportService } from '../services/custom-report.service';
import { CreateCustomReportDto } from '../dto/create-custom-report.dto';
import { CustomReport } from '../entities/custom-report.entity';

@Controller('api/custom-reports')
export class CustomReportController {
  constructor(private readonly customReportService: CustomReportService) {}

  @Post()
  async create(@Body() createCustomReportDto: CreateCustomReportDto): Promise<CustomReport> {
    return this.customReportService.create(createCustomReportDto);
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('userId') userId?: string,
  ): Promise<{ data: CustomReport[]; total: number; page: number; limit: number }> {
    return this.customReportService.findAll(page, limit, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CustomReport> {
    return this.customReportService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<CustomReport>): Promise<CustomReport> {
    return this.customReportService.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.customReportService.remove(id);
  }

  @Post(':id/execute')
  async execute(@Param('id') id: string): Promise<any> {
    return this.customReportService.execute(id);
  }

  @Get('builder/fields')
  async getAvailableFields(): Promise<string[]> {
    return this.customReportService.getAvailableFields();
  }

  @Post('builder/preview')
  async preview(@Body() reportConfig: Partial<CustomReport>): Promise<any> {
    return this.customReportService.preview(reportConfig);
  }
}