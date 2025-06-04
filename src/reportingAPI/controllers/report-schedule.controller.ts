import { Controller, Get, Post, Body, Param, Query, Delete, Put } from '@nestjs/common';
import { ReportScheduleService } from '../services/report-schedule.service';
import { CreateReportScheduleDto } from '../dto/create-report-schedule.dto';
import { ReportSchedule } from '../entities/report-schedule.entity';

@Controller('api/report-schedules')
export class ReportScheduleController {
  constructor(private readonly reportScheduleService: ReportScheduleService) {}

  @Post()
  async create(@Body() createScheduleDto: CreateReportScheduleDto): Promise<ReportSchedule> {
    return this.reportScheduleService.create(createScheduleDto);
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('userId') userId?: string,
  ): Promise<{ data: ReportSchedule[]; total: number; page: number; limit: number }> {
    return this.reportScheduleService.findAll(page, limit, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ReportSchedule> {
    return this.reportScheduleService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<ReportSchedule>): Promise<ReportSchedule> {
    return this.reportScheduleService.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.reportScheduleService.remove(id);
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string): Promise<ReportSchedule> {
    return this.reportScheduleService.activate(id);
  }

  @Post(':id/deactivate')
  async deactivate(@Param('id') id: string): Promise<ReportSchedule> {
    return this.reportScheduleService.deactivate(id);
  }

  @Post(':id/run-now')
  async runNow(@Param('id') id: string): Promise<void> {
    return this.reportScheduleService.runNow(id);
  }
}
