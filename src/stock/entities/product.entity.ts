import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { StockLevel } from "./stock-level.entity"

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255 })
  name: string

  @Column({ type: "varchar", length: 50, unique: true })
  sku: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "varchar", length: 50, nullable: true })
  category: string

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  price: number

  @OneToMany(
    () => StockLevel,
    (stockLevel) => stockLevel.product,
  )
  stockLevels: StockLevel[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
