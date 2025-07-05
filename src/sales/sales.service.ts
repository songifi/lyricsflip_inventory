import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { SalesOrder, OrderStatus } from "./entities/sales-order.entity"
import type { OrderItem } from "./entities/order-item.entity"
import type { OrderTracking, TrackingEventType } from "./entities/order-tracking.entity"
import type { CreateOrderDto } from "./dto/create-order.dto"
import type { UpdateOrderDto } from "./dto/update-order.dto"
import type { OrderQueryDto } from "./dto/order-query.dto"
import type { FulfillOrderDto, ShipOrderDto } from "./dto/fulfillment.dto"
import type { CreateTrackingEventDto } from "./dto/tracking.dto"

@Injectable()
export class SalesOrderService {
  constructor(
    private salesOrderRepository: Repository<SalesOrder>,
    private orderItemRepository: Repository<OrderItem>,
    private orderTrackingRepository: Repository<OrderTracking>,
  ) {}

  // Order Creation and Management
  async create(createOrderDto: CreateOrderDto): Promise<SalesOrder> {
    const orderNumber = await this.generateOrderNumber()

    // Calculate totals
    const subtotal = createOrderDto.items.reduce((sum, item) => {
      return sum + item.unitPrice * item.quantity
    }, 0)

    const taxAmount = createOrderDto.taxAmount || 0
    const shippingCost = createOrderDto.shippingCost || 0
    const discountAmount = createOrderDto.discountAmount || 0
    const totalAmount = subtotal + taxAmount + shippingCost - discountAmount

    // Create order
    const order = this.salesOrderRepository.create({
      ...createOrderDto,
      orderNumber,
      subtotal,
      taxAmount,
      shippingCost,
      discountAmount,
      totalAmount,
      currency: createOrderDto.currency || "USD",
    })

    // Create order items
    const orderItems = createOrderDto.items.map((item) =>
      this.orderItemRepository.create({
        ...item,
        totalPrice: item.unitPrice * item.quantity,
      }),
    )

    order.items = orderItems
    const savedOrder = await this.salesOrderRepository.save(order)

    // Create initial tracking event
    await this.createTrackingEvent(savedOrder.id, {
      eventType: "order_created" as TrackingEventType,
      description: "Order has been created",
      metadata: { orderNumber },
    })

    return this.findOne(savedOrder.id)
  }

  async findAll(): Promise<SalesOrder[]> {
    return await this.salesOrderRepository.find({
      relations: ["items", "trackingHistory"],
      order: { createdAt: "DESC" },
    })
  }

  async findOne(id: string): Promise<SalesOrder> {
    const order = await this.salesOrderRepository.findOne({
      where: { id },
      relations: ["items", "trackingHistory"],
    })

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`)
    }

    return order
  }

  async findByOrderNumber(orderNumber: string): Promise<SalesOrder> {
    const order = await this.salesOrderRepository.findOne({
      where: { orderNumber },
      relations: ["items", "trackingHistory"],
    })

    if (!order) {
      throw new NotFoundException(`Order with number ${orderNumber} not found`)
    }

    return order
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<SalesOrder> {
    const order = await this.findOne(id)

    // Recalculate totals if amounts changed
    if (
      updateOrderDto.taxAmount !== undefined ||
      updateOrderDto.shippingCost !== undefined ||
      updateOrderDto.discountAmount !== undefined
    ) {
      const taxAmount = updateOrderDto.taxAmount ?? order.taxAmount
      const shippingCost = updateOrderDto.shippingCost ?? order.shippingCost
      const discountAmount = updateOrderDto.discountAmount ?? order.discountAmount
      const totalAmount = order.subtotal + taxAmount + shippingCost - discountAmount

      updateOrderDto.totalAmount = totalAmount
    }

    Object.assign(order, updateOrderDto)
    return await this.salesOrderRepository.save(order)
  }

  async cancel(id: string, reason?: string): Promise<SalesOrder> {
    const order = await this.findOne(id)

    if (order.status === "delivered" || order.status === "cancelled") {
      throw new BadRequestException(`Cannot cancel order with status: ${order.status}`)
    }

    order.status = "cancelled" as OrderStatus
    const updatedOrder = await this.salesOrderRepository.save(order)

    // Create tracking event
    await this.createTrackingEvent(id, {
      eventType: "cancelled" as TrackingEventType,
      description: reason || "Order has been cancelled",
      metadata: { reason },
    })

    return updatedOrder
  }

  // Order Search and Filtering
  async searchOrders(query: OrderQueryDto): Promise<{
    orders: SalesOrder[]
    total: number
    page: number
    totalPages: number
  }> {
    const queryBuilder = this.salesOrderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("order.trackingHistory", "tracking")

    // Filter by customer
    if (query.customerId) {
      queryBuilder.andWhere("order.customerId = :customerId", { customerId: query.customerId })
    }

    // Filter by status
    if (query.status) {
      queryBuilder.andWhere("order.status = :status", { status: query.status })
    }

    // Filter by payment status
    if (query.paymentStatus) {
      queryBuilder.andWhere("order.paymentStatus = :paymentStatus", { paymentStatus: query.paymentStatus })
    }

    // Filter by order number
    if (query.orderNumber) {
      queryBuilder.andWhere("order.orderNumber ILIKE :orderNumber", { orderNumber: `%${query.orderNumber}%` })
    }

    // Filter by date range
    if (query.startDate) {
      queryBuilder.andWhere("order.createdAt >= :startDate", { startDate: query.startDate })
    }
    if (query.endDate) {
      queryBuilder.andWhere("order.createdAt <= :endDate", { endDate: query.endDate })
    }

    // Sorting
    queryBuilder.orderBy(`order.${query.sortBy}`, query.sortOrder)

    // Pagination
    const skip = (query.page - 1) * query.limit
    queryBuilder.skip(skip).take(query.limit)

    const [orders, total] = await queryBuilder.getManyAndCount()
    const totalPages = Math.ceil(total / query.limit)

    return { orders, total, page: query.page, totalPages }
  }

  // Order Fulfillment
  async fulfillOrder(id: string, fulfillDto: FulfillOrderDto): Promise<SalesOrder> {
    const order = await this.findOne(id)

    order.status = fulfillDto.status
    if (fulfillDto.trackingNumber) {
      order.trackingNumber = fulfillDto.trackingNumber
    }
    if (fulfillDto.shippingMethod) {
      order.shippingMethod = fulfillDto.shippingMethod
    }

    const updatedOrder = await this.salesOrderRepository.save(order)

    // Create tracking event
    await this.createTrackingEvent(id, {
      eventType: this.getTrackingEventFromStatus(fulfillDto.status),
      description: `Order status updated to ${fulfillDto.status}`,
      metadata: {
        previousStatus: order.status,
        trackingNumber: fulfillDto.trackingNumber,
        notes: fulfillDto.notes,
      },
    })

    return updatedOrder
  }

  async shipOrder(id: string, shipDto: ShipOrderDto): Promise<SalesOrder> {
    const order = await this.findOne(id)

    order.status = "shipped" as OrderStatus
    order.trackingNumber = shipDto.trackingNumber
    order.shippingMethod = shipDto.shippingMethod
    order.shippedAt = new Date()

    const updatedOrder = await this.salesOrderRepository.save(order)

    // Create tracking event
    await this.createTrackingEvent(id, {
      eventType: "shipped" as TrackingEventType,
      description: "Order has been shipped",
      metadata: {
        trackingNumber: shipDto.trackingNumber,
        shippingMethod: shipDto.shippingMethod,
        notes: shipDto.notes,
      },
    })

    return updatedOrder
  }

  async markAsDelivered(id: string): Promise<SalesOrder> {
    const order = await this.findOne(id)

    order.status = "delivered" as OrderStatus
    order.deliveredAt = new Date()

    const updatedOrder = await this.salesOrderRepository.save(order)

    // Create tracking event
    await this.createTrackingEvent(id, {
      eventType: "delivered" as TrackingEventType,
      description: "Order has been delivered",
    })

    return updatedOrder
  }

  // Order Tracking
  async createTrackingEvent(orderId: string, trackingDto: CreateTrackingEventDto): Promise<OrderTracking> {
    const tracking = this.orderTrackingRepository.create({
      ...trackingDto,
      orderId,
    })

    return await this.orderTrackingRepository.save(tracking)
  }

  async getOrderTracking(id: string): Promise<OrderTracking[]> {
    return await this.orderTrackingRepository.find({
      where: { orderId: id },
      order: { createdAt: "ASC" },
    })
  }

  async trackByOrderNumber(orderNumber: string): Promise<{
    order: SalesOrder
    tracking: OrderTracking[]
  }> {
    const order = await this.findByOrderNumber(orderNumber)
    const tracking = await this.getOrderTracking(order.id)

    return { order, tracking }
  }

  // Shipping Integration (Mock implementation)
  async getShippingRates(orderId: string): Promise<any[]> {
    const order = await this.findOne(orderId)

    // Mock shipping rates - integrate with real shipping providers
    return [
      {
        service: "Standard Shipping",
        cost: 9.99,
        estimatedDays: "5-7 business days",
      },
      {
        service: "Express Shipping",
        cost: 19.99,
        estimatedDays: "2-3 business days",
      },
      {
        service: "Overnight Shipping",
        cost: 39.99,
        estimatedDays: "1 business day",
      },
    ]
  }

  async validateShippingAddress(address: any): Promise<boolean> {
    // Mock address validation - integrate with real address validation service
    return true
  }

  // Helper Methods
  private async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `ORD-${timestamp}-${random}`
  }

  private getTrackingEventFromStatus(status: OrderStatus): TrackingEventType {
    const statusMap: Record<OrderStatus, TrackingEventType> = {
      pending: "order_created" as TrackingEventType,
      confirmed: "order_confirmed" as TrackingEventType,
      processing: "processing_started" as TrackingEventType,
      shipped: "shipped" as TrackingEventType,
      delivered: "delivered" as TrackingEventType,
      cancelled: "cancelled" as TrackingEventType,
      refunded: "cancelled" as TrackingEventType,
    }

    return statusMap[status] || ("order_created" as TrackingEventType)
  }
}
