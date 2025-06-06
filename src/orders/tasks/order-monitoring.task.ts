import { Injectable } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import type { OrderService } from "../services/order.service"
import { OrderStatus } from "../entities/order.entity"

@Injectable()
export class OrderMonitoringTask {
  constructor(private readonly orderService: OrderService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async checkPendingOrders() {
    console.log("Checking for pending orders that need attention...")

    const pendingOrders = await this.orderService.getOrdersByStatus(OrderStatus.PENDING)
    const oldPendingOrders = pendingOrders.filter((order) => {
      const hoursSincePending = (Date.now() - order.createdAt.getTime()) / (1000 * 60 * 60)
      return hoursSincePending > 2 // Orders pending for more than 2 hours
    })

    if (oldPendingOrders.length > 0) {
      console.log(`Found ${oldPendingOrders.length} orders pending for more than 2 hours`)
      // In a real application, send alerts to operations team
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkShippedOrders() {
    console.log("Checking shipped orders for delivery updates...")

    const shippedOrders = await this.orderService.getOrdersByStatus(OrderStatus.SHIPPED)

    for (const order of shippedOrders) {
      if (order.estimatedDeliveryDate && order.estimatedDeliveryDate < new Date()) {
        console.log(`Order ${order.orderNumber} is past estimated delivery date`)
        // In a real application, check with shipping carrier for updates
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async generateDailyOrderReport() {
    console.log("Generating daily order report...")

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterdayOrders = await this.orderService.findAll({
      createdAfter: yesterday.toISOString(),
      createdBefore: today.toISOString(),
    })

    console.log(`Yesterday's order summary: ${yesterdayOrders.length} orders created`)

    // Group by status
    const statusCounts = yesterdayOrders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    console.log("Status breakdown:", statusCounts)

    // In a real application, send this report to management
  }
}
