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
import { InventoryGateway } from './inventory.gateway';
import { DashboardService } from './dashboard.service';
import { ConnectionManagerService } from './connection-manager.service';
import { WebSocketController } from './websocket.controller';
import { ConnectionCleanupTask } from './tasks/connection-cleanup.task';

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
  providers: [
    InventoryService,
    StockLevelService,
    InventoryGateway,
    DashboardService,
    ConnectionManagerService,
    ConnectionCleanupTask,
  ],
  controllers: [InventoryController, ValuationController, WebSocketController],
  exports: [InventoryGateway, DashboardService],
})
export class InventoryModule {}
