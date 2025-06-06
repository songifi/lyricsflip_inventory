import { Injectable } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import type { StockLevelService } from "../services/stock-level.service"
import type { StockNotificationService } from "../services/stock-notification.service"

@Injectable()
export class StockMonitoringTask {
  constructor(
    private readonly stockLevelService: StockLevelService,
    private readonly notificationService: StockNotificationService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkLowStockLevels() {
    console.log("Running scheduled low stock check...")

    const lowStockItems = await this.stockLevelService.getLowStockItems()

    console.log(`Found ${lowStockItems.length} items with low stock levels`)

    // Process each low stock item
    for (const stockLevel of lowStockItems) {
      if (stockLevel.status === "low") {
        await this.notificationService.sendLowStockAlert(stockLevel, stockLevel.product)
      } else if (stockLevel.status === "out_of_stock") {
        await this.notificationService.sendOutOfStockAlert(stockLevel, stockLevel.product)
      }
    }
  }

  // Weekly stock report generation
  @Cron(CronExpression.EVERY_WEEK)
  async generateWeeklyStockReport() {
    console.log("Generating weekly stock report...")

    // In a real application, this would generate a report and send it to stakeholders
    // const report = await this.reportService.generateStockReport();
    // await this.emailService.sendEmail({
    //   to: 'management@example.com',
    //   subject: 'Weekly Stock Report',
    //   body: 'Please find attached the weekly stock report.',
    //   attachments: [report]
    // });
  }
}
