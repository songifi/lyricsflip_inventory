import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from "@nestjs/common"
import type { StockLevelService } from "../services/stock-level.service"
import type { CreateStockLevelDto } from "../dto/create-stock-level.dto"
import type { UpdateStockLevelDto } from "../dto/update-stock-level.dto"
import type { StockMovementDto } from "../dto/stock-movement.dto"
import type { StockAlertSettingsDto } from "../dto/stock-alert-settings.dto"
import type { StockLevelQueryDto } from "../dto/stock-level-query.dto"

@Controller("stock-levels")
export class StockLevelController {
  constructor(private readonly stockLevelService: StockLevelService) {}

  @Post()
  create(@Body() createStockLevelDto: CreateStockLevelDto) {
    return this.stockLevelService.create(createStockLevelDto);
  }

  @Get()
  findAll(@Query() queryDto: StockLevelQueryDto) {
    return this.stockLevelService.findAll(queryDto);
  }

  @Get("low-stock")
  getLowStockItems() {
    return this.stockLevelService.getLowStockItems()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockLevelService.findOne(id);
  }

  @Patch(":id")
  update(@Param('id') id: string, @Body() updateStockLevelDto: UpdateStockLevelDto) {
    return this.stockLevelService.update(id, updateStockLevelDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.stockLevelService.remove(id);
  }

  @Post('movement')
  processMovement(@Body() movementDto: StockMovementDto) {
    return this.stockLevelService.processStockMovement(movementDto);
  }

  @Patch('alert-settings')
  updateAlertSettings(@Body() settingsDto: StockAlertSettingsDto) {
    return this.stockLevelService.updateAlertSettings(settingsDto);
  }

  @Get(':id/history')
  getStockHistory(@Param('id') id: string) {
    return this.stockLevelService.getStockHistory(id);
  }

  @Get(":id/movement-summary")
  getMovementSummary(@Param('id') id: string, @Query('days') days: number = 30) {
    return this.stockLevelService.getStockMovementSummary(id, days)
  }
}
