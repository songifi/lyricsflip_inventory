import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { InventoryItem } from './entities/inventory-item.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { InventoryGateway } from './inventory.gateway';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly itemRepo: Repository<InventoryItem>,
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
    private readonly inventoryGateway: InventoryGateway,
  ) {}

  async getDashboardStats() {
    const [totalItems, lowStockItems, recentMovements] = await Promise.all([
      this.itemRepo.count(),
      this.itemRepo.count({ where: { quantity: 10 } }), // Low stock threshold
      this.getRecentMovementsCount(),
    ]);

    const totalValue = await this.calculateTotalValue();

    return {
      totalItems,
      lowStockItems,
      totalValue,
      recentMovements,
      timestamp: new Date(),
    };
  }

  private async getRecentMovementsCount(): Promise<number> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return this.movementRepo.count({
      where: {
        createdAt: oneDayAgo,
      },
    });
  }

  private async calculateTotalValue(): Promise<number> {
    const items = await this.itemRepo.find();
    return items.reduce((total, item) => {
      const unitPrice = (item as any).unitPrice || 0;
      return total + (item.quantity * unitPrice);
    }, 0);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async broadcastDashboardUpdate() {
    const stats = await this.getDashboardStats();
    this.inventoryGateway.server.emit('dashboard-update', stats);
  }
}