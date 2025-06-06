import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { ScheduleModule } from "@nestjs/schedule"

import { Warehouse } from "./entities/warehouse.entity"
import { WarehouseStockLevel } from "./entities/warehouse-stock-level.entity"
import { InventoryTransaction } from "./entities/inventory-transaction.entity"
import { TransactionItem } from "./entities/transaction-item.entity"
import { TransactionAudit } from "./entities/transaction-audit.entity"
import { Product } from "../stock/entities/product.entity"

import { InventoryTransactionService } from "./services/inventory-transaction.service"
import { WarehouseService } from "./services/warehouse.service"
import { InventoryNotificationService } from "./services/inventory-notification.service"

import { InventoryTransactionController } from "./controllers/inventory-transaction.controller"
import { WarehouseController } from "./controllers/warehouse.controller"

import { InventoryEventListener } from "./listeners/inventory-event.listener"
import { InventoryMonitoringTask } from "./tasks/inventory-monitoring.task"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Warehouse,
      WarehouseStockLevel,
      InventoryTransaction,
      TransactionItem,
      TransactionAudit,
      Product,
    ]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
  controllers: [InventoryTransactionController, WarehouseController],
  providers: [
    InventoryTransactionService,
    WarehouseService,
    InventoryNotificationService,
    InventoryEventListener,
    InventoryMonitoringTask,
  ],
  exports: [InventoryTransactionService, WarehouseService],
})
export class InventoryModule {}
