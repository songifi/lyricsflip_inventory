// src/purchase-orders/purchase-orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { AddPurchaseOrderItemDto } from './dto/add-purchase-order-item.dto';

@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(createPurchaseOrderDto);
  }

  @Get()
  findAll() {
    return this.purchaseOrdersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrdersService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto,
  ) {
    return this.purchaseOrdersService.update(id, updatePurchaseOrderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.purchaseOrdersService.remove(id);
  }

  @Post(':id/approve')
  approve(
    @Param('id') id: string,
    @Body('approvedBy') approvedBy: string,
  ) {
    return this.purchaseOrdersService.approve(id, approvedBy);
  }

  @Post(':id/items')
  addItem(
    @Param('id') id: string,
    @Body() addItemDto: AddPurchaseOrderItemDto,
  ) {
    return this.purchaseOrdersService.addItem(id, addItemDto);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeItem(
    @Param('id') orderId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.purchaseOrdersService.removeItem(orderId, itemId);
  }

  @Patch(':id/items/:itemId/quantity')
  updateItemQuantity(
    @Param('id') orderId: string,
    @Param('itemId') itemId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.purchaseOrdersService.updateItemQuantity(orderId, itemId, quantity);
  }
}