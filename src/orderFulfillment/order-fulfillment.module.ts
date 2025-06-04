// orderFulfillment/order-fulfillment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderFulfillmentController } from './order-fulfillment.controller';
import { OrderFulfillmentService } from './order-fulfillment.service';
import { InventoryService } from './inventory.service';
import { PickingListService } from './picking-list.service';
import { ShippingService } from './shipping.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Inventory } from './entities/inventory.entity';
import { PickingList } from './entities/picking-list.entity';
import { PickingListItem } from './entities/picking-list-item.entity';
import { StockReservation } from './entities/stock-reservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Inventory,
      PickingList,
      PickingListItem,
      StockReservation,
    ]),
  ],
  controllers: [OrderFulfillmentController],
  providers: [
    OrderFulfillmentService,
    InventoryService,
    PickingListService,
    ShippingService,
  ],
  exports: [OrderFulfillmentService],
})
export class OrderFulfillmentModule {}

