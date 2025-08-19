import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StockLevel } from "./stock-level.entity";
import { StockLevelService } from "./stock-level.service";

@Module({
  imports: [TypeOrmModule.forFeature([StockLevel])],
  providers: [StockLevelService],
  exports: [StockLevelService],
})
export class StockLevelModule {}