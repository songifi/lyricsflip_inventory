import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './entities/inventory-item.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { StockAdjustment } from './entities/stock-adjustment.entity';
import { ValuationController } from './valuation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryItem, StockMovement, StockAdjustment]),
  ],
  controllers: [InventoryController,ValuationController],
  providers: [InventoryService],
})
export class InventoryModule {}
