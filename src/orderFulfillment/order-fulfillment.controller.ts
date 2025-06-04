// orderFulfillment/order-fulfillment.controller.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { OrderFulfillmentService } from './order-fulfillment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderValidationDto } from './dto/order-validation.dto';

@Controller('order-fulfillment')
export class OrderFulfillmentController {
  constructor(private readonly orderFulfillmentService: OrderFulfillmentService) {}

  @Post('validate')
  async validateOrder(@Body(ValidationPipe) orderData: OrderValidationDto) {
    return this.orderFulfillmentService.validateOrder(orderData);
  }

  @Post('process')
  async processOrder(@Body(ValidationPipe) createOrderDto: CreateOrderDto) {
    return this.orderFulfillmentService.processOrder(createOrderDto);
  }

  @Get('orders')
  async getOrders(@Query('status') status?: string) {
    return this.orderFulfillmentService.getOrders(status);
  }

  @Get('orders/:id')
  async getOrder(@Param('id') id: string) {
    return this.orderFulfillmentService.getOrder(id);
  }

  @Put('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body(ValidationPipe) updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.orderFulfillmentService.updateOrderStatus(id, updateStatusDto.status);
  }

  @Post('orders/:id/allocate')
  async allocateInventory(@Param('id') id: string) {
    return this.orderFulfillmentService.allocateInventory(id);
  }

  @Post('orders/:id/picking-list')
  async generatePickingList(@Param('id') id: string) {
    return this.orderFulfillmentService.generatePickingList(id);
  }

  @Post('orders/:id/prepare-shipping')
  async prepareShipping(@Param('id') id: string) {
    return this.orderFulfillmentService.prepareShipping(id);
  }
}