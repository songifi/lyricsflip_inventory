import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { ProductImage } from "./product-image.entity"

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 255 })
  name: string

  @Column("text", { nullable: true })
  description: string

  @Column("decimal", { precision: 10, scale: 2 })
  price: number

  @Column({ length: 100, nullable: true })
  category: string

  @Column({ length: 50, nullable: true })
  brand: string

  @Column("int", { default: 0 })
  stock: number

  @Column({ length: 100, nullable: true })
  sku: string

  @Column("boolean", { default: true })
  isActive: boolean

  @Column("json", { nullable: true })
  specifications: Record<string, any>

  @OneToMany(
    () => ProductImage,
    (image) => image.product,
    { cascade: true },
  )
  images: ProductImage[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
