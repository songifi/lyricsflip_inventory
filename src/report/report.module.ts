import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportsService } from './report.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportTemplate } from './entities/report.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [TypeOrmModule.forFeature([ReportTemplate]), ScheduleModule.forRoot(),],
  controllers: [ReportController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportModule {}
