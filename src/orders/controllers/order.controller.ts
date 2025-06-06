import { Controller, Get, Post, Body, Patch, Param, Query, HttpCode, HttpStatus } from "@nestjs/common"
import type { OrderService } from "../services/order.service"
import type { CreateOrderDto } from "../dto/create-order.dto"
import type { UpdateOrderStatusDto } from "../dto/update-order-status.dto"
import type { OrderQueryDto } from "../dto/order-query.dto"
import type { UpdateTrackingDto } from "../dto/update-tracking.dto"
import type { OrderStatus } from "../entities/order.entity"

@Controller("orders")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  findAll(@Query() queryDto: OrderQueryDto) {
    return this.orderService.findAll(queryDto);
  }

  @Get("status/:status")
  findByStatus(@Param("status") status: OrderStatus) {
    return this.orderService.getOrdersByStatus(status)
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.orderService.findOne(id)
  }

  @Get(":id/valid-transitions")
  getValidTransitions(@Param("id") id: string) {
    return this.orderService.getValidTransitions(id)
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() updateStatusDto: UpdateOrderStatusDto) {
    return this.orderService.updateStatus(id, updateStatusDto)
  }

  @Patch(":id/tracking")
  updateTracking(@Param("id") id: string, @Body() updateTrackingDto: UpdateTrackingDto) {
    return this.orderService.updateTracking(id, updateTrackingDto)
  }

  @Patch(":id/cancel")
  @HttpCode(HttpStatus.OK)
  cancel(@Param("id") id: string, @Body() body: { reason?: string; changedBy?: string }) {
    return this.orderService.cancel(id, body.reason, body.changedBy)
  }
}
