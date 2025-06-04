import { Controller, Get, Post, Body, Param, Query, Delete, Put } from '@nestjs/common';
import { ReportService } from '../services/report.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { Report } from '../entities/report.entity';

@Controller('api/reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  async create(@Body() createReportDto: CreateReportDto): Promise<Report> {
    return this.reportService.create(createReportDto);
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('userId') userId?: string,
  ): Promise<{ data: Report[]; total: number; page: number; limit: number }> {
    return this.reportService.findAll(page, limit, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Report> {
    return this.reportService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<Report>): Promise<Report> {
    return this.reportService.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.reportService.remove(id);
  }

  @Post(':id/generate')
  async generate(@Param('id') id: string): Promise<Report> {
    return this.reportService.generate(id);
  }

  @Get(':id/status')
  async getStatus(@Param('id') id: string): Promise<{ status: string; progress?: number }> {
    return this.reportService.getStatus(id);
  }
}
