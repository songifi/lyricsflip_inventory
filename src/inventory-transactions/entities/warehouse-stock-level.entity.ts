import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm"
import { Warehouse } from "./warehouse.entity"
import { Product } from "../../stock/entities/product.entity"

@Entity("warehouse_stock_levels")
@Unique(["warehouseId", "productId"])
export class WarehouseStockLevel {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "uuid" })
  warehouseId: string

  @ManyToOne(
    () => Warehouse,
    (warehouse) => warehouse.stockLevels,
  )
  @JoinColumn({ name: "warehouseId" })
  warehouse: Warehouse

  @Column({ type: "uuid" })
  productId: string

  @ManyToOne(() => Product)
  @JoinColumn({ name: "productId" })
  product: Product

  @Column({ type: "int", default: 0 })
  availableQuantity: number

  @Column({ type: "int", default: 0 })
  allocatedQuantity: number

  @Column({ type: "int", default: 0 })
  reservedQuantity: number

  @Column({ type: "int", default: 0 })
  damagedQuantity: number

  @Column({ type: "int", default: 0 })
  totalQuantity: number

  @Column({ type: "int", default: 0 })
  minimumThreshold: number

  @Column({ type: "int", nullable: true })
  maximumThreshold: number

  @Column({ type: "varchar", length: 50, nullable: true })
  zone: string

  @Column({ type: "varchar", length: 50, nullable: true })
  aisle: string

  @Column({ type: "varchar", length: 50, nullable: true })
  shelf: string

  @Column({ type: "varchar", length: 50, nullable: true })
  bin: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
