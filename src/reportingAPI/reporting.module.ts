import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportController } from './controllers/report.controller';
import { CustomReportController } from './controllers/custom-report.controller';
import { ReportScheduleController } from './controllers/report-schedule.controller';
import { ReportExportController } from './controllers/report-export.controller';
import { ReportService } from './services/report.service';
import { CustomReportService } from './services/custom-report.service';
import { ReportScheduleService } from './services/report-schedule.service';
import { ReportExportService } from './services/report-export.service';
import { Report } from './entities/report.entity';
import { CustomReport } from './entities/custom-report.entity';
import { ReportSchedule } from './entities/report-schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, CustomReport, ReportSchedule]),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    ReportController,
    CustomReportController,
    ReportScheduleController,
    ReportExportController,
  ],
  providers: [
    ReportService,
    CustomReportService,
    ReportScheduleService,
    ReportExportService,
  ],
  exports: [
    ReportService,
    CustomReportService,
    ReportScheduleService,
    ReportExportService,
  ],
})
export class ReportingModule {}