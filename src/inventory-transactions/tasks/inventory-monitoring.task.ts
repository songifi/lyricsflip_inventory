import { Injectable } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import type { InventoryTransactionService } from "../services/inventory-transaction.service"
import { TransactionStatus } from "../entities/inventory-transaction.entity"

@Injectable()
export class InventoryMonitoringTask {
  constructor(private readonly transactionService: InventoryTransactionService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkPendingTransactions() {
    console.log("Checking for pending transactions that need attention...")

    const pendingTransactions = await this.transactionService.findAll({
      status: TransactionStatus.PENDING,
    })

    const oldPendingTransactions = pendingTransactions.filter((transaction) => {
      const hoursSincePending = (Date.now() - transaction.createdAt.getTime()) / (1000 * 60 * 60)
      return hoursSincePending > 4 // Transactions pending for more than 4 hours
    })

    if (oldPendingTransactions.length > 0) {
      console.log(`Found ${oldPendingTransactions.length} transactions pending for more than 4 hours`)
      // In a real application, send alerts to operations team
    }
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async checkApprovedTransactions() {
    console.log("Checking for approved transactions that haven't been processed...")

    const approvedTransactions = await this.transactionService.findAll({
      status: TransactionStatus.APPROVED,
    })

    const oldApprovedTransactions = approvedTransactions.filter((transaction) => {
      const hoursSinceApproved = (Date.now() - (transaction.approvedAt?.getTime() || 0)) / (1000 * 60 * 60)
      return hoursSinceApproved > 8 // Transactions approved for more than 8 hours
    })

    if (oldApprovedTransactions.length > 0) {
      console.log(`Found ${oldApprovedTransactions.length} transactions approved but not processed`)
      // In a real application, send alerts to warehouse team
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async generateDailyInventoryReport() {
    console.log("Generating daily inventory transaction report...")

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterdayTransactions = await this.transactionService.findAll({
      createdAfter: yesterday.toISOString(),
      createdBefore: today.toISOString(),
    })

    console.log(`Yesterday's transaction summary: ${yesterdayTransactions.length} transactions`)

    // Group by type and status
    const typeStatusCounts = yesterdayTransactions.reduce(
      (acc, transaction) => {
        const key = `${transaction.type}-${transaction.status}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    console.log("Transaction breakdown:", typeStatusCounts)

    // Calculate total items moved
    const totalItems = yesterdayTransactions.reduce((sum, transaction) => {
      return sum + (transaction.items?.reduce((itemSum, item) => itemSum + item.actualQuantity, 0) || 0)
    }, 0)

    console.log(`Total items processed: ${totalItems}`)
  }
}
