import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { SalesOrder } from "./sales-order.entity"

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  productId: string

  @Column({ length: 255 })
  productName: string

  @Column({ length: 100, nullable: true })
  productSku: string

  @Column("int")
  quantity: number

  @Column("decimal", { precision: 10, scale: 2 })
  unitPrice: number

  @Column("decimal", { precision: 10, scale: 2 })
  totalPrice: number

  @Column("json", { nullable: true })
  productVariant: Record<string, any>

  @ManyToOne(
    () => SalesOrder,
    (order) => order.items,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "orderId" })
  order: SalesOrder

  @Column("uuid")
  orderId: string
}
