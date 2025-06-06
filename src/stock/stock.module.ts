import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { ScheduleModule } from "@nestjs/schedule"

import { StockLevel } from "./entities/stock-level.entity"
import { Product } from "./entities/product.entity"
import { StockHistory } from "./entities/stock-history.entity"
import { StockLevelRepository } from "./repositories/stock-level.repository"
import { StockHistoryRepository } from "./repositories/stock-history.repository"
import { StockLevelService } from "./services/stock-level.service"
import { StockNotificationService } from "./services/stock-notification.service"
import { StockLevelController } from "./controllers/stock-level.controller"
import { StockEventListener } from "./listeners/stock-event.listener"
import { StockMonitoringTask } from "./tasks/stock-monitoring.task"

@Module({
  imports: [
    TypeOrmModule.forFeature([StockLevel, Product, StockHistory, StockLevelRepository, StockHistoryRepository]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
  controllers: [StockLevelController],
  providers: [StockLevelService, StockNotificationService, StockEventListener, StockMonitoringTask],
  exports: [StockLevelService],
})
export class StockModule {}
