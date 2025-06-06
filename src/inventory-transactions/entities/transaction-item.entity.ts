import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { InventoryTransaction } from "./inventory-transaction.entity"
import { Product } from "../../stock/entities/product.entity"

@Entity("transaction_items")
export class TransactionItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  transactionId: string

  @ManyToOne(
    () => InventoryTransaction,
    (transaction) => transaction.items,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "transactionId" })
  transaction: InventoryTransaction

  @Column({ type: "uuid" })
  productId: string

  @ManyToOne(() => Product)
  @JoinColumn({ name: "productId" })
  product: Product

  @Column({ type: "varchar", length: 50, nullable: true })
  sku: string

  @Column({ type: "varchar", length: 255, nullable: true })
  productName: string

  @Column({ type: "int" })
  plannedQuantity: number

  @Column({ type: "int", default: 0 })
  actualQuantity: number

  @Column({ type: "int", default: 0 })
  varianceQuantity: number

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  unitCost: number

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  totalCost: number

  @Column({ type: "varchar", length: 50, nullable: true })
  lotNumber: string

  @Column({ type: "varchar", length: 50, nullable: true })
  serialNumber: string

  @Column({ type: "date", nullable: true })
  expirationDate: Date

  @Column({ type: "varchar", length: 50, nullable: true })
  condition: string

  @Column({ type: "varchar", length: 100, nullable: true })
  location: string

  @Column({ type: "text", nullable: true })
  notes: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
