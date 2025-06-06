import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { Connection } from "typeorm"
import type { StockLevelRepository } from "../repositories/stock-level.repository"
import type { StockHistoryRepository } from "../repositories/stock-history.repository"
import type { StockLevel } from "../entities/stock-level.entity"
import type { StockHistory } from "../entities/stock-history.entity"
import type { CreateStockLevelDto } from "../dto/create-stock-level.dto"
import type { UpdateStockLevelDto } from "../dto/update-stock-level.dto"
import { type StockMovementDto, StockMovementType } from "../dto/stock-movement.dto"
import type { StockAlertSettingsDto } from "../dto/stock-alert-settings.dto"
import { type StockLevelQueryDto, StockStatus } from "../dto/stock-level-query.dto"
import type { EventEmitter2 } from "@nestjs/event-emitter"

@Injectable()
export class StockLevelService {
  constructor(
    private stockLevelRepository: StockLevelRepository,
    private stockHistoryRepository: StockHistoryRepository,
    private connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createStockLevelDto: CreateStockLevelDto): Promise<StockLevel> {
    const stockLevel = this.stockLevelRepository.create({
      ...createStockLevelDto,
      status: this.calculateStockStatus(
        createStockLevelDto.currentQuantity,
        createStockLevelDto.minimumThreshold,
        createStockLevelDto.maximumThreshold,
      ),
    })

    const savedStockLevel = await this.stockLevelRepository.save(stockLevel)

    // Create initial stock history entry
    await this.stockHistoryRepository.save({
      stockLevelId: savedStockLevel.id,
      quantityBefore: 0,
      quantityAfter: savedStockLevel.currentQuantity,
      quantityChanged: savedStockLevel.currentQuantity,
      type: StockMovementType.INVENTORY_COUNT,
      notes: "Initial stock level creation",
    })

    return savedStockLevel
  }

  async findAll(queryDto: StockLevelQueryDto): Promise<StockLevel[]> {
    return this.stockLevelRepository.findByQuery(queryDto)
  }

  async findOne(id: string): Promise<StockLevel> {
    const stockLevel = await this.stockLevelRepository.findOne(id, {
      relations: ["product", "history"],
    })

    if (!stockLevel) {
      throw new NotFoundException(`Stock level with ID ${id} not found`)
    }

    return stockLevel
  }

  async update(id: string, updateStockLevelDto: UpdateStockLevelDto): Promise<StockLevel> {
    const stockLevel = await this.findOne(id)

    // Update stock level properties
    Object.assign(stockLevel, updateStockLevelDto)

    // Recalculate status if quantity or thresholds changed
    if (
      updateStockLevelDto.currentQuantity !== undefined ||
      updateStockLevelDto.minimumThreshold !== undefined ||
      updateStockLevelDto.maximumThreshold !== undefined
    ) {
      stockLevel.status = this.calculateStockStatus(
        stockLevel.currentQuantity,
        stockLevel.minimumThreshold,
        stockLevel.maximumThreshold,
      )
    }

    return this.stockLevelRepository.save(stockLevel)
  }

  async remove(id: string): Promise<void> {
    const result = await this.stockLevelRepository.delete(id)

    if (result.affected === 0) {
      throw new NotFoundException(`Stock level with ID ${id} not found`)
    }
  }

  async processStockMovement(movementDto: StockMovementDto): Promise<StockLevel> {
    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const stockLevel = await this.stockLevelRepository.findOne(movementDto.stockLevelId, {
        relations: ["product"],
      })

      if (!stockLevel) {
        throw new NotFoundException(`Stock level with ID ${movementDto.stockLevelId} not found`)
      }

      const quantityBefore = stockLevel.currentQuantity
      let quantityAfter = quantityBefore
      let quantityChanged = movementDto.quantity

      // Calculate new quantity based on movement type
      switch (movementDto.type) {
        case StockMovementType.ADDITION:
          quantityAfter = quantityBefore + movementDto.quantity
          break
        case StockMovementType.REDUCTION:
          if (quantityBefore < movementDto.quantity) {
            throw new BadRequestException("Insufficient stock available")
          }
          quantityAfter = quantityBefore - movementDto.quantity
          quantityChanged = -movementDto.quantity // Negative for reduction
          break
        case StockMovementType.ADJUSTMENT:
        case StockMovementType.INVENTORY_COUNT:
          quantityAfter = movementDto.quantity
          quantityChanged = movementDto.quantity - quantityBefore
          break
      }

      // Create stock history record
      const stockHistory = this.stockHistoryRepository.create({
        stockLevelId: stockLevel.id,
        quantityBefore,
        quantityAfter,
        quantityChanged,
        type: movementDto.type,
        reference: movementDto.reference,
        performedBy: movementDto.performedBy,
        notes: movementDto.notes,
      })

      // Update stock level
      stockLevel.currentQuantity = quantityAfter
      stockLevel.status = this.calculateStockStatus(
        quantityAfter,
        stockLevel.minimumThreshold,
        stockLevel.maximumThreshold,
      )

      // Save changes
      await queryRunner.manager.save(stockHistory)
      await queryRunner.manager.save(stockLevel)

      // Commit transaction
      await queryRunner.commitTransaction()

      // Emit stock update event
      this.eventEmitter.emit("stock.updated", {
        stockLevel,
        movement: movementDto,
        previousQuantity: quantityBefore,
      })

      // Emit stock alert event if needed
      if (stockLevel.alertEnabled && (stockLevel.status === "low" || stockLevel.status === "out_of_stock")) {
        this.eventEmitter.emit("stock.alert", {
          stockLevel,
          product: stockLevel.product,
          status: stockLevel.status,
        })
      }

      return stockLevel
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      // Release query runner
      await queryRunner.release()
    }
  }

  async updateAlertSettings(settingsDto: StockAlertSettingsDto): Promise<StockLevel> {
    const stockLevel = await this.findOne(settingsDto.stockLevelId)

    stockLevel.alertEnabled = settingsDto.alertEnabled

    if (settingsDto.minimumThreshold !== undefined) {
      stockLevel.minimumThreshold = settingsDto.minimumThreshold
    }

    if (settingsDto.maximumThreshold !== undefined) {
      stockLevel.maximumThreshold = settingsDto.maximumThreshold
    }

    if (settingsDto.reorderQuantity !== undefined) {
      stockLevel.reorderQuantity = settingsDto.reorderQuantity
    }

    // Recalculate status with new thresholds
    stockLevel.status = this.calculateStockStatus(
      stockLevel.currentQuantity,
      stockLevel.minimumThreshold,
      stockLevel.maximumThreshold,
    )

    return this.stockLevelRepository.save(stockLevel)
  }

  async getStockHistory(stockLevelId: string): Promise<StockHistory[]> {
    return this.stockHistoryRepository.findByStockLevelId(stockLevelId)
  }

  async getLowStockItems(): Promise<StockLevel[]> {
    return this.stockLevelRepository.findLowStock()
  }

  async getStockMovementSummary(stockLevelId: string, days = 30): Promise<any> {
    return this.stockHistoryRepository.getStockMovementSummary(stockLevelId, days)
  }

  private calculateStockStatus(
    currentQuantity: number,
    minimumThreshold: number,
    maximumThreshold?: number,
  ): StockStatus {
    if (currentQuantity <= 0) {
      return StockStatus.OUT_OF_STOCK
    } else if (currentQuantity <= minimumThreshold) {
      return StockStatus.LOW
    } else if (maximumThreshold && currentQuantity > maximumThreshold) {
      return StockStatus.OVERSTOCKED
    } else {
      return StockStatus.AVAILABLE
    }
  }
}
