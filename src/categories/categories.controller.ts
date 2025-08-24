import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Request, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompanyGuard } from '../auth/guards/company.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(@Request() req) {
    return this.categoriesService.findAll(req.user.companyId);
  }

  @Get('tree')
  async getTree(@Request() req) {
    return this.categoriesService.getTree(req.user.companyId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.categoriesService.findOne(id, req.user.companyId);
  }

  @Get(':id/children')
  async getChildren(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.categoriesService.getChildren(id, req.user.companyId);
  }

  @Post()
  async create(@Body() dto: CreateCategoryDto, @Request() req) {
    return this.categoriesService.create(dto, req.user.companyId);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
    @Request() req,
  ) {
    return this.categoriesService.update(id, dto, req.user.companyId);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.categoriesService.remove(id, req.user.companyId);
    return { message: 'Category deleted successfully' };
  }
}
