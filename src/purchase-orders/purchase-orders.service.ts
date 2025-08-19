// src/purchase-orders/purchase-orders.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, OrderStatus, ApprovalStatus } from './entities/purchase-order.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { PurchaseOrderHistory } from './entities/purchase-order-history.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { AddPurchaseOrderItemDto } from './dto/add-purchase-order-item.dto';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
    @InjectRepository(PurchaseOrderHistory)
    private purchaseOrderHistoryRepository: Repository<PurchaseOrderHistory>,
  ) {}

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const orderNumber = await this.generateOrderNumber();
    
    const purchaseOrder = this.purchaseOrderRepository.create({
      ...createPurchaseOrderDto,
      orderNumber,
      taxAmount: parseFloat(createPurchaseOrderDto.taxAmount || '0'),
      shippingAmount: parseFloat(createPurchaseOrderDto.shippingAmount || '0'),
    });

    // Create items and calculate totals
    const items = createPurchaseOrderDto.items.map(itemDto => {
      const quantity = parseInt(itemDto.quantity);
      const unitPrice = parseFloat(itemDto.unitPrice);
      const totalPrice = quantity * unitPrice;

      return this.purchaseOrderItemRepository.create({
        ...itemDto,
        quantity,
        unitPrice,
        totalPrice,
      });
    });

    purchaseOrder.items = items;
    this.calculateTotals(purchaseOrder);

    const savedOrder = await this.purchaseOrderRepository.save(purchaseOrder);
    
    // Add creation history
    await this.addHistory(savedOrder.id, 'CREATED', '', 'Purchase order created', 'system');

    return this.findOne(savedOrder.id);
  }

  async findAll(): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.find({
      relations: ['items', 'history'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['items', 'history'],
    });

    if (!purchaseOrder) {
      throw new NotFoundException(`Purchase order with ID ${id} not found`);
    }

    return purchaseOrder;
  }

  async update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    // Check if order can be updated
    if (purchaseOrder.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot update completed purchase order');
    }

    const oldStatus = purchaseOrder.status;
    
    Object.assign(purchaseOrder, {
      ...updatePurchaseOrderDto,
      taxAmount: updatePurchaseOrderDto.taxAmount ? parseFloat(updatePurchaseOrderDto.taxAmount) : purchaseOrder.taxAmount,
      shippingAmount: updatePurchaseOrderDto.shippingAmount ? parseFloat(updatePurchaseOrderDto.shippingAmount) : purchaseOrder.shippingAmount,
    });

    // Update items if provided
    if (updatePurchaseOrderDto.items) {
      // Remove existing items
      await this.purchaseOrderItemRepository.delete({ purchaseOrderId: id });
      
      // Create new items
      const items = updatePurchaseOrderDto.items.map(itemDto => {
        const quantity = parseInt(itemDto.quantity);
        const unitPrice = parseFloat(itemDto.unitPrice);
        const totalPrice = quantity * unitPrice;

        return this.purchaseOrderItemRepository.create({
          ...itemDto,
          quantity,
          unitPrice,
          totalPrice,
          purchaseOrderId: id,
        });
      });

      purchaseOrder.items = items;
    }

    this.calculateTotals(purchaseOrder);
    const updatedOrder = await this.purchaseOrderRepository.save(purchaseOrder);

    // Add history if status changed
    if (oldStatus !== updatedOrder.status) {
      await this.addHistory(id, 'STATUS_CHANGED', oldStatus, updatedOrder.status, 'system');
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const purchaseOrder = await this.findOne(id);
    
    if (purchaseOrder.status !== OrderStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft purchase orders');
    }

    await this.purchaseOrderRepository.remove(purchaseOrder);
  }

  async approve(id: string, approvedBy: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if (purchaseOrder.approvalStatus === ApprovalStatus.APPROVED) {
      throw new BadRequestException('Purchase order is already approved');
    }

    if (purchaseOrder.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot approve completed purchase order');
    }

    purchaseOrder.approvalStatus = ApprovalStatus.APPROVED;
    purchaseOrder.approvedBy = approvedBy;
    purchaseOrder.approvedAt = new Date();

    // Auto-advance status if it's still draft
    if (purchaseOrder.status === OrderStatus.DRAFT) {
      purchaseOrder.status = OrderStatus.SENT;
    }

    await this.purchaseOrderRepository.save(purchaseOrder);
    
    await this.addHistory(id, 'APPROVED', ApprovalStatus.PENDING, ApprovalStatus.APPROVED, approvedBy);

    return this.findOne(id);
  }

  async addItem(id: string, addItemDto: AddPurchaseOrderItemDto): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if (purchaseOrder.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot add items to completed purchase order');
    }

    const quantity = parseInt(addItemDto.quantity);
    const unitPrice = parseFloat(addItemDto.unitPrice);
    const totalPrice = quantity * unitPrice;

    const newItem = this.purchaseOrderItemRepository.create({
      ...addItemDto,
      quantity,
      unitPrice,
      totalPrice,
      purchaseOrderId: id,
    });

    await this.purchaseOrderItemRepository.save(newItem);
    
    // Recalculate totals
    const updatedOrder = await this.findOne(id);
    this.calculateTotals(updatedOrder);
    await this.purchaseOrderRepository.save(updatedOrder);

    await this.addHistory(id, 'ITEM_ADDED', '', `Added item: ${addItemDto.productName}`, 'system');

    return this.findOne(id);
  }

  async removeItem(orderId: string, itemId: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(orderId);

    if (purchaseOrder.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot remove items from completed purchase order');
    }

    const item = await this.purchaseOrderItemRepository.findOne({
      where: { id: itemId, purchaseOrderId: orderId }
    });

    if (!item) {
      throw new NotFoundException('Purchase order item not found');
    }

    await this.purchaseOrderItemRepository.remove(item);
    
    // Recalculate totals
    const updatedOrder = await this.findOne(orderId);
    this.calculateTotals(updatedOrder);
    await this.purchaseOrderRepository.save(updatedOrder);

    await this.addHistory(orderId, 'ITEM_REMOVED', '', `Removed item: ${item.productName}`, 'system');

    return this.findOne(orderId);
  }

  async updateItemQuantity(orderId: string, itemId: string, quantity: number): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(orderId);

    if (purchaseOrder.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot update items in completed purchase order');
    }

    const item = await this.purchaseOrderItemRepository.findOne({
      where: { id: itemId, purchaseOrderId: orderId }
    });

    if (!item) {
      throw new NotFoundException('Purchase order item not found');
    }

    const oldQuantity = item.quantity;
    item.quantity = quantity;
    item.totalPrice = quantity * item.unitPrice;

    await this.purchaseOrderItemRepository.save(item);
    
    // Recalculate totals
    const updatedOrder = await this.findOne(orderId);
    this.calculateTotals(updatedOrder);
    await this.purchaseOrderRepository.save(updatedOrder);

    await this.addHistory(orderId, 'ITEM_QUANTITY_UPDATED', oldQuantity.toString(), quantity.toString(), 'system');

    return this.findOne(orderId);
  }

  private calculateTotals(purchaseOrder: PurchaseOrder): void {
    const itemsTotal = purchaseOrder.items?.reduce((sum, item) => sum + item.totalPrice, 0) || 0;
    
    purchaseOrder.totalAmount = itemsTotal;
    purchaseOrder.grandTotal = itemsTotal + purchaseOrder.taxAmount + purchaseOrder.shippingAmount;
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    const count = await this.purchaseOrderRepository.count();
    const sequence = String(count + 1).padStart(4, '0');
    
    return `PO-${year}${month}-${sequence}`;
  }

  private async addHistory(
    purchaseOrderId: string,
    action: string,
    oldValue: string,
    newValue: string,
    changedBy: string,
    notes?: string
  ): Promise<void> {
    const history = this.purchaseOrderHistoryRepository.create({
      purchaseOrderId,
      action,
      oldValue,
      newValue,
      changedBy,
      notes,
    });

    await this.purchaseOrderHistoryRepository.save(history);
  }
}