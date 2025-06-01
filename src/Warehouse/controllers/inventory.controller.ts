import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { CreateInventoryItemDto } from '../dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from '../dto/update-inventory-item.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() createInventoryItemDto: CreateInventoryItemDto) {
    return this.inventoryService.create(createInventoryItemDto);
  }

  @Get()
  findAll(@Query('warehouseId') warehouseId?: string, @Query('locationId') locationId?: string) {
    if (warehouseId) {
      return this.inventoryService.findByWarehouse(warehouseId);
    }
    if (locationId) {
      return this.inventoryService.findByLocation(locationId);
    }
    return this.inventoryService.findAll();
  }

  @Get('low-stock')
  getLowStock(@Query('warehouseId') warehouseId?: string, @Query('threshold') threshold?: number) {
    return this.inventoryService.getLowStockItems(warehouseId, threshold);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInventoryItemDto: UpdateInventoryItemDto) {
    return this.inventoryService.update(id, updateInventoryItemDto);
  }

  @Patch(':id/adjust-quantity')
  adjustQuantity(@Param('id') id: string, @Body('quantityChange') quantityChange: number) {
    return this.inventoryService.adjustQuantity(id, quantityChange);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}

