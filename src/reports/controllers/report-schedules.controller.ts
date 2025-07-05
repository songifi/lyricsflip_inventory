import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from '../reports.service';
import { ScheduleReportDto } from '../dto/schedule-report.dto';
import { ReportSchedule } from '../entities/report-schedule.entity';
// import { AuthGuard } from '../../common/guards/auth.guard';

@ApiTags('Report Schedules')
@Controller('report-schedules')
// @UseGuards(AuthGuard)
// @ApiBearerAuth()
export class ReportSchedulesController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new report schedule' })
  @ApiResponse({ status: 201, description: 'Schedule created successfully', type: ReportSchedule })
  async createSchedule(
    @Body() scheduleDto: ScheduleReportDto,
    // @CurrentUser() user: any,
  ): Promise<ReportSchedule> {
    return this.reportsService.createSchedule(scheduleDto, 'user-id');
  }

  @Get()
  @ApiOperation({ summary: 'Get all report schedules' })
  @ApiResponse({ status: 200, description: 'Schedules retrieved successfully' })
  async getAllSchedules() // @CurrentUser() user: any,
  : Promise<ReportSchedule[]> {
    return this.reportsService.getAllSchedules('user-id');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get schedule by ID' })
  @ApiResponse({ status: 200, description: 'Schedule found', type: ReportSchedule })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async getScheduleById(@Param('id', ParseUUIDPipe) id: string): Promise<ReportSchedule> {
    return this.reportsService.getScheduleById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update report schedule' })
  @ApiResponse({ status: 200, description: 'Schedule updated successfully', type: ReportSchedule })
  async updateSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: Partial<ScheduleReportDto>,
  ): Promise<ReportSchedule> {
    return this.reportsService.updateSchedule(id, updateData);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle schedule active status' })
  @ApiResponse({ status: 200, description: 'Schedule toggled successfully', type: ReportSchedule })
  async toggleSchedule(@Param('id', ParseUUIDPipe) id: string): Promise<ReportSchedule> {
    return this.reportsService.toggleSchedule(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete report schedule' })
  @ApiResponse({ status: 200, description: 'Schedule deleted successfully' })
  async deleteSchedule(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.reportsService.deleteSchedule(id);
    return { message: 'Schedule deleted successfully' };
  }
}
