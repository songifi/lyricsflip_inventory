import { Body, Controller, Get, Param, ParseUUIDPipe, Put, Query, UseGuards, Req } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { SettingQueryDto } from "../dto/setting-query.dto";
import { SettingResponseDto } from "../dto/setting-response.dto";
import { UpdateSettingValueDto } from "../dto/setting-value.dto";
import { SettingsService } from "../services/settings.service";

@Controller('companies/:companyId/settings')
@UseGuards(JwtAuthGuard)
export class CompanySettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getCompanySettings(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query() query: SettingQueryDto,
  ): Promise<SettingResponseDto[]> {
    return this.settingsService.getCompanySettings(companyId, query);
  }

  @Put(':key')
  async updateCompanySetting(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('key') key: string,
    @Body() updateDto: UpdateSettingValueDto,
    @Req() req: any,
  ): Promise<SettingResponseDto> {
    return this.settingsService.updateByKey(key, updateDto, req.user.sub, companyId);
  }

  @Get(':key')
  async getCompanySetting(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('key') key: string,
  ): Promise<SettingResponseDto> {
    return this.settingsService.findByKey(key, companyId);
  }

  @Get(':key/history')
  async getCompanySettingHistory(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('key') key: string,
    @Query('limit') limit?: number,
  ) {
    return this.settingsService.getSettingHistory(key, companyId, limit);
  }
}