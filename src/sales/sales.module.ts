import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { SalesOrderController } from "./sales.controller"
import { SalesOrderService } from "./sales.service"
import { SalesOrder } from "./entities/sales-order.entity"
import { OrderItem } from "./entities/order-item.entity"
import { OrderTracking } from "./entities/order-tracking.entity"

@Module({
  imports: [TypeOrmModule.forFeature([SalesOrder, OrderItem, OrderTracking])],
  controllers: [SalesOrderController],
  providers: [SalesOrderService],
  exports: [SalesOrderService],
})
export class SalesModule {}
