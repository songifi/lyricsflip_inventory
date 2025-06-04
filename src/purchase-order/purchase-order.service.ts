import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { Supplier } from './entities/supplier.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { Product } from '../product/entities/product.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { ApprovePurchaseOrderDto } from './dto/approve-purchase-order.dto';
import { ReceiveGoodsDto } from './dto/receive-goods.dto';

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(PurchaseOrderItem)
    private readonly purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  /**
   * Create a new purchase order with validation
   */
  async create(createPurchaseOrderDto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    // Validate supplier exists and is active
    const supplier = await this.supplierRepository.findOne({
      where: { id: createPurchaseOrderDto.supplierId, isActive: true },
    });
    if (!supplier) {
      throw new NotFoundException('Active supplier not found');
    }

    // Validate all products exist and are active
    const productIds = createPurchaseOrderDto.items.map(item => item.productId);
    const products = await this.productRepository.findByIds(productIds);
    
    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    const inactiveProducts = products.filter(product => !product.isActive);
    if (inactiveProducts.length > 0) {
      throw new BadRequestException('One or more products are inactive');
    }

    // Generate unique order number
    const orderNumber = await this.generateOrderNumber();

    // Create purchase order
    const purchaseOrder = this.purchaseOrderRepository.create({
      orderNumber,
      supplier,
      priority: createPurchaseOrderDto.priority,
      taxRate: createPurchaseOrderDto.taxRate || 0,
      notes: createPurchaseOrderDto.notes,
      requestedBy: createPurchaseOrderDto.requestedBy,
      expectedDeliveryDate: createPurchaseOrderDto.expectedDeliveryDate ? 
        new Date(createPurchaseOrderDto.expectedDeliveryDate) : null,
      deliveryAddress: createPurchaseOrderDto.deliveryAddress,
      status: PurchaseOrderStatus.DRAFT,
    });

    // Calculate totals and create items
    let totalAmount = 0;
    const items: PurchaseOrderItem[] = [];

    for (const itemDto of createPurchaseOrderDto.items) {
      const product = products.find(p => p.id === itemDto.productId);
      const totalPrice = itemDto.unitPrice * itemDto.quantityOrdered;
      totalAmount += totalPrice;

      const item = this.purchaseOrderItemRepository.create({
        product,
        quantityOrdered: itemDto.quantityOrdered,
        unitPrice: itemDto.unitPrice,
        totalPrice,
        notes: itemDto.notes,
        expectedDeliveryDate: itemDto.expectedDeliveryDate ? 
          new Date(itemDto.expectedDeliveryDate) : null,
      });
      items.push(item);
    }

    // Calculate taxes
    const taxAmount = (totalAmount * (createPurchaseOrderDto.taxRate || 0)) / 100;
    purchaseOrder.totalAmount = totalAmount + taxAmount;
    purchaseOrder.taxAmount = taxAmount;

    // Save purchase order
    const savedOrder = await this.purchaseOrderRepository.save(purchaseOrder);

    // Save items with reference to purchase order
    for (const item of items) {
      item.purchaseOrder = savedOrder;
    }
    await this.purchaseOrderItemRepository.save(items);

    return this.findOne(savedOrder.id);
  }

  /**
   * Find all purchase orders with optional filtering
   */
  async findAll(status?: PurchaseOrderStatus): Promise<PurchaseOrder[]> {
    const query = this.purchaseOrderRepository.createQueryBuilder('po')
      .leftJoinAndSelect('po.supplier', 'supplier')
      .leftJoinAndSelect('po.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .orderBy('po.createdAt', 'DESC');

    if (status) {
      query.where('po.status = :status', { status });
    }

    return query.getMany();
  }

  /**
   * Find purchase order by ID
   */
  async findOne(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['supplier', 'items', 'items.product'],
    });

    if (!purchaseOrder) {
      throw new NotFoundException('Purchase order not found');
    }

    return purchaseOrder;
  }

  /**
   * Update purchase order (only allowed for DRAFT orders)
   */
  async update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if (purchaseOrder.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Can only update orders in DRAFT status');
    }

    // Update allowed fields
    Object.assign(purchaseOrder, updatePurchaseOrderDto);
    await this.purchaseOrderRepository.save(purchaseOrder);

    return this.findOne(id);
  }

  /**
   * Submit purchase order for approval
   */
  async submitForApproval(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if (purchaseOrder.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Can only submit DRAFT orders for approval');
    }

    // Validate order has items
    if (!purchaseOrder.items || purchaseOrder.items.length === 0) {
      throw new BadRequestException('Purchase order must have at least one item');
    }

    purchaseOrder.status = PurchaseOrderStatus.PENDING_APPROVAL;
    await this.purchaseOrderRepository.save(purchaseOrder);

    return purchaseOrder;
  }

  /**
   * Approve or reject purchase order
   */
  async approvePurchaseOrder(id: string, approveDto: ApprovePurchaseOrderDto): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if (purchaseOrder.status !== PurchaseOrderStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Can only approve orders in PENDING_APPROVAL status');
    }

    if (approveDto.approved) {
      purchaseOrder.status = PurchaseOrderStatus.APPROVED;
      purchaseOrder.approvedBy = approveDto.approvedBy;
      purchaseOrder.approvedAt = new Date();
    } else {
      if (!approveDto.rejectionReason) {
        throw new BadRequestException('Rejection reason is required when rejecting an order');
      }
      purchaseOrder.status = PurchaseOrderStatus.REJECTED;
      purchaseOrder.rejectedBy = approveDto.approvedBy;
      purchaseOrder.rejectedAt = new Date();
      purchaseOrder.rejectionReason = approveDto.rejectionReason;
    }

    await this.purchaseOrderRepository.save(purchaseOrder);
    return purchaseOrder;
  }

  /**
   * Mark order as ordered (sent to supplier)
   */
  async markAsOrdered(id: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if (purchaseOrder.status !== PurchaseOrderStatus.APPROVED) {
      throw new BadRequestException('Can only mark APPROVED orders as ordered');
    }

    purchaseOrder.status = PurchaseOrderStatus.ORDERED;
    purchaseOrder.orderedAt = new Date();
    await this.purchaseOrderRepository.save(purchaseOrder);

    return purchaseOrder;
  }

  /**
   * Receive goods for purchase order
   */
  async receiveGoods(id: string, receiveGoodsDto: ReceiveGoodsDto): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if (![PurchaseOrderStatus.ORDERED, PurchaseOrderStatus.PARTIALLY_RECEIVED].includes(purchaseOrder.status)) {
      throw new BadRequestException('Can only receive goods for ORDERED or PARTIALLY_RECEIVED orders');
    }

    // Process each received item
    for (const receivedItem of receiveGoodsDto.items) {
      const purchaseOrderItem = purchaseOrder.items.find(item => item.id === receivedItem.itemId);
      
      if (!purchaseOrderItem) {
        throw new NotFoundException(`Purchase order item ${receivedItem.itemId} not found`);
      }

      // Validate received quantity
      const newTotalReceived = purchaseOrderItem.quantityReceived + receivedItem.quantityReceived;
      if (newTotalReceived > purchaseOrderItem.quantityOrdered) {
        throw new BadRequestException(
          `Cannot receive more than ordered quantity for item ${purchaseOrderItem.product.name}`
        );
      }

      // Update item
      purchaseOrderItem.quantityReceived = newTotalReceived;
      purchaseOrderItem.actualDeliveryDate = receivedItem.actualDeliveryDate ? 
        new Date(receivedItem.actualDeliveryDate) : new Date();

      if (receivedItem.notes) {
        purchaseOrderItem.notes = receivedItem.notes;
      }

      await this.purchaseOrderItemRepository.save(purchaseOrderItem);

      // Update product stock
      const product = purchaseOrderItem.product;
      product.stock += receivedItem.quantityReceived;
      await this.productRepository.save(product);
    }

    // Update purchase order receiving info
    purchaseOrder.receivingNotes = receiveGoodsDto.receivingNotes;
    purchaseOrder.receivedBy = receiveGoodsDto.receivedBy;
    purchaseOrder.receivedAt = new Date();
    purchaseOrder.actualDeliveryDate = new Date();

    // Determine if order is fully or partially received
    const allItemsFullyReceived = purchaseOrder.items.every(item => 
      item.quantityReceived >= item.quantityOrdered
    );

    purchaseOrder.status = allItemsFullyReceived ? 
      PurchaseOrderStatus.FULLY_RECEIVED : 
      PurchaseOrderStatus.PARTIALLY_RECEIVED;

    await this.purchaseOrderRepository.save(purchaseOrder);
    return this.findOne(id);
  }

  /**
   * Cancel purchase order
   */
  async cancel(id: string, reason: string): Promise<PurchaseOrder> {
    const purchaseOrder = await this.findOne(id);

    if ([PurchaseOrderStatus.FULLY_RECEIVED, PurchaseOrderStatus.CANCELLED].includes(purchaseOrder.status)) {
      throw new BadRequestException('Cannot cancel orders that are fully received or already cancelled');
    }

    purchaseOrder.status = PurchaseOrderStatus.CANCELLED;
    purchaseOrder.notes = `${purchaseOrder.notes || ''}\nCancellation Reason: ${reason}`;
    await this.purchaseOrderRepository.save(purchaseOrder);

    return purchaseOrder;
  }

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const prefix = 'PO';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Find the highest number for this month
    const lastOrder = await this.purchaseOrderRepository.findOne({
      where: {
        orderNumber: new RegExp(`^${prefix}${year}${month}`)
      },
      order: { orderNumber: 'DESC' }
    });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${year}${month}${String(sequence).padStart(4, '0')}`;
  }

  /**
   * Get purchase order statistics
   */
  async getStatistics(): Promise<any> {
    const total = await this.purchaseOrderRepository.count();
    const pending = await this.purchaseOrderRepository.count({ 
      where: { status: PurchaseOrderStatus.PENDING_APPROVAL } 
    });
    const approved = await this.purchaseOrderRepository.count({ 
      where: { status: PurchaseOrderStatus.APPROVED } 
    });
    const ordered = await this.purchaseOrderRepository.count({ 
      where: { status: PurchaseOrderStatus.ORDERED } 
    });
    const partiallyReceived = await this.purchaseOrderRepository.count({ 
      where: { status: PurchaseOrderStatus.PARTIALLY_RECEIVED } 
    });
    const fullyReceived = await this.purchaseOrderRepository.count({ 
      where: { status: PurchaseOrderStatus.FULLY_RECEIVED } 
    });

    return {
      total,
      pending,
      approved,
      ordered,
      partiallyReceived,
      fullyReceived,
    };
  }

  /**
   * Delete purchase order (only DRAFT orders)
   */
  async remove(id: string): Promise<{ deleted: boolean }> {
    const purchaseOrder = await this.findOne(id);

    if (purchaseOrder.status !== PurchaseOrderStatus.DRAFT) {
      throw new BadRequestException('Can only delete DRAFT orders');
    }

    await this.purchaseOrderRepository.remove(purchaseOrder);
    return { deleted: true };
  }
} 