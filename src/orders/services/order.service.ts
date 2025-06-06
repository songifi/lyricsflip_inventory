import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository, Connection } from "typeorm"
import type { EventEmitter2 } from "@nestjs/event-emitter"
import { Order, OrderStatus } from "../entities/order.entity"
import type { OrderItem } from "../entities/order-item.entity"
import type { OrderStatusHistory } from "../entities/order-status-history.entity"
import type { Product } from "../../stock/entities/product.entity"
import type { StockLevelService } from "../../stock/services/stock-level.service"
import type { OrderWorkflowService } from "./order-workflow.service"
import type { CreateOrderDto } from "../dto/create-order.dto"
import type { UpdateOrderStatusDto } from "../dto/update-order-status.dto"
import type { OrderQueryDto } from "../dto/order-query.dto"
import type { UpdateTrackingDto } from "../dto/update-tracking.dto"
import { StockMovementType } from "../../stock/dto/stock-movement.dto"

@Injectable()
export class OrderService {
  constructor(
    private orderRepository: Repository<Order>,
    private orderItemRepository: Repository<OrderItem>,
    private statusHistoryRepository: Repository<OrderStatusHistory>,
    private productRepository: Repository<Product>,
    private connection: Connection,
    private eventEmitter: EventEmitter2,
    private stockLevelService: StockLevelService,
    private workflowService: OrderWorkflowService,
    @InjectRepository(Order)
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // Generate order number
      const orderNumber = await this.generateOrderNumber()

      // Calculate totals
      let subtotal = 0
      const orderItems: Partial<OrderItem>[] = []

      for (const itemDto of createOrderDto.items) {
        const product = await this.productRepository.findOne(itemDto.productId)
        if (!product) {
          throw new NotFoundException(`Product with ID ${itemDto.productId} not found`)
        }

        const totalPrice = itemDto.quantity * itemDto.unitPrice
        subtotal += totalPrice

        orderItems.push({
          productId: itemDto.productId,
          quantity: itemDto.quantity,
          unitPrice: itemDto.unitPrice,
          totalPrice,
          sku: product.sku,
          productName: product.name,
        })
      }

      // Create order
      const order = this.orderRepository.create({
        orderNumber,
        customerId: createOrderDto.customerId,
        priority: createOrderDto.priority,
        subtotal,
        totalAmount: subtotal, // Simplified - in real app, add tax and shipping
        shippingAddress: createOrderDto.shippingAddress,
        billingAddress: createOrderDto.billingAddress,
        notes: createOrderDto.notes,
        assignedTo: createOrderDto.assignedTo,
        status: OrderStatus.DRAFT,
      })

      const savedOrder = await queryRunner.manager.save(order)

      // Create order items
      for (const itemData of orderItems) {
        const orderItem = this.orderItemRepository.create({
          ...itemData,
          orderId: savedOrder.id,
        })
        await queryRunner.manager.save(orderItem)
      }

      // Create initial status history
      const statusHistory = this.statusHistoryRepository.create({
        orderId: savedOrder.id,
        fromStatus: OrderStatus.DRAFT,
        toStatus: OrderStatus.DRAFT,
        changedBy: createOrderDto.assignedTo || "system",
        reason: "Order created",
      })
      await queryRunner.manager.save(statusHistory)

      await queryRunner.commitTransaction()

      // Emit order created event
      this.eventEmitter.emit("order.created", { order: savedOrder })

      return this.findOne(savedOrder.id)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async findAll(queryDto: OrderQueryDto): Promise<Order[]> {
    const query = this.orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("items.product", "product")
      .leftJoinAndSelect("order.customer", "customer")

    if (queryDto.status) {
      query.andWhere("order.status = :status", { status: queryDto.status })
    }

    if (queryDto.priority) {
      query.andWhere("order.priority = :priority", { priority: queryDto.priority })
    }

    if (queryDto.customerId) {
      query.andWhere("order.customerId = :customerId", { customerId: queryDto.customerId })
    }

    if (queryDto.assignedTo) {
      query.andWhere("order.assignedTo = :assignedTo", { assignedTo: queryDto.assignedTo })
    }

    if (queryDto.orderNumber) {
      query.andWhere("order.orderNumber ILIKE :orderNumber", { orderNumber: `%${queryDto.orderNumber}%` })
    }

    if (queryDto.createdAfter) {
      query.andWhere("order.createdAt >= :createdAfter", { createdAfter: queryDto.createdAfter })
    }

    if (queryDto.createdBefore) {
      query.andWhere("order.createdAt <= :createdBefore", { createdBefore: queryDto.createdBefore })
    }

    return query.orderBy("order.createdAt", "DESC").getMany()
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne(id, {
      relations: ["items", "items.product", "customer", "statusHistory"],
    })

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`)
    }

    return order
  }

  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const queryRunner = this.connection.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const order = await this.findOne(id)
      const currentStatus = order.status
      const newStatus = updateStatusDto.status

      // Validate transition
      this.workflowService.validateTransition(currentStatus, newStatus)

      // Check required conditions
      const requiredConditions = this.workflowService.getRequiredConditions(currentStatus, newStatus)
      await this.validateConditions(order, requiredConditions)

      // Execute required actions
      const requiredActions = this.workflowService.getRequiredActions(currentStatus, newStatus)
      await this.executeActions(order, requiredActions)

      // Update order status
      order.status = newStatus
      await queryRunner.manager.save(order)

      // Create status history record
      const statusHistory = this.statusHistoryRepository.create({
        orderId: order.id,
        fromStatus: currentStatus,
        toStatus: newStatus,
        changedBy: updateStatusDto.changedBy || "system",
        reason: updateStatusDto.reason,
        notes: updateStatusDto.notes,
        metadata: updateStatusDto.metadata,
      })
      await queryRunner.manager.save(statusHistory)

      await queryRunner.commitTransaction()

      // Emit status change event
      this.eventEmitter.emit("order.status.changed", {
        order,
        fromStatus: currentStatus,
        toStatus: newStatus,
        changedBy: updateStatusDto.changedBy,
      })

      return this.findOne(id)
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async updateTracking(id: string, updateTrackingDto: UpdateTrackingDto): Promise<Order> {
    const order = await this.findOne(id)

    order.trackingNumber = updateTrackingDto.trackingNumber
    order.shippingCarrier = updateTrackingDto.shippingCarrier

    if (updateTrackingDto.estimatedDeliveryDate) {
      order.estimatedDeliveryDate = new Date(updateTrackingDto.estimatedDeliveryDate)
    }

    await this.orderRepository.save(order)

    // Emit tracking updated event
    this.eventEmitter.emit("order.tracking.updated", { order })

    return order
  }

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    return this.orderRepository.find({
      where: { status },
      relations: ["items", "items.product", "customer"],
    })
  }

  async getValidTransitions(id: string): Promise<OrderStatus[]> {
    const order = await this.findOne(id)
    return this.workflowService.getValidTransitions(order.status)
  }

  async cancel(id: string, reason?: string, changedBy?: string): Promise<Order> {
    return this.updateStatus(id, {
      status: OrderStatus.CANCELLED,
      reason: reason || "Order cancelled",
      changedBy: changedBy || "system",
    })
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    // Get count of orders today
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)

    const count = await this.orderRepository.count({
      where: {
        createdAt: {
          $gte: startOfDay,
          $lt: endOfDay,
        } as any,
      },
    })

    const sequence = String(count + 1).padStart(4, "0")
    return `ORD-${year}${month}${day}-${sequence}`
  }

  private async validateConditions(order: Order, conditions: string[]): Promise<void> {
    for (const condition of conditions) {
      switch (condition) {
        case "payment_verified":
          // In a real app, check payment status
          break
        case "stock_available":
          await this.validateStockAvailability(order)
          break
        case "stock_allocated":
          await this.validateStockAllocation(order)
          break
        case "all_items_picked":
          await this.validateAllItemsPicked(order)
          break
        case "shipping_label_created":
          if (!order.trackingNumber) {
            throw new BadRequestException("Shipping label must be created before shipping")
          }
          break
      }
    }
  }

  private async executeActions(order: Order, actions: string[]): Promise<void> {
    for (const action of actions) {
      switch (action) {
        case "allocate_stock":
          await this.allocateStock(order)
          break
        case "release_stock":
          await this.releaseStock(order)
          break
      }
    }
  }

  private async validateStockAvailability(order: Order): Promise<void> {
    for (const item of order.items) {
      const stockLevels = await this.stockLevelService.findAll({ productId: item.productId })
      const totalAvailable = stockLevels.reduce((sum, stock) => sum + stock.currentQuantity, 0)

      if (totalAvailable < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${item.productName}. Required: ${item.quantity}, Available: ${totalAvailable}`,
        )
      }
    }
  }

  private async validateStockAllocation(order: Order): Promise<void> {
    for (const item of order.items) {
      if (item.allocatedQuantity < item.quantity) {
        throw new BadRequestException(`Stock not fully allocated for product ${item.productName}`)
      }
    }
  }

  private async validateAllItemsPicked(order: Order): Promise<void> {
    for (const item of order.items) {
      if (item.pickedQuantity < item.quantity) {
        throw new BadRequestException(`Not all items picked for product ${item.productName}`)
      }
    }
  }

  private async allocateStock(order: Order): Promise<void> {
    for (const item of order.items) {
      // In a real implementation, you would allocate stock from specific locations
      // For now, we'll just reduce the stock level
      const stockLevels = await this.stockLevelService.findAll({ productId: item.productId })

      let remainingToAllocate = item.quantity
      for (const stockLevel of stockLevels) {
        if (remainingToAllocate <= 0) break

        const toAllocate = Math.min(remainingToAllocate, stockLevel.currentQuantity)
        if (toAllocate > 0) {
          await this.stockLevelService.processStockMovement({
            stockLevelId: stockLevel.id,
            quantity: toAllocate,
            type: StockMovementType.REDUCTION,
            reference: order.orderNumber,
            performedBy: "system",
            notes: `Stock allocated for order ${order.orderNumber}`,
          })

          remainingToAllocate -= toAllocate
        }
      }

      // Update allocated quantity
      item.allocatedQuantity = item.quantity - remainingToAllocate
      await this.orderItemRepository.save(item)
    }
  }

  private async releaseStock(order: Order): Promise<void> {
    for (const item of order.items) {
      if (item.allocatedQuantity > 0) {
        // Find stock levels for this product and add back the allocated quantity
        const stockLevels = await this.stockLevelService.findAll({ productId: item.productId })

        if (stockLevels.length > 0) {
          // Add back to the first available stock level
          await this.stockLevelService.processStockMovement({
            stockLevelId: stockLevels[0].id,
            quantity: item.allocatedQuantity,
            type: StockMovementType.ADDITION,
            reference: order.orderNumber,
            performedBy: "system",
            notes: `Stock released from cancelled order ${order.orderNumber}`,
          })
        }

        // Reset allocated quantity
        item.allocatedQuantity = 0
        await this.orderItemRepository.save(item)
      }
    }
  }
}
