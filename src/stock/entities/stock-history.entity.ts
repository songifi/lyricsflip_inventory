import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { StockLevel } from "./stock-level.entity"

@Entity("stock_history")
export class StockHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  stockLevelId: string

  @ManyToOne(
    () => StockLevel,
    (stockLevel) => stockLevel.history,
  )
  @JoinColumn({ name: "stockLevelId" })
  stockLevel: StockLevel

  @Column({ type: "int" })
  quantityBefore: number

  @Column({ type: "int" })
  quantityAfter: number

  @Column({ type: "int" })
  quantityChanged: number

  @Column({ type: "varchar", length: 50 })
  type: "addition" | "reduction" | "adjustment" | "inventory_count"

  @Column({ type: "varchar", length: 255, nullable: true })
  reference: string

  @Column({ type: "varchar", length: 255, nullable: true })
  performedBy: string

  @Column({ type: "text", nullable: true })
  notes: string

  @CreateDateColumn()
  timestamp: Date
}
