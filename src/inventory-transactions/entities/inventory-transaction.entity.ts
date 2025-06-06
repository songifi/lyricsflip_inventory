import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm"
import { Warehouse } from "./warehouse.entity"
import { TransactionItem } from "./transaction-item.entity"
import { TransactionAudit } from "./transaction-audit.entity"

export enum TransactionType {
  RECEIPT = "receipt",
  SHIPMENT = "shipment",
  TRANSFER = "transfer",
  ADJUSTMENT = "adjustment",
  CYCLE_COUNT = "cycle_count",
  DAMAGE = "damage",
  RETURN = "return",
  ALLOCATION = "allocation",
  DEALLOCATION = "deallocation",
  RESERVATION = "reservation",
  RELEASE = "release",
}

export enum TransactionStatus {
  DRAFT = "draft",
  PENDING = "pending",
  APPROVED = "approved",
  PROCESSING = "processing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REVERSED = "reversed",
}

export enum TransactionPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

@Entity("inventory_transactions")
export class InventoryTransaction {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 50, unique: true })
  transactionNumber: string

  @Column({
    type: "enum",
    enum: TransactionType,
  })
  type: TransactionType

  @Column({
    type: "enum",
    enum: TransactionStatus,
    default: TransactionStatus.DRAFT,
  })
  status: TransactionStatus

  @Column({
    type: "enum",
    enum: TransactionPriority,
    default: TransactionPriority.NORMAL,
  })
  priority: TransactionPriority

  @Column({ type: "uuid" })
  warehouseId: string

  @ManyToOne(
    () => Warehouse,
    (warehouse) => warehouse.transactions,
  )
  @JoinColumn({ name: "warehouseId" })
  warehouse: Warehouse

  @Column({ type: "uuid", nullable: true })
  destinationWarehouseId: string

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: "destinationWarehouseId" })
  destinationWarehouse: Warehouse

  @Column({ type: "varchar", length: 255, nullable: true })
  referenceNumber: string

  @Column({ type: "varchar", length: 100, nullable: true })
  referenceType: string

  @Column({ type: "varchar", length: 255, nullable: true })
  supplier: string

  @Column({ type: "varchar", length: 255, nullable: true })
  customer: string

  @Column({ type: "varchar", length: 255 })
  initiatedBy: string

  @Column({ type: "varchar", length: 255, nullable: true })
  approvedBy: string

  @Column({ type: "varchar", length: 255, nullable: true })
  processedBy: string

  @Column({ type: "timestamp", nullable: true })
  approvedAt: Date

  @Column({ type: "timestamp", nullable: true })
  processedAt: Date

  @Column({ type: "timestamp", nullable: true })
  completedAt: Date

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ type: "text", nullable: true })
  reason: string

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @Column({ type: "uuid", nullable: true })
  parentTransactionId: string

  @ManyToOne(() => InventoryTransaction)
  @JoinColumn({ name: "parentTransactionId" })
  parentTransaction: InventoryTransaction

  @Column({ type: "boolean", default: false })
  requiresApproval: boolean

  @Column({ type: "boolean", default: false })
  isReversed: boolean

  @Column({ type: "uuid", nullable: true })
  reversalTransactionId: string

  @OneToMany(
    () => TransactionItem,
    (item) => item.transaction,
    {
      cascade: true,
    },
  )
  items: TransactionItem[]

  @OneToMany(
    () => TransactionAudit,
    (audit) => audit.transaction,
    {
      cascade: true,
    },
  )
  auditTrail: TransactionAudit[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
