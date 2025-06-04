import { InjectRepository } from "@nestjs/typeorm";
import { ReportTemplate } from "./entities/report.entity";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { exportToExcel } from './utils/export.util';
import { ReportStrategy } from "./strategies/sales-report.strategy";


@Injectable()
export class ReportsService {
  constructor(
    private readonly strategies: ReportStrategy[],
    @InjectRepository(ReportTemplate)
    private readonly templateRepo: Repository<ReportTemplate>,
  ) {}

  private getStrategy(type: string): ReportStrategy {
    const strategy = this.strategies.find(s => s.constructor.name.toLowerCase().includes(type));
    if (!strategy) throw new Error(`Strategy for ${type} not found`);
    return strategy;
  }

  async generateReport(templateId: string) {
    const template = await this.templateRepo.findOneOrFail({ where: { id: templateId } });
    const strategy = this.getStrategy(template.type);
    const data = await strategy.generate(template.config);
    // optionally export
    return data;
  }

  async exportAndStore(data: any[], template: ReportTemplate) {
    const filePath = `/tmp/${template.name}-${Date.now()}.xlsx`;
    await exportToExcel(data, filePath);
    // Optionally upload to S3, save metadata, etc.
  }

  @Cron('0 0 * * *') // every day at midnight
  async generateScheduledReports() {
    const templates = await this.templateRepo.find(); // or filter where scheduled = true
    for (const template of templates) {
      const strategy = this.getStrategy(template.type);
      const data = await strategy.generate(template.config);
      await this.exportAndStore(data, template);
    }
  }
}
