import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Warehouse } from "../entities/warehouse.entity"
import type { WarehouseStockLevel } from "../entities/warehouse-stock-level.entity"
import type { CreateWarehouseDto } from "../dto/create-warehouse.dto"

@Injectable()
export class WarehouseService {
  constructor(
    private warehouseRepository: Repository<Warehouse>,
    private stockLevelRepository: Repository<WarehouseStockLevel>,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    const warehouse = this.warehouseRepository.create(createWarehouseDto)
    return this.warehouseRepository.save(warehouse)
  }

  async findAll(): Promise<Warehouse[]> {
    return this.warehouseRepository.find({
      relations: ["stockLevels", "stockLevels.product"],
    })
  }

  async findOne(id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne(id, {
      relations: ["stockLevels", "stockLevels.product", "transactions"],
    })

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`)
    }

    return warehouse
  }

  async update(id: string, updateWarehouseDto: Partial<CreateWarehouseDto>): Promise<Warehouse> {
    const warehouse = await this.findOne(id)
    Object.assign(warehouse, updateWarehouseDto)
    return this.warehouseRepository.save(warehouse)
  }

  async remove(id: string): Promise<void> {
    const result = await this.warehouseRepository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`)
    }
  }

  async getStockLevels(warehouseId: string): Promise<WarehouseStockLevel[]> {
    return this.stockLevelRepository.find({
      where: { warehouseId },
      relations: ["product"],
    })
  }

  async getStockLevel(warehouseId: string, productId: string): Promise<WarehouseStockLevel> {
    const stockLevel = await this.stockLevelRepository.findOne({
      where: { warehouseId, productId },
      relations: ["product", "warehouse"],
    })

    if (!stockLevel) {
      throw new NotFoundException(`Stock level not found for product ${productId} in warehouse ${warehouseId}`)
    }

    return stockLevel
  }
}
