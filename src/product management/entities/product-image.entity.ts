import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Product } from "./product.entity"

@Entity("product_images")
export class ProductImage {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 500 })
  url: string

  @Column({ length: 255, nullable: true })
  altText: string

  @Column("int", { default: 0 })
  sortOrder: number

  @Column("boolean", { default: false })
  isPrimary: boolean

  @ManyToOne(
    () => Product,
    (product) => product.images,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "productId" })
  product: Product

  @Column("uuid")
  productId: string
}
