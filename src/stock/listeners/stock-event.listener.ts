import { Injectable } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import type { StockNotificationService } from "../services/stock-notification.service"

@Injectable()
export class StockEventListener {
  constructor(private readonly notificationService: StockNotificationService) {}

  @OnEvent("stock.updated")
  handleStockUpdatedEvent(payload: any) {
    console.log(
      `Stock updated: ${payload.stockLevel.product.name}, New quantity: ${payload.stockLevel.currentQuantity}`,
    )
    // Additional logic for stock updates
  }

  @OnEvent("stock.alert")
  handleStockAlertEvent(payload: any) {
    const { stockLevel, product, status } = payload

    if (status === "low") {
      this.notificationService.sendLowStockAlert(stockLevel, product)
    } else if (status === "out_of_stock") {
      this.notificationService.sendOutOfStockAlert(stockLevel, product)
    }
  }
}
