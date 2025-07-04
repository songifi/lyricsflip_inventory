import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Report } from './entities/report.entity';
import { ReportSchedule } from './entities/report-schedule.entity';
import { ReportsController } from './controllers/reports.controller';
import { ReportSchedulesController } from './controllers/report-schedules.controller';
import { ReportsService } from './reports.service';
import { ReportGenerationService } from './services/report-generation.service';
import { ReportExportService } from './services/report-export.service';
import { ReportSchedulerService } from './services/report-scheduler.service';

@Module({
  imports: [TypeOrmModule.forFeature([Report, ReportSchedule]), ScheduleModule.forRoot()],
  controllers: [ReportsController, ReportSchedulesController],
  providers: [ReportsService, ReportGenerationService, ReportExportService, ReportSchedulerService],
  exports: [ReportsService],
})
export class ReportsModule {}
