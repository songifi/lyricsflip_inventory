import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository, Connection } from "typeorm"
import type { EventEmitter2 } from "@nestjs/event-emitter"
import { InventoryTransaction, TransactionStatus, TransactionType } from "../entities/inventory-transaction.entity"
import type { TransactionItem } from "../entities/transaction-item.entity"
import type { TransactionAudit, AuditAction } from "../entities/transaction-audit.entity"
import type { WarehouseStockLevel } from "../entities/warehouse-stock-level.entity"
import type { Product } from "../../stock/entities/product.entity"
import type { CreateTransactionDto } from "../dto/create-transaction.dto"
import type { UpdateTransactionStatusDto } from "../dto/update-transaction-status.dto"
import type { ProcessTransactionDto } from "../dto/process-transaction.dto"
import type { TransactionQueryDto } from "../dto/transaction-query.dto"

@Injectable()
export class InventoryTransactionService {
  constructor(
    private transactionRepository: Repository<InventoryTransaction>,
    private transactionItemRepository: Repository<TransactionItem>,
    private auditRepository: Repository<TransactionAudit>,
    private warehouseStockRepository: Repository<WarehouseStockLevel>,
    private productRepository: Repository<Product>,
    private connection: Connection,
    private eventEmitter: EventEmitter2,
  ) {}

  @InjectRepository(InventoryTransaction)
  private transactionRepository: Repository<InventoryTransaction>

  async create(createTransactionDto: CreateTransactionDto): Promise<InventoryTransaction> {
    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Generate transaction number
      const transactionNumber = await this.generateTransactionNumber(createTransactionDto.type)

      // Validate products exist
      for (const itemDto of createTransactionDto.items) {
        const product = await this.productRepository.findOne(itemDto.productId)
        if (!product) {
          throw new NotFoundException(`Product with ID ${itemDto.productId} not found`)
        }
      }

      // Create transaction
      const transaction = this.transactionRepository.create({
        ...createTransactionDto,
        transactionNumber,
        status: TransactionStatus.DRAFT,
      })

      const savedTransaction = await queryRunner.manager.save(transaction)

      // Create transaction items
      for (const itemDto of createTransactionDto.items) {
        const product = await this.productRepository.findOne(itemDto.productId)
        const transactionItem = this.transactionItemRepository.create({
          ...itemDto,
          transactionId: savedTransaction.id,
          sku: product.sku,
          productName: product.name,
          totalCost: itemDto.unitCost ? itemDto.plannedQuantity * itemDto.unitCost : null,
          expirationDate: itemDto.expirationDate ? new Date(itemDto.expirationDate) : null,
        })
        await queryRunner.manager.save(transactionItem)
      }

      // Create audit trail
      await this.createAuditEntry(
        queryRunner.manager,
        savedTransaction.id,
        AuditAction.CREATED,
        createTransactionDto.initiatedBy,
        null,
        null,
        null,
        "Transaction created",
      )

      await queryRunner.commitTransaction()

      // Emit transaction created event
      this.eventEmitter.emit("inventory.transaction.created", { transaction: savedTransaction })

      return this.findOne(savedTransaction.id)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async findAll(queryDto: TransactionQueryDto): Promise<InventoryTransaction[]> {
    const query = this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.warehouse", "warehouse")
      .leftJoinAndSelect("transaction.destinationWarehouse", "destinationWarehouse")
      .leftJoinAndSelect("transaction.items", "items")
      .leftJoinAndSelect("items.product", "product")

    if (queryDto.type) {
      query.andWhere("transaction.type = :type", { type: queryDto.type })
    }

    if (queryDto.status) {
      query.andWhere("transaction.status = :status", { status: queryDto.status })
    }

    if (queryDto.priority) {
      query.andWhere("transaction.priority = :priority", { priority: queryDto.priority })
    }

    if (queryDto.warehouseId) {
      query.andWhere("transaction.warehouseId = :warehouseId", { warehouseId: queryDto.warehouseId })
    }

    if (queryDto.productId) {
      query.andWhere("items.productId = :productId", { productId: queryDto.productId })
    }

    if (queryDto.initiatedBy) {
      query.andWhere("transaction.initiatedBy = :initiatedBy", { initiatedBy: queryDto.initiatedBy })
    }

    if (queryDto.referenceNumber) {
      query.andWhere("transaction.referenceNumber ILIKE :referenceNumber", {
        referenceNumber: `%${queryDto.referenceNumber}%`,
      })
    }

    if (queryDto.createdAfter) {
      query.andWhere("transaction.createdAt >= :createdAfter", { createdAfter: queryDto.createdAfter })
    }

    if (queryDto.createdBefore) {
      query.andWhere("transaction.createdAt <= :createdBefore", { createdBefore: queryDto.createdBefore })
    }

    return query.orderBy("transaction.createdAt", "DESC").getMany()
  }

  async findOne(id: string): Promise<InventoryTransaction> {
    const transaction = await this.transactionRepository.findOne(id, {
      relations: ["warehouse", "destinationWarehouse", "items", "items.product", "auditTrail", "parentTransaction"],
    })

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`)
    }

    return transaction
  }

  async updateStatus(id: string, updateStatusDto: UpdateTransactionStatusDto): Promise<InventoryTransaction> {
    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const transaction = await this.findOne(id)
      const oldStatus = transaction.status
      const newStatus = updateStatusDto.status

      // Validate status transition
      this.validateStatusTransition(oldStatus, newStatus)

      // Update transaction status
      transaction.status = newStatus

      // Set timestamps based on status
      const now = new Date()
      switch (newStatus) {
        case TransactionStatus.APPROVED:
          transaction.approvedBy = updateStatusDto.performedBy
          transaction.approvedAt = now
          break
        case TransactionStatus.PROCESSING:
          transaction.processedBy = updateStatusDto.performedBy
          transaction.processedAt = now
          break
        case TransactionStatus.COMPLETED:
          transaction.completedAt = now
          break
      }

      await queryRunner.manager.save(transaction)

      // Create audit trail
      await this.createAuditEntry(
        queryRunner.manager,
        transaction.id,
        AuditAction.STATUS_CHANGED,
        updateStatusDto.performedBy || "system",
        "status",
        oldStatus,
        newStatus,
        updateStatusDto.reason || `Status changed from ${oldStatus} to ${newStatus}`,
        updateStatusDto.metadata,
      )

      await queryRunner.commitTransaction()

      // Emit status change event
      this.eventEmitter.emit("inventory.transaction.status.changed", {
        transaction,
        oldStatus,
        newStatus,
        performedBy: updateStatusDto.performedBy,
      })

      return this.findOne(id)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async processTransaction(id: string, processDto: ProcessTransactionDto): Promise<InventoryTransaction> {
    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const transaction = await this.findOne(id)

      if (transaction.status !== TransactionStatus.APPROVED) {
        throw new BadRequestException("Transaction must be approved before processing")
      }

      // Update transaction items with actual quantities
      for (const itemDto of processDto.items) {
        const item = transaction.items.find((i) => i.id === itemDto.itemId)
        if (!item) {
          throw new NotFoundException(`Transaction item with ID ${itemDto.itemId} not found`)
        }

        item.actualQuantity = itemDto.actualQuantity
        item.varianceQuantity = itemDto.actualQuantity - item.plannedQuantity
        if (itemDto.notes) {
          item.notes = itemDto.notes
        }

        await queryRunner.manager.save(item)
      }

      // Update warehouse stock levels
      await this.updateWarehouseStockLevels(queryRunner.manager, transaction)

      // Update transaction status
      transaction.status = TransactionStatus.COMPLETED
      transaction.processedBy = processDto.processedBy || "system"
      transaction.processedAt = new Date()
      transaction.completedAt = new Date()

      await queryRunner.manager.save(transaction)

      // Create audit trail
      await this.createAuditEntry(
        queryRunner.manager,
        transaction.id,
        AuditAction.PROCESSED,
        processDto.processedBy || "system",
        null,
        null,
        null,
        "Transaction processed and completed",
      )

      await queryRunner.commitTransaction()

      // Emit transaction completed event
      this.eventEmitter.emit("inventory.transaction.completed", { transaction })

      return this.findOne(id)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async reverseTransaction(id: string, reason: string, performedBy: string): Promise<InventoryTransaction> {
    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const originalTransaction = await this.findOne(id)

      if (originalTransaction.status !== TransactionStatus.COMPLETED) {
        throw new BadRequestException("Only completed transactions can be reversed")
      }

      if (originalTransaction.isReversed) {
        throw new BadRequestException("Transaction has already been reversed")
      }

      // Create reversal transaction
      const reversalType = this.getReversalTransactionType(originalTransaction.type)
      const reversalTransactionNumber = await this.generateTransactionNumber(reversalType)

      const reversalTransaction = this.transactionRepository.create({
        transactionNumber: reversalTransactionNumber,
        type: reversalType,
        status: TransactionStatus.COMPLETED,
        priority: originalTransaction.priority,
        warehouseId: originalTransaction.destinationWarehouseId || originalTransaction.warehouseId,
        destinationWarehouseId: originalTransaction.warehouseId,
        referenceNumber: originalTransaction.transactionNumber,
        referenceType: "reversal",
        initiatedBy: performedBy,
        processedBy: performedBy,
        approvedBy: performedBy,
        reason,
        parentTransactionId: originalTransaction.id,
        approvedAt: new Date(),
        processedAt: new Date(),
        completedAt: new Date(),
      })

      const savedReversalTransaction = await queryRunner.manager.save(reversalTransaction)

      // Create reversal transaction items
      for (const originalItem of originalTransaction.items) {
        const reversalItem = this.transactionItemRepository.create({
          transactionId: savedReversalTransaction.id,
          productId: originalItem.productId,
          sku: originalItem.sku,
          productName: originalItem.productName,
          plannedQuantity: originalItem.actualQuantity,
          actualQuantity: originalItem.actualQuantity,
          varianceQuantity: 0,
          unitCost: originalItem.unitCost,
          totalCost: originalItem.totalCost,
          lotNumber: originalItem.lotNumber,
          serialNumber: originalItem.serialNumber,
          expirationDate: originalItem.expirationDate,
          condition: originalItem.condition,
          location: originalItem.location,
          notes: `Reversal of transaction ${originalTransaction.transactionNumber}`,
        })
        await queryRunner.manager.save(reversalItem)
      }

      // Update warehouse stock levels for reversal
      await this.updateWarehouseStockLevels(queryRunner.manager, savedReversalTransaction)

      // Mark original transaction as reversed
      originalTransaction.isReversed = true
      originalTransaction.reversalTransactionId = savedReversalTransaction.id
      await queryRunner.manager.save(originalTransaction)

      // Create audit trails
      await this.createAuditEntry(
        queryRunner.manager,
        originalTransaction.id,
        AuditAction.REVERSED,
        performedBy,
        null,
        null,
        null,
        `Transaction reversed. Reversal transaction: ${reversalTransactionNumber}`,
      )

      await this.createAuditEntry(
        queryRunner.manager,
        savedReversalTransaction.id,
        AuditAction.CREATED,
        performedBy,
        null,
        null,
        null,
        `Reversal transaction created for ${originalTransaction.transactionNumber}`,
      )

      await queryRunner.commitTransaction()

      // Emit transaction reversed event
      this.eventEmitter.emit("inventory.transaction.reversed", {
        originalTransaction,
        reversalTransaction: savedReversalTransaction,
        performedBy,
      })

      return this.findOne(savedReversalTransaction.id)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async getTransactionsByProduct(productId: string): Promise<InventoryTransaction[]> {
    return this.transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.items", "items")
      .leftJoinAndSelect("transaction.warehouse", "warehouse")
      .where("items.productId = :productId", { productId })
      .orderBy("transaction.createdAt", "DESC")
      .getMany()
  }

  async getTransactionsByWarehouse(warehouseId: string): Promise<InventoryTransaction[]> {
    return this.transactionRepository.find({
      where: [{ warehouseId }, { destinationWarehouseId: warehouseId }],
      relations: ["items", "items.product", "warehouse", "destinationWarehouse"],
      order: { createdAt: "DESC" },
    })
  }

  async getAuditTrail(transactionId: string): Promise<TransactionAudit[]> {
    return this.auditRepository.find({
      where: { transactionId },
      order: { timestamp: "DESC" },
    })
  }

  private async generateTransactionNumber(type: TransactionType): Promise<string> {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    const typePrefix = this.getTransactionTypePrefix(type)

    // Get count of transactions of this type today
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

    const count = await this.transactionRepository.count({
      where: {
        type,
        createdAt: {
          $gte: startOfDay,
          $lt: endOfDay,
        } as any,
      },
    })

    const sequence = String(count + 1).padStart(4, "0")
    return `${typePrefix}-${year}${month}${day}-${sequence}`
  }

  private getTransactionTypePrefix(type: TransactionType): string {
    const prefixes = {
      [TransactionType.RECEIPT]: "RCP",
      [TransactionType.SHIPMENT]: "SHP",
      [TransactionType.TRANSFER]: "TRF",
      [TransactionType.ADJUSTMENT]: "ADJ",
      [TransactionType.CYCLE_COUNT]: "CNT",
      [TransactionType.DAMAGE]: "DMG",
      [TransactionType.RETURN]: "RTN",
      [TransactionType.ALLOCATION]: "ALC",
      [TransactionType.DEALLOCATION]: "DAL",
      [TransactionType.RESERVATION]: "RSV",
      [TransactionType.RELEASE]: "REL",
    }
    return prefixes[type] || "TXN"
  }

  private getReversalTransactionType(originalType: TransactionType): TransactionType {
    const reversalMap = {
      [TransactionType.RECEIPT]: TransactionType.SHIPMENT,
      [TransactionType.SHIPMENT]: TransactionType.RECEIPT,
      [TransactionType.ALLOCATION]: TransactionType.DEALLOCATION,
      [TransactionType.DEALLOCATION]: TransactionType.ALLOCATION,
      [TransactionType.RESERVATION]: TransactionType.RELEASE,
      [TransactionType.RELEASE]: TransactionType.RESERVATION,
    }
    return reversalMap[originalType] || TransactionType.ADJUSTMENT
  }

  private validateStatusTransition(from: TransactionStatus, to: TransactionStatus): void {
    const validTransitions = {
      [TransactionStatus.DRAFT]: [TransactionStatus.PENDING, TransactionStatus.CANCELLED],
      [TransactionStatus.PENDING]: [TransactionStatus.APPROVED, TransactionStatus.CANCELLED],
      [TransactionStatus.APPROVED]: [TransactionStatus.PROCESSING, TransactionStatus.CANCELLED],
      [TransactionStatus.PROCESSING]: [TransactionStatus.COMPLETED, TransactionStatus.CANCELLED],
      [TransactionStatus.COMPLETED]: [TransactionStatus.REVERSED],
      [TransactionStatus.CANCELLED]: [],
      [TransactionStatus.REVERSED]: [],
    }

    if (!validTransitions[from]?.includes(to)) {
      throw new BadRequestException(`Invalid status transition from ${from} to ${to}`)
    }
  }

  private async updateWarehouseStockLevels(manager: any, transaction: InventoryTransaction): Promise<void> {
    for (const item of transaction.items) {
      const quantity = item.actualQuantity || item.plannedQuantity

      switch (transaction.type) {
        case TransactionType.RECEIPT:
          await this.adjustWarehouseStock(manager, transaction.warehouseId, item.productId, quantity, "add")
          break
        case TransactionType.SHIPMENT:
          await this.adjustWarehouseStock(manager, transaction.warehouseId, item.productId, quantity, "subtract")
          break
        case TransactionType.TRANSFER:
          await this.adjustWarehouseStock(manager, transaction.warehouseId, item.productId, quantity, "subtract")
          if (transaction.destinationWarehouseId) {
            await this.adjustWarehouseStock(
              manager,
              transaction.destinationWarehouseId,
              item.productId,
              quantity,
              "add",
            )
          }
          break
        case TransactionType.ADJUSTMENT:
          // For adjustments, the quantity represents the new total, not the change
          const currentStock = await this.getWarehouseStock(manager, transaction.warehouseId, item.productId)
          const adjustment = quantity - currentStock.availableQuantity
          if (adjustment !== 0) {
            await this.adjustWarehouseStock(
              manager,
              transaction.warehouseId,
              item.productId,
              Math.abs(adjustment),
              adjustment > 0 ? "add" : "subtract",
            )
          }
          break
        case TransactionType.ALLOCATION:
          await this.adjustWarehouseStock(manager, transaction.warehouseId, item.productId, quantity, "allocate")
          break
        case TransactionType.DEALLOCATION:
          await this.adjustWarehouseStock(manager, transaction.warehouseId, item.productId, quantity, "deallocate")
          break
      }
    }
  }

  private async adjustWarehouseStock(
    manager: any,
    warehouseId: string,
    productId: string,
    quantity: number,
    operation: "add" | "subtract" | "allocate" | "deallocate",
  ): Promise<void> {
    let stockLevel = await manager.findOne(WarehouseStockLevel, {
      where: { warehouseId, productId },
    })

    if (!stockLevel) {
      stockLevel = manager.create(WarehouseStockLevel, {
        warehouseId,
        productId,
        availableQuantity: 0,
        allocatedQuantity: 0,
        reservedQuantity: 0,
        damagedQuantity: 0,
        totalQuantity: 0,
      })
    }

    switch (operation) {
      case "add":
        stockLevel.availableQuantity += quantity
        stockLevel.totalQuantity += quantity
        break
      case "subtract":
        stockLevel.availableQuantity -= quantity
        stockLevel.totalQuantity -= quantity
        break
      case "allocate":
        stockLevel.availableQuantity -= quantity
        stockLevel.allocatedQuantity += quantity
        break
      case "deallocate":
        stockLevel.availableQuantity += quantity
        stockLevel.allocatedQuantity -= quantity
        break
    }

    await manager.save(stockLevel)
  }

  private async getWarehouseStock(manager: any, warehouseId: string, productId: string): Promise<WarehouseStockLevel> {
    let stockLevel = await manager.findOne(WarehouseStockLevel, {
      where: { warehouseId, productId },
    })

    if (!stockLevel) {
      stockLevel = {
        availableQuantity: 0,
        allocatedQuantity: 0,
        reservedQuantity: 0,
        damagedQuantity: 0,
        totalQuantity: 0,
      } as WarehouseStockLevel
    }

    return stockLevel
  }

  private async createAuditEntry(
    manager: any,
    transactionId: string,
    action: AuditAction,
    performedBy: string,
    fieldName?: string,
    oldValue?: string,
    newValue?: string,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const audit = manager.create(TransactionAudit, {
      transactionId,
      action,
      performedBy,
      fieldName,
      oldValue,
      newValue,
      description,
      metadata,
    })

    await manager.save(audit)
  }
}
