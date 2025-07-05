import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from '../reports.service';
import { CreateReportDto } from '../dto/create-report.dto';
import { ReportFilterDto } from '../dto/report-filter.dto';
import { CustomReportDto } from '../dto/custom-report.dto';
import { Report } from '../entities/report.entity';
// import { AuthGuard } from '../../common/guards/auth.guard';

@ApiTags('Reports')
@Controller('reports')
// @UseGuards(AuthGuard)
// @ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new standard report' })
  @ApiResponse({ status: 201, description: 'Report created successfully', type: Report })
  async createReport(
    @Body() createReportDto: CreateReportDto,
    // @CurrentUser() user: any, // Add user decorator
  ): Promise<Report> {
    return this.reportsService.createReport(createReportDto, 'user-id'); // Replace with actual user ID
  }

  @Post('custom')
  @ApiOperation({ summary: 'Create a custom report' })
  @ApiResponse({ status: 201, description: 'Custom report created successfully', type: Report })
  async createCustomReport(
    @Body() customReportDto: CustomReportDto,
    // @CurrentUser() user: any,
  ): Promise<Report> {
    return this.reportsService.createCustomReport(customReportDto, 'user-id');
  }

  @Get()
  @ApiOperation({ summary: 'Get all reports with filtering' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  async getAllReports(
    @Query() filters: ReportFilterDto,
  ): Promise<{ reports: Report[]; total: number }> {
    return this.reportsService.getAllReports(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  @ApiResponse({ status: 200, description: 'Report found', type: Report })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async getReportById(@Param('id', ParseUUIDPipe) id: string): Promise<Report> {
    return this.reportsService.getReportById(id);
  }

  @Post(':id/export')
  @ApiOperation({ summary: 'Export report' })
  @ApiResponse({ status: 200, description: 'Report exported successfully' })
  async exportReport(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ filePath: string; downloadUrl: string }> {
    return this.reportsService.exportReport(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download report file' })
  @ApiResponse({ status: 200, description: 'Report file downloaded' })
  async downloadReport(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const report = await this.reportsService.getReportById(id);
    const fileBuffer = await this.reportsService.downloadReport(id);

    const filename = `${report.name.replace(/\s+/g, '_')}.${report.format}`;

    res.setHeader('Content-Type', this.getContentType(report.format));
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(fileBuffer);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete report' })
  @ApiResponse({ status: 200, description: 'Report deleted successfully' })
  async deleteReport(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.reportsService.deleteReport(id);
    return { message: 'Report deleted successfully' };
  }

  private getContentType(format: string): string {
    switch (format.toLowerCase()) {
      case 'pdf':
        return 'application/pdf';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      default:
        return 'application/octet-stream';
    }
  }
}
