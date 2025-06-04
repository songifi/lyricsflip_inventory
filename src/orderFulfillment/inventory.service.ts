// orderFulfillment/inventory.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { StockReservation } from './entities/stock-reservation.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(StockReservation)
    private stockReservationRepository: Repository<StockReservation>,
  ) {}

  async getInventoryByProductId(productId: string): Promise<Inventory> {
    return this.inventoryRepository.findOne({
      where: { productId },
    });
  }

  async getAvailableStock(productId: string): Promise<number> {
    const inventory = await this.getInventoryByProductId(productId);
    
    if (!inventory) {
      return 0;
    }

    const reservedStock = await this.stockReservationRepository
      .createQueryBuilder('reservation')
      .select('SUM(reservation.quantity)', 'total')
      .where('reservation.productId = :productId', { productId })
      .andWhere('reservation.status = :status', { status: 'active' })
      .getRawOne();

    const totalReserved = parseInt(reservedStock.total) || 0;
    return Math.max(0, inventory.quantity - totalReserved);
  }

  async reserveStock(productId: string, quantity: number, orderId: string) {
    const availableStock = await this.getAvailableStock(productId);
    
    if (availableStock < quantity) {
      throw new Error(`Insufficient stock for product ${productId}`);
    }

    const reservation = this.stockReservationRepository.create({
      productId,
      quantity,
      orderId,
      status: 'active',
      reservedAt: new Date(),
    });

    return this.stockReservationRepository.save(reservation);
  }

  async releaseReservation(reservationId: string) {
    const reservation = await this.stockReservationRepository.findOne({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    reservation.status = 'released';
    return this.stockReservationRepository.save(reservation);
  }

  async updateInventory(productId: string, quantity: number) {
    const inventory = await this.getInventoryByProductId(productId);
    
    if (!inventory) {
      throw new NotFoundException(`Inventory not found for product ${productId}`);
    }

    inventory.quantity = quantity;
    inventory.lastUpdated = new Date();
    return this.inventoryRepository.save(inventory);
  }
}