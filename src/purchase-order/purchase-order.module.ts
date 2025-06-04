import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrderController } from './purchase-order.controller';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { Supplier } from './entities/supplier.entity';
import { PurchaseOrderItem } from './entities/purchase-order-item.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PurchaseOrder,
      Supplier,
      PurchaseOrderItem,
      Product
    ]),
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
  exports: [PurchaseOrderService],
})
export class PurchaseOrderModule {} 