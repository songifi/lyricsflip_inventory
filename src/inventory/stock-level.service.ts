import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModuleRef } from '@nestjs/core';

import { InventoryItem } from './entities/inventory-item.entity';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { StockAdjustment } from './entities/stock-adjustment.entity';
import { InventoryGateway } from './inventory.gateway';

@Injectable()
export class StockLevelService {
  private inventoryGateway: InventoryGateway;

  constructor(
    @InjectRepository(InventoryItem)
    private readonly itemRepo: Repository<InventoryItem>,
    @InjectRepository(Reservation)
    private readonly resRepo: Repository<Reservation>,
    @InjectRepository(StockAdjustment)
    private readonly adjRepo: Repository<StockAdjustment>,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.inventoryGateway = this.moduleRef.get(InventoryGateway, { strict: false });
  }

  /** Real-time stock levels for a SKU/location */
  async getRealTimeStock(sku: string, locationId: string) {
    const item = await this.itemRepo.findOne({
      where: { sku, locationId },
      relations: ['reservations'],
    });
    if (!item) throw new NotFoundException(`No inventory item ${sku}@${locationId}`);

    const reserved = item.reservations
      .filter((r: Reservation) => r.status === ReservationStatus.ACTIVE)
      .reduce((sum: number, r: Reservation) => sum + r.quantity, 0);

    return {
      sku,
      locationId,
      onHand: item.quantity,
      reserved,
      available: item.quantity - reserved,
    };
  }

  /** Reserve stock (does not yet decrement onHand) */
  async reserveStock(sku: string, locationId: string, quantity: number) {
    const { available } = await this.getRealTimeStock(sku, locationId);
    if (quantity > available) {
      throw new BadRequestException(`Insufficient available stock (requested ${quantity}, available ${available})`);
    }
    const res = this.resRepo.create({ sku, locationId, quantity });
    const saved = await this.resRepo.save(res);
    // Emit stock update
    const allStock = await this.itemRepo.find();
    this.inventoryGateway.broadcastStockUpdate(allStock);
    return saved;
  }

  /** Release an active reservation */
  async releaseReservation(reservationId: string) {
    const res = await this.resRepo.findOne({ where: { id: reservationId } });
    if (!res) throw new NotFoundException(`Reservation ${reservationId} not found`);
    if (res.status !== ReservationStatus.ACTIVE) {
      throw new BadRequestException(`Reservation is not active`);
    }
    res.status = ReservationStatus.RELEASED;
    const saved = await this.resRepo.save(res);
    // Emit stock update
    const allStock = await this.itemRepo.find();
    this.inventoryGateway.broadcastStockUpdate(allStock);
    return saved;
  }

  /** Fulfill a reservation: decrement onHand and mark fulfilled */
  async fulfillReservation(reservationId: string) {
    const res = await this.resRepo.findOne({ where: { id: reservationId } });
    if (!res) throw new NotFoundException(`Reservation ${reservationId} not found`);
    if (res.status !== ReservationStatus.ACTIVE) {
      throw new BadRequestException(`Reservation is not active`);
    }

    // adjust inventory permanently
    const item = await this.itemRepo.findOne({
      where: { sku: res.sku, locationId: res.locationId },
    });
    if (!item) throw new NotFoundException(`Inventory item not found`);
    if (item.quantity < res.quantity) {
      throw new BadRequestException(`On-hand less than reserved`);
    }
    item.quantity -= res.quantity;
    await this.itemRepo.save(item);

    res.status = ReservationStatus.FULFILLED;
    const saved = await this.resRepo.save(res);
    // Emit stock update
    const allStock = await this.itemRepo.find();
    this.inventoryGateway.broadcastStockUpdate(allStock);
    return saved;
  }

  /**
   * Reconcile: given an expected on-hand qty, compare to actual, and
   * emit a StockAdjustment to correct the difference.
   */
  async reconcileStock(
    sku: string,
    locationId: string,
    expectedOnHand: number,
    reason = 'reconciliation',
  ) {
    const item = await this.itemRepo.findOne({ where: { sku, locationId } });
    if (!item) throw new NotFoundException(`Inventory item ${sku}@${locationId}`);

    const diff = expectedOnHand - item.quantity;
    if (diff === 0) {
      return { message: 'No reconciliation needed', difference: 0 };
    }

   
    item.quantity = expectedOnHand;
    await this.itemRepo.save(item);

    const adj = this.adjRepo.create({
      sku,
      locationId,
      quantityChange: diff,
      reason,
    });
    await this.adjRepo.save(adj);

    // Emit stock update
    const allStock = await this.itemRepo.find();
    this.inventoryGateway.broadcastStockUpdate(allStock);

    return { message: 'Reconciled', difference: diff, adjustment: adj };
  }
}
