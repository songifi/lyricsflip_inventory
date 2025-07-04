import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { ReportSchedule } from './entities/report-schedule.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportFilterDto } from './dto/report-filter.dto';
import { ScheduleReportDto } from './dto/schedule-report.dto';
import { CustomReportDto } from './dto/custom-report.dto';
import { ReportGenerationService } from './services/report-generation.service';
import { ReportExportService } from './services/report-export.service';
import { ReportType } from './enums/report.enum';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(ReportSchedule)
    private scheduleRepository: Repository<ReportSchedule>,
    private reportGenerationService: ReportGenerationService,
    private reportExportService: ReportExportService,
  ) {}

  async createReport(createReportDto: CreateReportDto, userId?: string): Promise<Report> {
    const report = this.reportRepository.create({
      ...createReportDto,
      userId,
    });

    const savedReport = await this.reportRepository.save(report);

    // Generate report asynchronously
    this.reportGenerationService.generateReport(savedReport.id).catch(error => {
      console.error('Report generation failed:', error);
    });

    return savedReport;
  }

  async createCustomReport(customReportDto: CustomReportDto, userId?: string): Promise<Report> {
    const report = this.reportRepository.create({
      name: customReportDto.name,
      type: ReportType.CUSTOM,
      format: customReportDto.format,
      config: {
        type: ReportType.CUSTOM,
        parameters: {},
        filters: customReportDto.filters || {},
        fields: customReportDto.fields,
        joins: customReportDto.joins,
        groupBy: customReportDto.groupBy,
      },
      userId,
    });

    const savedReport = await this.reportRepository.save(report);

    // Generate report asynchronously
    this.reportGenerationService.generateReport(savedReport.id).catch(error => {
      console.error('Custom report generation failed:', error);
    });

    return savedReport;
  }

  async getAllReports(filters: ReportFilterDto): Promise<{ reports: Report[]; total: number }> {
    const queryBuilder = this.reportRepository.createQueryBuilder('report');

    if (filters.type) {
      queryBuilder.andWhere('report.type = :type', { type: filters.type });
    }

    if (filters.status) {
      queryBuilder.andWhere('report.status = :status', { status: filters.status });
    }

    if (filters.format) {
      queryBuilder.andWhere('report.format = :format', { format: filters.format });
    }

    if (filters.userId) {
      queryBuilder.andWhere('report.userId = :userId', { userId: filters.userId });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('report.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('report.createdAt <= :endDate', { endDate: filters.endDate });
    }

    queryBuilder.orderBy('report.createdAt', 'DESC').skip(filters.offset).take(filters.limit);

    const [reports, total] = await queryBuilder.getManyAndCount();

    return { reports, total };
  }

  async getReportById(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return report;
  }

  async deleteReport(id: string): Promise<void> {
    const report = await this.getReportById(id);

    // Delete exported file if exists
    if (report.filePath) {
      await this.reportExportService.deleteExportedFile(report.filePath);
    }

    await this.reportRepository.delete(id);
  }

  async exportReport(id: string): Promise<{ filePath: string; downloadUrl: string }> {
    const report = await this.getReportById(id);

    if (!report.filePath) {
      const filePath = await this.reportExportService.exportReport(report);
      report.filePath = filePath;
      report.downloadUrl = `/api/reports/${id}/download`;
      await this.reportRepository.save(report);
    }

    return {
      filePath: report.filePath,
      downloadUrl: report.downloadUrl,
    };
  }

  async downloadReport(id: string): Promise<Buffer> {
    const report = await this.getReportById(id);

    if (!report.filePath) {
      throw new NotFoundException('Report file not found');
    }

    return this.reportExportService.getExportedFile(report.filePath);
  }

  // Schedule-related methods
  async createSchedule(scheduleDto: ScheduleReportDto, userId?: string): Promise<ReportSchedule> {
    const schedule = this.scheduleRepository.create({
      ...scheduleDto,
      userId,
      nextRunAt: new Date(), // Will be calculated properly in real implementation
    });

    return this.scheduleRepository.save(schedule);
  }

  async getAllSchedules(userId?: string): Promise<ReportSchedule[]> {
    const whereClause = userId ? { userId } : {};
    return this.scheduleRepository.find({ where: whereClause });
  }

  async getScheduleById(id: string): Promise<ReportSchedule> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    return schedule;
  }

  async updateSchedule(
    id: string,
    updateData: Partial<ScheduleReportDto>,
  ): Promise<ReportSchedule> {
    const schedule = await this.getScheduleById(id);
    Object.assign(schedule, updateData);
    return this.scheduleRepository.save(schedule);
  }

  async deleteSchedule(id: string): Promise<void> {
    await this.getScheduleById(id);
    await this.scheduleRepository.delete(id);
  }

  async toggleSchedule(id: string): Promise<ReportSchedule> {
    const schedule = await this.getScheduleById(id);
    schedule.isActive = !schedule.isActive;
    return this.scheduleRepository.save(schedule);
  }
}
