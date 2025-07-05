import { Injectable, Logger } from '@nestjs/common';
import { Report } from '../entities/report.entity';
import { ReportFormat } from '../enums/report.enum';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReportExportService {
  private readonly logger = new Logger(ReportExportService.name);
  private readonly exportDir = './exports';

  constructor() {
    // Ensure export directory exists
    if (!fs.existsSync(this.exportDir)) {
      fs.mkdirSync(this.exportDir, { recursive: true });
    }
  }

  async exportReport(report: Report): Promise<string> {
    const filename = `${report.id}_${report.name.replace(/\s+/g, '_')}_${Date.now()}`;

    switch (report.format) {
      case ReportFormat.PDF:
        return this.exportToPDF(report, filename);
      case ReportFormat.EXCEL:
        return this.exportToExcel(report, filename);
      case ReportFormat.CSV:
        return this.exportToCSV(report, filename);
      case ReportFormat.JSON:
        return this.exportToJSON(report, filename);
      default:
        throw new Error(`Unsupported export format: ${report.format}`);
    }
  }

  private async exportToPDF(report: Report, filename: string): Promise<string> {
    // Mock PDF generation - in real implementation, use libraries like puppeteer or pdfkit
    const filePath = path.join(this.exportDir, `${filename}.pdf`);

    // Mock PDF content
    const pdfContent = `PDF Report: ${report.name}\n\nData: ${JSON.stringify(report.data, null, 2)}`;
    fs.writeFileSync(filePath, pdfContent);

    this.logger.log(`PDF exported: ${filePath}`);
    return filePath;
  }

  private async exportToExcel(report: Report, filename: string): Promise<string> {
    // Mock Excel generation - in real implementation, use libraries like exceljs
    const filePath = path.join(this.exportDir, `${filename}.xlsx`);

    // Mock Excel content (would be binary in real implementation)
    const excelContent = `Excel Report: ${report.name}\n\nData: ${JSON.stringify(report.data, null, 2)}`;
    fs.writeFileSync(filePath, excelContent);

    this.logger.log(`Excel exported: ${filePath}`);
    return filePath;
  }

  private async exportToCSV(report: Report, filename: string): Promise<string> {
    const filePath = path.join(this.exportDir, `${filename}.csv`);

    // Convert data to CSV format
    let csvContent = '';
    if (report.data && report.data.data && Array.isArray(report.data.data)) {
      const headers = Object.keys(report.data.data[0] || {});
      csvContent = headers.join(',') + '\n';

      report.data.data.forEach(row => {
        const values = headers.map(header => row[header] || '');
        csvContent += values.join(',') + '\n';
      });
    }

    fs.writeFileSync(filePath, csvContent);

    this.logger.log(`CSV exported: ${filePath}`);
    return filePath;
  }

  private async exportToJSON(report: Report, filename: string): Promise<string> {
    const filePath = path.join(this.exportDir, `${filename}.json`);

    const jsonContent = JSON.stringify(report.data, null, 2);
    fs.writeFileSync(filePath, jsonContent);

    this.logger.log(`JSON exported: ${filePath}`);
    return filePath;
  }

  async getExportedFile(filePath: string): Promise<Buffer> {
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    return fs.readFileSync(filePath);
  }

  async deleteExportedFile(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      this.logger.log(`File deleted: ${filePath}`);
    }
  }
}
