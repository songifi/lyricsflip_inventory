// src/inventory/inventory.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { MoveStockDto, TransferStockDto, AdjustStockDto } from './inventory.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('move')
  @ApiOperation({ summary: 'Move stock between locations' })
  @ApiResponse({ status: 201, description: 'Stock moved successfully' })
  moveStock(@Body() dto: MoveStockDto) {
    return this.inventoryService.moveStock(dto);
  }

  @Get('levels')
  @ApiOperation({ summary: 'Get current stock levels' })
  @ApiResponse({ status: 200, description: 'Current inventory levels' })
  getStockLevels() {
    return this.inventoryService.getStockLevels();
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer stock between multiple locations' })
  @ApiResponse({ status: 201, description: 'Stock transfer successful' })
  transferStock(@Body() dto: TransferStockDto) {
    return this.inventoryService.transferStock(dto);
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Adjust stock levels' })
  @ApiResponse({ status: 201, description: 'Stock adjusted successfully' })
  adjustStock(@Body() dto: AdjustStockDto) {
    return this.inventoryService.adjustStock(dto);
  }
}