import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesOrder } from './entities/sales-order.entity';
import { OrderItem }  from './entities/order-item.entity';
import { SalesOrderService } from './sales-order.service';
import { SalesOrderController } from './sales-order.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalesOrder, OrderItem]),
    InventoryModule,            
  ],
  providers: [SalesOrderService],
  controllers: [SalesOrderController],
})
export class SalesOrderModule {}
