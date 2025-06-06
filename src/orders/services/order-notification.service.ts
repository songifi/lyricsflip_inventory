import { Injectable } from "@nestjs/common"
import { type Order, OrderStatus } from "../entities/order.entity"

@Injectable()
export class OrderNotificationService {
  async sendOrderCreatedNotification(order: Order): Promise<void> {
    console.log(`📧 Order Created Notification: Order ${order.orderNumber} has been created`)

    // In a real application, you would send emails, SMS, or push notifications
    // Example:
    // await this.emailService.sendEmail({
    //   to: order.customer?.email,
    //   subject: `Order Confirmation - ${order.orderNumber}`,
    //   template: 'order-created',
    //   data: { order }
    // });
  }

  async sendStatusChangeNotification(order: Order, fromStatus: OrderStatus, toStatus: OrderStatus): Promise<void> {
    console.log(`📧 Status Change Notification: Order ${order.orderNumber} changed from ${fromStatus} to ${toStatus}`)

    // Send different notifications based on status
    switch (toStatus) {
      case OrderStatus.CONFIRMED:
        await this.sendOrderConfirmedNotification(order)
        break
      case OrderStatus.SHIPPED:
        await this.sendOrderShippedNotification(order)
        break
      case OrderStatus.DELIVERED:
        await this.sendOrderDeliveredNotification(order)
        break
      case OrderStatus.CANCELLED:
        await this.sendOrderCancelledNotification(order)
        break
    }
  }

  async sendTrackingUpdateNotification(order: Order): Promise<void> {
    console.log(`📧 Tracking Update: Order ${order.orderNumber} tracking number: ${order.trackingNumber}`)

    // In a real application:
    // await this.emailService.sendEmail({
    //   to: order.customer?.email,
    //   subject: `Tracking Information - ${order.orderNumber}`,
    //   template: 'tracking-update',
    //   data: { order }
    // });
  }

  private async sendOrderConfirmedNotification(order: Order): Promise<void> {
    console.log(`✅ Order Confirmed: ${order.orderNumber}`)
  }

  private async sendOrderShippedNotification(order: Order): Promise<void> {
    console.log(`🚚 Order Shipped: ${order.orderNumber} - Tracking: ${order.trackingNumber}`)
  }

  private async sendOrderDeliveredNotification(order: Order): Promise<void> {
    console.log(`📦 Order Delivered: ${order.orderNumber}`)
  }

  private async sendOrderCancelledNotification(order: Order): Promise<void> {
    console.log(`❌ Order Cancelled: ${order.orderNumber}`)
  }
}
