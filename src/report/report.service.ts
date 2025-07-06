import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { ReportTemplate } from './entities/report.entity';
import { ReportStrategy } from './strategies/sales-report.strategy';
import { exportToExcel } from './utils/export.util';
import { exportToPDF } from './utils/pdf-export.util';
import { generateInventoryReportTemplate } from './templates/inventory-report.template';

@Injectable()
export class ReportService {
  constructor(
    private readonly strategies: ReportStrategy[],
    @InjectRepository(ReportTemplate)
    private readonly templateRepo: Repository<ReportTemplate>,
  ) {}

  private getStrategy(type: string): ReportStrategy {
    const strategy = this.strategies.find(s =>
      s.constructor.name.toLowerCase().includes(type.toLowerCase()),
    );
    if (!strategy) throw new Error(`Strategy for ${type} not found`);
    return strategy;
  }

  async generateReport(templateId: string, format: 'excel' | 'pdf' = 'excel') {
    const template = await this.templateRepo.findOneOrFail({ where: { id: templateId } });
    const strategy = this.getStrategy(template.type);
    const data = await strategy.generate(template.config);

    if (format === 'pdf') {
      const html = generateInventoryReportTemplate(data);
      const filePath = `/tmp/${template.name}-${Date.now()}.pdf`;
      await exportToPDF(html, filePath);
      return { format, path: filePath };
    }

    const filePath = `/tmp/${template.name}-${Date.now()}.xlsx`;
    await exportToExcel(data, filePath);
    return { format, path: filePath };
  }

  async exportAndStore(data: any[], template: ReportTemplate) {
    const filePath = `/tmp/${template.name}-${Date.now()}.xlsx`;
    await exportToExcel(data, filePath);
    // Optionally upload to S3, record in DB
    return filePath;
  }

  @Cron('0 0 * * *') // daily at midnight
  async generateScheduledReports() {
    const templates = await this.templateRepo.find(); // add filter if needed
    for (const template of templates) {
      const strategy = this.getStrategy(template.type);
      const data = await strategy.generate(template.config);
      await this.exportAndStore(data, template);
    }
  }
}
