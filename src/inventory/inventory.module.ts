import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InventoryItem } from './entities/inventory-item.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { StockAdjustment } from './entities/stock-adjustment.entity';
import { ValuationRecord } from './entities/valuation-record.entity';
import { Reservation } from './entities/reservation.entity';

import { InventoryService } from './inventory.service';
import { StockLevelService } from './stock-level.service';
import { InventoryController } from './inventory.controller';
import { ValuationController } from './valuation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryItem,
      StockMovement,
      StockAdjustment,
      ValuationRecord,
      Reservation,
    ]),
  ],
  providers: [InventoryService, StockLevelService],
  controllers: [InventoryController, ValuationController],
})
export class InventoryModule {}
