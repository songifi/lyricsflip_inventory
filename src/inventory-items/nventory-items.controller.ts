import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InventoryItemsService } from './inventory-items.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { InventoryItemQueryDto } from './dto/inventory-item-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Adjust import path
import { CompanyGuard } from '../auth/guards/company.guard'; // Adjust import path

@Controller('inventory-items')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class InventoryItemsController {
  constructor(private readonly inventoryItemsService: InventoryItemsService) {}

  @Post()
  async create(
    @Body() createInventoryItemDto: CreateInventoryItemDto,
    @Request() req,
  ) {
    return await this.inventoryItemsService.create(
      createInventoryItemDto,
      req.user.companyId,
    );
  }

  @Get()
  async findAll(@Query() queryDto: InventoryItemQueryDto, @Request() req) {
    return await this.inventoryItemsService.findAll(req.user.companyId, queryDto);
  }

  @Get('search')
  async search(@Query() queryDto: InventoryItemQueryDto, @Request() req) {
    return await this.inventoryItemsService.search(req.user.companyId, queryDto);
  }

  @Get('low-stock')
  async findLowStockItems(@Request() req) {
    return await this.inventoryItemsService.findLowStockItems(req.user.companyId);
  }

  @Get('categories')
  async getCategories(@Request() req) {
    return await this.inventoryItemsService.getCategories(req.user.companyId);
  }

  @Get('locations')
  async getLocations(@Request() req) {
    return await this.inventoryItemsService.getLocations(req.user.companyId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return await this.inventoryItemsService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInventoryItemDto: UpdateInventoryItemDto,
    @Request() req,
  ) {
    return await this.inventoryItemsService.update(
      id,
      updateInventoryItemDto,
      req.user.companyId,
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.inventoryItemsService.remove(id, req.user.companyId);
    return { message: 'Inventory item deleted successfully' };
  }

  @Patch(':id/stock')
  async updateStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('stock') stock: number,
    @Request() req,
  ) {
    if (typeof stock !== 'number' || stock < 0) {
      throw new BadRequestException('Stock must be a non-negative number');
    }
    return await this.inventoryItemsService.updateStock(id, stock, req.user.companyId);
  }

  @Post(':id/images')
  @UseInterceptors(FileInterceptor('image'))
  async addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('isPrimary') isPrimary: string,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // In a real implementation, you would upload the file to cloud storage
    // and get back a URL. For this example, we'll use a placeholder URL.
    const imageData = {
      filename: file.originalname,
      url: `https://your-storage.com/inventory-items/${id}/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
      isPrimary: isPrimary === 'true',
    };

    return await this.inventoryItemsService.addImage(id, imageData, req.user.companyId);
  }

  @Delete(':id/images/:imageId')
  async removeImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Request() req,
  ) {
    await this.inventoryItemsService.removeImage(imageId, id, req.user.companyId);
    return { message: 'Image deleted successfully' };
  }
}