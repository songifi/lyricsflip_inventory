import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { SalesOrder } from "./sales-order.entity"

export enum TrackingEventType {
  ORDER_CREATED = "order_created",
  PAYMENT_RECEIVED = "payment_received",
  ORDER_CONFIRMED = "order_confirmed",
  PROCESSING_STARTED = "processing_started",
  SHIPPED = "shipped",
  OUT_FOR_DELIVERY = "out_for_delivery",
  DELIVERED = "delivered",
  EXCEPTION = "exception",
  CANCELLED = "cancelled",
}

@Entity("order_tracking")
export class OrderTracking {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: TrackingEventType,
  })
  eventType: TrackingEventType

  @Column({ length: 255 })
  description: string

  @Column({ length: 100, nullable: true })
  location: string

  @Column("json", { nullable: true })
  metadata: Record<string, any>

  @ManyToOne(
    () => SalesOrder,
    (order) => order.trackingHistory,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "orderId" })
  order: SalesOrder

  @Column("uuid")
  orderId: string

  @CreateDateColumn()
  createdAt: Date
}
