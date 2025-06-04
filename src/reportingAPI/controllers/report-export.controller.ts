import { Controller, Get, Post, Param, Body, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import { ReportExportService } from '../services/report-export.service';
import { ExportReportDto } from '../dto/export-report.dto';

@Controller('api/reports/:reportId/export')
export class ReportExportController {
  constructor(private readonly reportExportService: ReportExportService) {}

  @Post()
  async export(
    @Param('reportId') reportId: string,
    @Body() exportDto: ExportReportDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.reportExportService.export(reportId, exportDto);
    
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.buffer);
  }

  @Get('formats')
  async getSupportedFormats(): Promise<string[]> {
    return this.reportExportService.getSupportedFormats();
  }

  @Get('templates')
  async getTemplates(@Query('format') format?: string): Promise<string[]> {
    return this.reportExportService.getTemplates(format);
  }
}
