import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Order, OrderStatus } from "./order.entity"

@Entity("order_status_history")
export class OrderStatusHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  orderId: string

  @ManyToOne(
    () => Order,
    (order) => order.statusHistory,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "orderId" })
  order: Order

  @Column({
    type: "enum",
    enum: OrderStatus,
  })
  fromStatus: OrderStatus

  @Column({
    type: "enum",
    enum: OrderStatus,
  })
  toStatus: OrderStatus

  @Column({ type: "varchar", length: 255, nullable: true })
  changedBy: string

  @Column({ type: "text", nullable: true })
  reason: string

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @CreateDateColumn()
  timestamp: Date
}
