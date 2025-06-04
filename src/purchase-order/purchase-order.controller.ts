import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ApprovePurchaseOrderDto } from './dto/approve-purchase-order.dto';
import { ReceiveGoodsDto } from './dto/receive-goods.dto';
import { PurchaseOrderStatus } from './entities/purchase-order.entity';

@ApiTags('Purchase Orders')
@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create purchase order',
    description: 'Create a new purchase order in DRAFT status' 
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Purchase order created successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Supplier or product not found' 
  })
  create(@Body() createPurchaseOrderDto: CreatePurchaseOrderDto) {
    return this.purchaseOrderService.create(createPurchaseOrderDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all purchase orders',
    description: 'Retrieve all purchase orders with optional status filtering' 
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    enum: PurchaseOrderStatus,
    description: 'Filter by purchase order status' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Purchase orders retrieved successfully' 
  })
  findAll(@Query('status') status?: PurchaseOrderStatus) {
    return this.purchaseOrderService.findAll(status);
  }

  @Get('statistics')
  @ApiOperation({ 
    summary: 'Get purchase order statistics',
    description: 'Retrieve statistics about purchase orders by status' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Statistics retrieved successfully' 
  })
  getStatistics() {
    return this.purchaseOrderService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get purchase order by ID',
    description: 'Retrieve a specific purchase order with all details' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Purchase order UUID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Purchase order retrieved successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Purchase order not found' 
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseOrderService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update purchase order',
    description: 'Update purchase order (only DRAFT orders can be updated)' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Purchase order UUID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Purchase order updated successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Cannot update non-DRAFT orders' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Purchase order not found' 
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto,
  ) {
    return this.purchaseOrderService.update(id, updatePurchaseOrderDto);
  }

  @Post(':id/submit-for-approval')
  @ApiOperation({ 
    summary: 'Submit purchase order for approval',
    description: 'Submit a DRAFT purchase order for approval' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Purchase order UUID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Purchase order submitted for approval' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Can only submit DRAFT orders' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Purchase order not found' 
  })
  submitForApproval(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseOrderService.submitForApproval(id);
  }

  @Post(':id/approve')
  @ApiOperation({ 
    summary: 'Approve or reject purchase order',
    description: 'Approve or reject a purchase order in PENDING_APPROVAL status' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Purchase order UUID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Purchase order approval processed' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid approval request or order status' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Purchase order not found' 
  })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() approvePurchaseOrderDto: ApprovePurchaseOrderDto,
  ) {
    return this.purchaseOrderService.approvePurchaseOrder(id, approvePurchaseOrderDto);
  }

  @Post(':id/mark-as-ordered')
  @ApiOperation({ 
    summary: 'Mark purchase order as ordered',
    description: 'Mark an APPROVED purchase order as ordered (sent to supplier)' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Purchase order UUID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Purchase order marked as ordered' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Can only mark APPROVED orders as ordered' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Purchase order not found' 
  })
  markAsOrdered(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseOrderService.markAsOrdered(id);
  }

  @Post(':id/receive-goods')
  @ApiOperation({ 
    summary: 'Receive goods for purchase order',
    description: 'Process goods receipt for ORDERED or PARTIALLY_RECEIVED purchase orders' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Purchase order UUID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Goods received successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid receiving request or order status' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Purchase order or item not found' 
  })
  receiveGoods(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() receiveGoodsDto: ReceiveGoodsDto,
  ) {
    return this.purchaseOrderService.receiveGoods(id, receiveGoodsDto);
  }

  @Post(':id/cancel')
  @ApiOperation({ 
    summary: 'Cancel purchase order',
    description: 'Cancel a purchase order with reason' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Purchase order UUID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Purchase order cancelled successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Cannot cancel fully received or already cancelled orders' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Purchase order not found' 
  })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { reason: string },
  ) {
    return this.purchaseOrderService.cancel(id, body.reason);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete purchase order',
    description: 'Delete a DRAFT purchase order' 
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Purchase order UUID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Purchase order deleted successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Can only delete DRAFT orders' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Purchase order not found' 
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseOrderService.remove(id);
  }
} 