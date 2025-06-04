// orderFulfillment/order-fulfillment.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderValidationDto } from './dto/order-validation.dto';
import { InventoryService } from './inventory.service';
import { PickingListService } from './picking-list.service';
import { ShippingService } from './shipping.service';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrderFulfillmentService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private inventoryService: InventoryService,
    private pickingListService: PickingListService,
    private shippingService: ShippingService,
  ) {}

  async validateOrder(orderData: OrderValidationDto) {
    const validationResults = [];

    for (const item of orderData.items) {
      const inventory = await this.inventoryService.getInventoryByProductId(item.productId);
      
      if (!inventory) {
        validationResults.push({
          productId: item.productId,
          valid: false,
          message: 'Product not found in inventory',
        });
        continue;
      }

      const availableStock = await this.inventoryService.getAvailableStock(item.productId);
      
      if (availableStock < item.quantity) {
        validationResults.push({
          productId: item.productId,
          valid: false,
          message: `Insufficient stock. Available: ${availableStock}, Requested: ${item.quantity}`,
        });
      } else {
        validationResults.push({
          productId: item.productId,
          valid: true,
          message: 'Stock available',
        });
      }
    }

    const isValid = validationResults.every(result => result.valid);

    return {
      valid: isValid,
      results: validationResults,
    };
  }

  async processOrder(createOrderDto: CreateOrderDto) {
    // Validate order first
    const validation = await this.validateOrder({
      customerId: createOrderDto.customerId,
      items: createOrderDto.items,
    });

    if (!validation.valid) {
      throw new BadRequestException('Order validation failed', validation.results);
    }

    // Create order
    const order = this.orderRepository.create({
      customerId: createOrderDto.customerId,
      status: OrderStatus.PENDING,
      totalAmount: createOrderDto.totalAmount,
      shippingAddress: createOrderDto.shippingAddress,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    const orderItems = createOrderDto.items.map(item => 
      this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      })
    );

    await this.orderItemRepository.save(orderItems);

    return this.getOrder(savedOrder.id);
  }

  async getOrders(status?: string) {
    const query = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items');

    if (status) {
      query.where('order.status = :status', { status });
    }

    return query.getMany();
  }

  async getOrder(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await this.getOrder(id);
    order.status = status;
    return this.orderRepository.save(order);
  }

  async allocateInventory(orderId: string) {
    const order = await this.getOrder(orderId);
    
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be allocated');
    }

    const allocations = [];

    for (const item of order.items) {
      const allocation = await this.inventoryService.reserveStock(
        item.productId,
        item.quantity,
        orderId,
      );
      allocations.push(allocation);
    }

    await this.updateOrderStatus(orderId, OrderStatus.ALLOCATED);

    return {
      orderId,
      allocations,
      status: 'allocated',
    };
  }

  async generatePickingList(orderId: string) {
    const order = await this.getOrder(orderId);
    
    if (order.status !== OrderStatus.ALLOCATED) {
      throw new BadRequestException('Order must be allocated before generating picking list');
    }

    const pickingList = await this.pickingListService.createPickingList(order);
    await this.updateOrderStatus(orderId, OrderStatus.PICKING);

    return pickingList;
  }

  async prepareShipping(orderId: string) {
    const order = await this.getOrder(orderId);
    
    if (order.status !== OrderStatus.PICKED) {
      throw new BadRequestException('Order must be picked before preparing shipping');
    }

    const shippingPreparation = await this.shippingService.prepareShipping(order);
    await this.updateOrderStatus(orderId, OrderStatus.READY_TO_SHIP);

    return shippingPreparation;
  }
}
