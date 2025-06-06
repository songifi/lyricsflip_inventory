import { Injectable } from "@nestjs/common"
import type { InventoryTransaction, TransactionStatus } from "../entities/inventory-transaction.entity"

@Injectable()
export class InventoryNotificationService {
  async sendTransactionCreatedNotification(transaction: InventoryTransaction): Promise<void> {
    console.log(`📦 Transaction Created: ${transaction.transactionNumber} (${transaction.type})`)

    // In a real application, send notifications based on transaction type and priority
    if (transaction.priority === "urgent") {
      console.log(`🚨 URGENT: Transaction ${transaction.transactionNumber} requires immediate attention`)
    }
  }

  async sendStatusChangeNotification(
    transaction: InventoryTransaction,
    oldStatus: TransactionStatus,
    newStatus: TransactionStatus,
  ): Promise<void> {
    console.log(`📋 Status Update: ${transaction.transactionNumber} - ${oldStatus} → ${newStatus}`)

    // Send different notifications based on status
    switch (newStatus) {
      case "approved":
        await this.sendTransactionApprovedNotification(transaction)
        break
      case "completed":
        await this.sendTransactionCompletedNotification(transaction)
        break
      case "cancelled":
        await this.sendTransactionCancelledNotification(transaction)
        break
    }
  }

  async sendTransactionCompletedNotification(transaction: InventoryTransaction): Promise<void> {
    console.log(`✅ Transaction Completed: ${transaction.transactionNumber}`)

    // Calculate total items processed
    const totalItems = transaction.items?.reduce((sum, item) => sum + item.actualQuantity, 0) || 0
    console.log(`   Total items processed: ${totalItems}`)

    // Check for variances
    const hasVariances = transaction.items?.some((item) => item.varianceQuantity !== 0)
    if (hasVariances) {
      console.log(`⚠️  Transaction ${transaction.transactionNumber} has quantity variances`)
    }
  }

  async sendTransactionReversedNotification(
    originalTransaction: InventoryTransaction,
    reversalTransaction: InventoryTransaction,
  ): Promise<void> {
    console.log(`🔄 Transaction Reversed: ${originalTransaction.transactionNumber}`)
    console.log(`   Reversal transaction: ${reversalTransaction.transactionNumber}`)
  }

  private async sendTransactionApprovedNotification(transaction: InventoryTransaction): Promise<void> {
    console.log(`👍 Transaction Approved: ${transaction.transactionNumber}`)
  }

  private async sendTransactionCancelledNotification(transaction: InventoryTransaction): Promise<void> {
    console.log(`❌ Transaction Cancelled: ${transaction.transactionNumber}`)
  }
}
