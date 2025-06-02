import { Controller, Post, Get, Body, Param, Query, Patch, HttpCode, HttpStatus } from '@nestjs/common';
import { InventoryMovementService } from './inventory-movement.service';
import { CreateMovementDto, TransferStockDto } from './inventory-movement.dto';
import { MovementType } from './inventory-movement.entity';

@Controller('inventory/movements')
export class InventoryMovementController {
  constructor(private readonly inventoryService: InventoryMovementService) {}

  @Post('stock-in')
  async stockIn(@Body() dto: CreateMovementDto) {
    dto.type = MovementType.STOCK_IN;
    return this.inventoryService.stockIn(dto);
  }

  @Post('stock-out')
  async stockOut(@Body() dto: CreateMovementDto) {
    dto.type = MovementType.STOCK_OUT;
    return this.inventoryService.stockOut(dto);
  }

  @Post('transfer')
  async transferStock(@Body() dto: TransferStockDto) {
    return this.inventoryService.transferStock(dto);
  }

  @Post('adjust')
  async adjustStock(@Body() body: {
    productId: string;
    locationId: string;
    newQuantity: number;
    reason: string;
    userId?: string;
  }) {
    return this.inventoryService.adjustStock(
      body.productId,
      body.locationId,
      body.newQuantity,
      body.reason,
      body.userId
    );
  }

  @Get('history')
  async getMovementHistory(
    @Query('productId') productId?: string,
    @Query('locationId') locationId?: string,
    @Query('type') type?: MovementType,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0
  ) {
    return this.inventoryService.getMovementHistory(productId, locationId, type, +limit, +offset);
  }

  @Get('stock-levels')
  async getStockLevels(
    @Query('productId') productId?: string,
    @Query('locationId') locationId?: string
  ) {
    return this.inventoryService.getStockLevels(productId, locationId);
  }

  @Patch(':id/rollback')
  @HttpCode(HttpStatus.NO_CONTENT)
  async rollbackMovement(@Param('id') id: string) {
    return this.inventoryService.rollbackMovement(id);
  }
}