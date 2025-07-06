import { Controller, Get, Post, Patch, Param, Delete, ParseUUIDPipe, HttpStatus, HttpCode } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger"
import type { SalesOrderService } from "./sales.service"
import type { CreateOrderDto } from "./dto/create-order.dto"
import type { UpdateOrderDto } from "./dto/update-order.dto"
import type { OrderQueryDto } from "./dto/order-query.dto"
import type { FulfillOrderDto, ShipOrderDto } from "./dto/fulfillment.dto"
import type { CreateTrackingEventDto } from "./dto/tracking.dto"

@ApiTags("sales-orders")
@Controller("sales-orders")
export class SalesOrderController {
  constructor(private readonly salesOrderService: SalesOrderService) {}

  // Order Creation and Management
  @Post()
  @ApiOperation({ summary: "Create a new sales order" })
  @ApiResponse({ status: 201, description: "Order created successfully" })
  async create(createOrderDto: CreateOrderDto) {
    return await this.salesOrderService.create(createOrderDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all sales orders" })
  @ApiResponse({ status: 200, description: "Orders retrieved successfully" })
  async findAll() {
    return await this.salesOrderService.findAll()
  }

  @Get("search")
  @ApiOperation({ summary: "Search and filter sales orders" })
  @ApiResponse({ status: 200, description: "Order search results" })
  async searchOrders(query: OrderQueryDto) {
    return await this.salesOrderService.searchOrders(query)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a sales order by ID" })
  @ApiResponse({ status: 200, description: "Order retrieved successfully" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async findOne(@Param("id", ParseUUIDPipe) id: string) {
    return await this.salesOrderService.findOne(id)
  }

  @Get("number/:orderNumber")
  @ApiOperation({ summary: "Get a sales order by order number" })
  @ApiResponse({ status: 200, description: "Order retrieved successfully" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async findByOrderNumber(@Param("orderNumber") orderNumber: string) {
    return await this.salesOrderService.findByOrderNumber(orderNumber)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a sales order" })
  @ApiResponse({ status: 200, description: "Order updated successfully" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async update(@Param("id", ParseUUIDPipe) id: string, updateOrderDto: UpdateOrderDto) {
    return await this.salesOrderService.update(id, updateOrderDto)
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Cancel a sales order" })
  @ApiResponse({ status: 200, description: "Order cancelled successfully" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async cancel(@Param("id", ParseUUIDPipe) id: string, reason?: string) {
    return await this.salesOrderService.cancel(id, reason)
  }

  // Order Fulfillment Endpoints
  @Patch(":id/fulfill")
  @ApiOperation({ summary: "Fulfill a sales order" })
  @ApiResponse({ status: 200, description: "Order fulfilled successfully" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async fulfillOrder(@Param("id", ParseUUIDPipe) id: string, fulfillDto: FulfillOrderDto) {
    return await this.salesOrderService.fulfillOrder(id, fulfillDto)
  }

  @Patch(":id/ship")
  @ApiOperation({ summary: "Ship a sales order" })
  @ApiResponse({ status: 200, description: "Order shipped successfully" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async shipOrder(@Param("id", ParseUUIDPipe) id: string, shipDto: ShipOrderDto) {
    return await this.salesOrderService.shipOrder(id, shipDto)
  }

  @Patch(":id/deliver")
  @ApiOperation({ summary: "Mark order as delivered" })
  @ApiResponse({ status: 200, description: "Order marked as delivered" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async markAsDelivered(@Param("id", ParseUUIDPipe) id: string) {
    return await this.salesOrderService.markAsDelivered(id)
  }

  // Shipping Integration APIs
  @Get(":id/shipping-rates")
  @ApiOperation({ summary: "Get shipping rates for an order" })
  @ApiResponse({ status: 200, description: "Shipping rates retrieved successfully" })
  async getShippingRates(@Param("id", ParseUUIDPipe) id: string) {
    return await this.salesOrderService.getShippingRates(id)
  }

  // Order Tracking Endpoints
  @Get(":id/tracking")
  @ApiOperation({ summary: "Get order tracking history" })
  @ApiResponse({ status: 200, description: "Tracking history retrieved successfully" })
  async getOrderTracking(@Param("id", ParseUUIDPipe) id: string) {
    return await this.salesOrderService.getOrderTracking(id)
  }

  @Post(":id/tracking")
  @ApiOperation({ summary: "Add tracking event to order" })
  @ApiResponse({ status: 201, description: "Tracking event added successfully" })
  async createTrackingEvent(@Param("id", ParseUUIDPipe) id: string, trackingDto: CreateTrackingEventDto) {
    return await this.salesOrderService.createTrackingEvent(id, trackingDto)
  }

  @Get("track/:orderNumber")
  @ApiOperation({ summary: "Track order by order number" })
  @ApiResponse({ status: 200, description: "Order tracking information retrieved" })
  async trackByOrderNumber(@Param("orderNumber") orderNumber: string) {
    return await this.salesOrderService.trackByOrderNumber(orderNumber)
  }
}
