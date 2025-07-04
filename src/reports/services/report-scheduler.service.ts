import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ReportSchedule } from '../entities/report-schedule.entity';
import { Report } from '../entities/report.entity';
import { ReportGenerationService } from './report-generation.service';
import { ReportExportService } from './report-export.service';
import { ScheduleFrequency } from '../enums/report.enum';

@Injectable()
export class ReportSchedulerService {
  private readonly logger = new Logger(ReportSchedulerService.name);

  constructor(
    @InjectRepository(ReportSchedule)
    private scheduleRepository: Repository<ReportSchedule>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    private reportGenerationService: ReportGenerationService,
    private reportExportService: ReportExportService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async processScheduledReports(): Promise<void> {
    this.logger.log('Processing scheduled reports...');

    const dueSchedules = await this.scheduleRepository.find({
      where: {
        isActive: true,
        nextRunAt: LessThan(new Date()),
      },
    });

    for (const schedule of dueSchedules) {
      await this.executeScheduledReport(schedule);
    }
  }

  private async executeScheduledReport(schedule: ReportSchedule): Promise<void> {
    try {
      this.logger.log(`Executing scheduled report: ${schedule.name}`);

      // Create a new report instance
      const report = this.reportRepository.create({
        name: `${schedule.name} - ${new Date().toISOString()}`,
        type: schedule.reportType,
        format: schedule.format,
        config: schedule.config,
        userId: schedule.userId,
      });

      const savedReport = await this.reportRepository.save(report);

      // Generate the report
      await this.reportGenerationService.generateReport(savedReport.id);

      // Export the report
      const filePath = await this.reportExportService.exportReport(savedReport);
      savedReport.filePath = filePath;
      await this.reportRepository.save(savedReport);

      // Send to recipients if specified
      if (schedule.recipients && schedule.recipients.length > 0) {
        await this.sendReportToRecipients(savedReport, schedule.recipients);
      }

      // Update schedule for next run
      schedule.lastRunAt = new Date();
      schedule.nextRunAt = this.calculateNextRunTime(schedule.frequency, new Date());
      await this.scheduleRepository.save(schedule);

      this.logger.log(`Scheduled report executed successfully: ${schedule.name}`);
    } catch (error) {
      this.logger.error(`Failed to execute scheduled report: ${schedule.name}`, error);
    }
  }

  private calculateNextRunTime(frequency: ScheduleFrequency, currentDate: Date): Date {
    const nextRun = new Date(currentDate);

    switch (frequency) {
      case ScheduleFrequency.DAILY:
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case ScheduleFrequency.WEEKLY:
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case ScheduleFrequency.MONTHLY:
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
      case ScheduleFrequency.QUARTERLY:
        nextRun.setMonth(nextRun.getMonth() + 3);
        break;
      case ScheduleFrequency.YEARLY:
        nextRun.setFullYear(nextRun.getFullYear() + 1);
        break;
    }

    return nextRun;
  }

  private async sendReportToRecipients(report: Report, recipients: string[]): Promise<void> {
    // Mock email sending - integrate with your email service
    this.logger.log(`Sending report ${report.name} to recipients: ${recipients.join(', ')}`);

    // In real implementation, use email service like SendGrid, SES, etc.
    // await this.emailService.sendReportEmail(report, recipients);
  }
}
