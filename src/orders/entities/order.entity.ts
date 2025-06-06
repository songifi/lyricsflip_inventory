import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { OrderItem } from "./order-item.entity"
import { OrderStatusHistory } from "./order-status-history.entity"
import { Customer } from "./customer.entity"

export enum OrderStatus {
  DRAFT = "draft",
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PROCESSING = "processing",
  PICKING = "picking",
  PACKED = "packed",
  SHIPPED = "shipped",
  OUT_FOR_DELIVERY = "out_for_delivery",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  RETURNED = "returned",
  REFUNDED = "refunded",
}

export enum OrderPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 50, unique: true })
  orderNumber: string

  @Column({ type: "uuid", nullable: true })
  customerId: string

  @ManyToOne(
    () => Customer,
    (customer) => customer.orders,
  )
  @JoinColumn({ name: "customerId" })
  customer: Customer

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.DRAFT,
  })
  status: OrderStatus

  @Column({
    type: "enum",
    enum: OrderPriority,
    default: OrderPriority.NORMAL,
  })
  priority: OrderPriority

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  subtotal: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  taxAmount: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  shippingAmount: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  discountAmount: number

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  totalAmount: number

  @Column({ type: "varchar", length: 10, default: "USD" })
  currency: string

  @Column({ type: "jsonb", nullable: true })
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }

  @Column({ type: "jsonb", nullable: true })
  billingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }

  @Column({ type: "varchar", length: 255, nullable: true })
  trackingNumber: string

  @Column({ type: "varchar", length: 100, nullable: true })
  shippingCarrier: string

  @Column({ type: "timestamp", nullable: true })
  estimatedDeliveryDate: Date

  @Column({ type: "timestamp", nullable: true })
  actualDeliveryDate: Date

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ type: "varchar", length: 255, nullable: true })
  assignedTo: string

  @OneToMany(
    () => OrderItem,
    (orderItem) => orderItem.order,
    {
      cascade: true,
    },
  )
  items: OrderItem[]

  @OneToMany(
    () => OrderStatusHistory,
    (history) => history.order,
    {
      cascade: true,
    },
  )
  statusHistory: OrderStatusHistory[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
