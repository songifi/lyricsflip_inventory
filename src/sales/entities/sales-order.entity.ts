import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { OrderItem } from "./order-item.entity"
import { OrderTracking } from "./order-tracking.entity"

export enum OrderStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

@Entity("sales_orders")
export class SalesOrder {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  orderNumber: string

  @Column("uuid")
  customerId: string

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus

  @Column("decimal", { precision: 10, scale: 2 })
  subtotal: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  taxAmount: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  shippingCost: number

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  discountAmount: number

  @Column("decimal", { precision: 10, scale: 2 })
  totalAmount: number

  @Column({ length: 10, nullable: true })
  currency: string

  // Shipping Address
  @Column({ length: 255 })
  shippingName: string

  @Column({ length: 255 })
  shippingAddress1: string

  @Column({ length: 255, nullable: true })
  shippingAddress2: string

  @Column({ length: 100 })
  shippingCity: string

  @Column({ length: 100 })
  shippingState: string

  @Column({ length: 20 })
  shippingZipCode: string

  @Column({ length: 100 })
  shippingCountry: string

  @Column({ length: 20, nullable: true })
  shippingPhone: string

  // Billing Address
  @Column({ length: 255 })
  billingName: string

  @Column({ length: 255 })
  billingAddress1: string

  @Column({ length: 255, nullable: true })
  billingAddress2: string

  @Column({ length: 100 })
  billingCity: string

  @Column({ length: 100 })
  billingState: string

  @Column({ length: 20 })
  billingZipCode: string

  @Column({ length: 100 })
  billingCountry: string

  @Column({ length: 20, nullable: true })
  billingPhone: string

  @Column("text", { nullable: true })
  notes: string

  @Column({ length: 100, nullable: true })
  shippingMethod: string

  @Column({ length: 100, nullable: true })
  trackingNumber: string

  @Column("timestamp", { nullable: true })
  shippedAt: Date

  @Column("timestamp", { nullable: true })
  deliveredAt: Date

  @OneToMany(
    () => OrderItem,
    (item) => item.order,
    { cascade: true },
  )
  items: OrderItem[]

  @OneToMany(
    () => OrderTracking,
    (tracking) => tracking.order,
    { cascade: true },
  )
  trackingHistory: OrderTracking[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
