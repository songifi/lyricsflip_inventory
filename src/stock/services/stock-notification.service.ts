import { Injectable } from "@nestjs/common";
import type { StockLevel } from "../entities/stock-level.entity";
import type { Product } from "../entities/product.entity";

@Injectable()
export class StockNotificationService {
  async sendLowStockAlert(
    stockLevel: StockLevel,
    product: Product
  ): Promise<void> {
    console.log(
      `LOW STOCK ALERT: ${product.name} (${product.sku}) is running low. Current quantity: ${stockLevel.currentQuantity}, Threshold: ${stockLevel.minimumThreshold}`
    );
  }

  async sendOutOfStockAlert(
    stockLevel: StockLevel,
    product: Product
  ): Promise<void> {
    console.log(
      `OUT OF STOCK ALERT: ${product.name} (${product.sku}) is out of stock!`
    );
  }
}
