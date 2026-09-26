import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CompanyService, CreateCompanyDto, UpdateCompanyDto, CompanySettings } from './company.service';
import { Company, CompanyStatus } from './company.entity';
import { AuthGuard } from '../auth/auth.guard';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  async findAll(): Promise<Company[]> {
    return this.companyService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Company> {
    return this.companyService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createCompanyDto: CreateCompanyDto, @Request() req): Promise<Company> {
    return this.companyService.create({
      ...createCompanyDto,
      ownerId: req.user.id,
    });
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.companyService.remove(id);
  }

  @Get(':id/settings')
  async getSettings(@Param('id') id: string): Promise<CompanySettings> {
    return this.companyService.getSettings(id);
  }

  @Put(':id/settings')
  @UseGuards(AuthGuard)
  async updateSettings(
    @Param('id') id: string,
    @Body() settings: CompanySettings,
  ): Promise<CompanySettings> {
    return this.companyService.updateSettings(id, settings);
  }

  @Put(':id/status')
  @UseGuards(AuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: CompanyStatus,
  ): Promise<Company> {
    return this.companyService.updateStatus(id, status);
  }
}
