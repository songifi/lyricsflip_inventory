import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StockMovement } from "./stock-movement.entity";
import { StockMovementService } from "./stock-movement.service";
import { StockMovementController, ItemStockMovementController } from "./stock-movement.controller";
import { StockLevelModule } from "../stock-level/stock-level.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([StockMovement]),
    StockLevelModule,
  ],
  controllers: [StockMovementController, ItemStockMovementController],
  providers: [StockMovementService],
  exports: [StockMovementService],
})
export class StockMovementModule {}