import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Order } from "./order.entity"
import { Product } from "../../stock/entities/product.entity"

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  orderId: string

  @ManyToOne(
    () => Order,
    (order) => order.items,
    {
      onDelete: "CASCADE",
    },
  )
  @JoinColumn({ name: "orderId" })
  order: Order

  @Column({ type: "uuid" })
  productId: string

  @ManyToOne(() => Product)
  @JoinColumn({ name: "productId" })
  product: Product

  @Column({ type: "int" })
  quantity: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  unitPrice: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  totalPrice: number

  @Column({ type: "varchar", length: 50, nullable: true })
  sku: string

  @Column({ type: "varchar", length: 255, nullable: true })
  productName: string

  @Column({ type: "int", default: 0 })
  allocatedQuantity: number

  @Column({ type: "int", default: 0 })
  pickedQuantity: number

  @Column({ type: "int", default: 0 })
  packedQuantity: number

  @Column({ type: "int", default: 0 })
  shippedQuantity: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
