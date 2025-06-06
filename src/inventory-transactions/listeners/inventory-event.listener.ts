import { Injectable } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import type { InventoryNotificationService } from "../services/inventory-notification.service"

@Injectable()
export class InventoryEventListener {
  constructor(private readonly notificationService: InventoryNotificationService) {}

  @OnEvent("inventory.transaction.created")
  handleTransactionCreatedEvent(payload: any) {
    const { transaction } = payload
    console.log(`Inventory transaction created: ${transaction.transactionNumber}`)
    this.notificationService.sendTransactionCreatedNotification(transaction)
  }

  @OnEvent("inventory.transaction.status.changed")
  handleTransactionStatusChangedEvent(payload: any) {
    const { transaction, oldStatus, newStatus, performedBy } = payload
    console.log(
      `Transaction ${transaction.transactionNumber} status changed from ${oldStatus} to ${newStatus} by ${performedBy}`,
    )
    this.notificationService.sendStatusChangeNotification(transaction, oldStatus, newStatus)
  }

  @OnEvent("inventory.transaction.completed")
  handleTransactionCompletedEvent(payload: any) {
    const { transaction } = payload
    console.log(`Transaction completed: ${transaction.transactionNumber}`)
    this.notificationService.sendTransactionCompletedNotification(transaction)
  }

  @OnEvent("inventory.transaction.reversed")
  handleTransactionReversedEvent(payload: any) {
    const { originalTransaction, reversalTransaction, performedBy } = payload
    console.log(
      `Transaction ${originalTransaction.transactionNumber} reversed by ${performedBy}. Reversal: ${reversalTransaction.transactionNumber}`,
    )
    this.notificationService.sendTransactionReversedNotification(originalTransaction, reversalTransaction)
  }
}
