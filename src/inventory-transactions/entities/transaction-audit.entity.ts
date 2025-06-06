import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { InventoryTransaction } from "./inventory-transaction.entity"

export enum AuditAction {
  CREATED = "created",
  UPDATED = "updated",
  STATUS_CHANGED = "status_changed",
  APPROVED = "approved",
  PROCESSED = "processed",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REVERSED = "reversed",
  ITEM_ADDED = "item_added",
  ITEM_UPDATED = "item_updated",
  ITEM_REMOVED = "item_removed",
}

@Entity("transaction_audit")
export class TransactionAudit {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  transactionId: string

  @ManyToOne(
    () => InventoryTransaction,
    (transaction) => transaction.auditTrail,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "transactionId" })
  transaction: InventoryTransaction

  @Column({
    type: "enum",
    enum: AuditAction,
  })
  action: AuditAction

  @Column({ type: "varchar", length: 255 })
  performedBy: string

  @Column({ type: "varchar", length: 255, nullable: true })
  fieldName: string

  @Column({ type: "text", nullable: true })
  oldValue: string

  @Column({ type: "text", nullable: true })
  newValue: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @Column({ type: "inet", nullable: true })
  ipAddress: string

  @Column({ type: "varchar", length: 500, nullable: true })
  userAgent: string

  @CreateDateColumn()
  timestamp: Date
}
