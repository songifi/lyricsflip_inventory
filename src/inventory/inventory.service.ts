// src/inventory/inventory.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { StockAdjustment } from './entities/stock-adjustment.entity';
import { MoveStockDto, TransferStockDto, AdjustStockDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private readonly itemRepo: Repository<InventoryItem>,
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
    @InjectRepository(StockAdjustment)
    private readonly adjustmentRepo: Repository<StockAdjustment>,
  ) {}

  async moveStock(dto: MoveStockDto) {
    await this.adjustInventory(dto.sku, dto.fromLocation, -dto.quantity);
    await this.adjustInventory(dto.sku, dto.toLocation, dto.quantity);
    const result = await this.movementRepo.save({ ...dto });
    return { success: true, message: 'Stock moved successfully', data: result };
  }

  async getStockLevels() {
    const data = await this.itemRepo.find();
    return { success: true, message: 'Stock levels retrieved', data };
  }

  async transferStock(dto: TransferStockDto) {
    const results = [];
    for (const move of dto.movements) {
      results.push(await this.moveStock(move));
    }
    return { success: true, message: 'Stock transfer completed', data: results };
  }

  async adjustStock(dto: AdjustStockDto) {
    await this.adjustInventory(dto.sku, dto.locationId, dto.quantityChange);
    const result = await this.adjustmentRepo.save(dto);
    return { success: true, message: 'Stock adjusted', data: result };
  }

  private async adjustInventory(sku: string, locationId: string, change: number) {
    let item = await this.itemRepo.findOne({ where: { sku, locationId } });
    if (!item) {
      item = this.itemRepo.create({ sku, locationId, quantity: 0 });
    }
    item.quantity += change;
    await this.itemRepo.save(item);
  }
}
