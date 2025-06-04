import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus, ReportType } from '../entities/report.entity';
import { CreateReportDto } from '../dto/create-report.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  async create(createReportDto: CreateReportDto): Promise<Report> {
    const report = this.reportRepository.create(createReportDto);
    return this.reportRepository.save(report);
  }

  async findAll(page = 1, limit = 10, userId?: string): Promise<{ data: Report[]; total: number; page: number; limit: number }> {
    const query = this.reportRepository.createQueryBuilder('report');
    
    if (userId) {
      query.where('report.userId = :userId', { userId });
    }
    
    const [data, total] = await query
      .orderBy('report.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  async update(id: string, updateData: Partial<Report>): Promise<Report> {
    await this.reportRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.reportRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
  }

  async generate(id: string): Promise<Report> {
    const report = await this.findOne(id);
    
    // Update status to processing
    await this.update(id, { status: ReportStatus.PROCESSING });
    
    try {
      // Simulate report generation based on type
      const data = await this.generateReportData(report.type, report.parameters);
      
      await this.update(id, {
        status: ReportStatus.COMPLETED,
        data,
      });
      
      return this.findOne(id);
    } catch (error) {
      await this.update(id, { status: ReportStatus.FAILED });
      throw error;
    }
  }

  async getStatus(id: string): Promise<{ status: string; progress?: number }> {
    const report = await this.findOne(id);
    return { status: report.status };
  }

  private async generateReportData(type: ReportType, parameters: any): Promise<any> {
    // Simulate data generation based on report type
    switch (type) {
      case ReportType.SALES:
        return this.generateSalesData(parameters);
      case ReportType.USER_ACTIVITY:
        return this.generateUserActivityData(parameters);
      case ReportType.FINANCIAL:
        return this.generateFinancialData(parameters);
      case ReportType.INVENTORY:
        return this.generateInventoryData(parameters);
      case ReportType.PERFORMANCE:
        return this.generatePerformanceData(parameters);
      default:
        return {};
    }
  }

  private generateSalesData(parameters: any): any {
    return {
      totalSales: 150000,
      period: parameters?.period || 'monthly',
      salesByRegion: [
        { region: 'North', amount: 50000 },
        { region: 'South', amount: 60000 },
        { region: 'East', amount: 25000 },
        { region: 'West', amount: 15000 },
      ],
      topProducts: [
        { product: 'Product A', sales: 75000 },
        { product: 'Product B', sales: 45000 },
        { product: 'Product C', sales: 30000 },
      ],
    };
  }

  private generateUserActivityData(parameters: any): any {
    return {
      totalUsers: 1250,
      activeUsers: 987,
      newUsers: 143,
      usersByDevice: [
        { device: 'Desktop', count: 543 },
        { device: 'Mobile', count: 598 },
        { device: 'Tablet', count: 109 },
      ],
    };
  }

  private generateFinancialData(parameters: any): any {
    return {
      revenue: 250000,
      expenses: 180000,
      profit: 70000,
      profitMargin: 28,
      monthlyTrend: [
        { month: 'Jan', revenue: 45000, expenses: 32000 },
        { month: 'Feb', revenue: 52000, expenses: 38000 },
        { month: 'Mar', revenue: 48000, expenses: 35000 },
      ],
    };
  }

  private generateInventoryData(parameters: any): any {
    return {
      totalItems: 2500,
      lowStock: 45,
      outOfStock: 12,
      topSellingItems: [
        { item: 'Widget A', quantity: 150 },
        { item: 'Widget B', quantity: 120 },
        { item: 'Widget C', quantity: 98 },
      ],
    };
  }

  private generatePerformanceData(parameters: any): any {
    return {
      pageLoadTime: 2.3,
      uptime: 99.8,
      errorRate: 0.02,
      throughput: 1500,
      metrics: [
        { metric: 'CPU Usage', value: 65, unit: '%' },
        { metric: 'Memory Usage', value: 78, unit: '%' },
        { metric: 'Disk Usage', value: 45, unit: '%' },
      ],
    };
  }
}
