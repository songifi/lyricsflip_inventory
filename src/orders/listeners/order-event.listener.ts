import { Injectable } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import type { OrderNotificationService } from "../services/order-notification.service"

@Injectable()
export class OrderEventListener {
  constructor(private readonly notificationService: OrderNotificationService) {}

  @OnEvent("order.created")
  handleOrderCreatedEvent(payload: any) {
    const { order } = payload
    console.log(`Order created: ${order.orderNumber}`)
    this.notificationService.sendOrderCreatedNotification(order)
  }

  @OnEvent("order.status.changed")
  handleOrderStatusChangedEvent(payload: any) {
    const { order, fromStatus, toStatus, changedBy } = payload
    console.log(`Order ${order.orderNumber} status changed from ${fromStatus} to ${toStatus} by ${changedBy}`)
    this.notificationService.sendStatusChangeNotification(order, fromStatus, toStatus)
  }

  @OnEvent("order.tracking.updated")
  handleOrderTrackingUpdatedEvent(payload: any) {
    const { order } = payload
    console.log(`Tracking updated for order ${order.orderNumber}: ${order.trackingNumber}`)
    this.notificationService.sendTrackingUpdateNotification(order)
  }
}
