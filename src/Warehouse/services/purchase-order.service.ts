import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from '../entities/purchase-order.entity';
import { PurchaseOrderItem } from '../entities/purchase-order-item.entity';
import { CreatePurchaseOrderDto } from '../dto/create-purchase-order.dto';

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
  ) {}

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const orderNumber = await this.generateOrderNumber();
    
    // Calculate total amount
    const totalAmount = createPurchaseOrderDto.items.reduce(
      (sum, item) => sum + (item.orderedQuantity * item.unitPrice), 0
    );

    const purchaseOrder = this.purchaseOrderRepository.create({
      ...createPurchaseOrderDto,
      orderNumber,
      totalAmount,
      items: createPurchaseOrderDto.items.map(item => ({
        ...item,
        totalPrice: item.orderedQuantity * item.unitPrice
      }))
    });

    return this.purchaseOrderRepository.save(purchaseOrder);
  }

  async receiveOrder(id: string, receivedItems: { itemId: string; receivedQuantity: number }[]): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['items']
    });

    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }

    // Update received quantities
    for (const receivedItem of receivedItems) {
      const orderItem = order.items.find(item => item.id === receivedItem.itemId);
      if (orderItem) {
        orderItem.receivedQuantity += receivedItem.receivedQuantity;
        await this.purchaseOrderItemRepository.save(orderItem);
      }
    }

    // Check if order is fully received
    const allItemsReceived = order.items.every(
      item => item.receivedQuantity >= item.orderedQuantity
    );

    if (allItemsReceived) {
      order.status = PurchaseOrderStatus.RECEIVED;
      order.receivedDate = new Date();
    }

    return this.purchaseOrderRepository.save(order);
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const prefix = 'PO';
    const timestamp = date.getFullYear().toString() + 
                     (date.getMonth() + 1).toString().padStart(2, '0');
    
    const count = await this.purchaseOrderRepository.count({
      where: { orderNumber: Like(`${prefix}${timestamp}%`) }
    });
    
    return `${prefix}${timestamp}${(count + 1).toString().padStart(5, '0')}`;
  }

  async findAll(): Promise<PurchaseOrder[]> {
    return this.purchaseOrderRepository.find({
      relations: ['warehouse', 'items'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['warehouse', 'items']
    });

    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }

    return order;
  }
}

