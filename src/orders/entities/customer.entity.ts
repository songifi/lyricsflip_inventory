import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Order } from "./order.entity"

@Entity("customers")
export class Customer {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255 })
  firstName: string

  @Column({ type: "varchar", length: 255 })
  lastName: string

  @Column({ type: "varchar", length: 255, unique: true })
  email: string

  @Column({ type: "varchar", length: 20, nullable: true })
  phone: string

  @Column({ type: "varchar", length: 50, default: "active" })
  status: string

  @OneToMany(
    () => Order,
    (order) => order.customer,
  )
  orders: Order[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
