import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from "@nestjs/common"
import type { WarehouseService } from "../services/warehouse.service"
import type { CreateWarehouseDto } from "../dto/create-warehouse.dto"

@Controller("warehouses")
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehouseService.create(createWarehouseDto);
  }

  @Get()
  findAll() {
    return this.warehouseService.findAll()
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.warehouseService.findOne(id)
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateWarehouseDto: Partial<CreateWarehouseDto>) {
    return this.warehouseService.update(id, updateWarehouseDto)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.warehouseService.remove(id)
  }

  @Get(":id/stock-levels")
  getStockLevels(@Param("id") id: string) {
    return this.warehouseService.getStockLevels(id)
  }

  @Get(":warehouseId/stock-levels/:productId")
  getStockLevel(@Param("warehouseId") warehouseId: string, @Param("productId") productId: string) {
    return this.warehouseService.getStockLevel(warehouseId, productId)
  }
}
