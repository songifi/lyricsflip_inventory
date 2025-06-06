import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { ScheduleModule } from "@nestjs/schedule"

import { Order } from "./entities/order.entity"
import { OrderItem } from "./entities/order-item.entity"
import { OrderStatusHistory } from "./entities/order-status-history.entity"
import { Customer } from "./entities/customer.entity"
import { Product } from "../stock/entities/product.entity"

import { OrderService } from "./services/order.service"
import { OrderWorkflowService } from "./services/order-workflow.service"
import { OrderNotificationService } from "./services/order-notification.service"

import { OrderController } from "./controllers/order.controller"

import { OrderEventListener } from "./listeners/order-event.listener"
import { OrderMonitoringTask } from "./tasks/order-monitoring.task"

import { StockModule } from "../stock/stock.module"

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderStatusHistory, Customer, Product]),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    StockModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderWorkflowService, OrderNotificationService, OrderEventListener, OrderMonitoringTask],
  exports: [OrderService, OrderWorkflowService],
})
export class OrdersModule {}
