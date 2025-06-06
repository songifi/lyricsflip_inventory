import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { InventoryTransaction } from "./inventory-transaction.entity"
import { WarehouseStockLevel } from "./warehouse-stock-level.entity"

export enum WarehouseType {
  MAIN = "main",
  DISTRIBUTION = "distribution",
  RETAIL = "retail",
  RETURNS = "returns",
  QUARANTINE = "quarantine",
}

export enum WarehouseStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance",
}

@Entity("warehouses")
export class Warehouse {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 100, unique: true })
  code: string

  @Column({ type: "varchar", length: 255 })
  name: string

  @Column({
    type: "enum",
    enum: WarehouseType,
    default: WarehouseType.MAIN,
  })
  type: WarehouseType

  @Column({
    type: "enum",
    enum: WarehouseStatus,
    default: WarehouseStatus.ACTIVE,
  })
  status: WarehouseStatus

  @Column({ type: "jsonb", nullable: true })
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }

  @Column({ type: "varchar", length: 255, nullable: true })
  manager: string

  @Column({ type: "varchar", length: 20, nullable: true })
  phone: string

  @Column({ type: "varchar", length: 255, nullable: true })
  email: string

  @Column({ type: "int", nullable: true })
  capacity: number

  @Column({ type: "text", nullable: true })
  description: string

  @OneToMany(
    () => InventoryTransaction,
    (transaction) => transaction.warehouse,
  )
  transactions: InventoryTransaction[]

  @OneToMany(
    () => WarehouseStockLevel,
    (stockLevel) => stockLevel.warehouse,
  )
  stockLevels: WarehouseStockLevel[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
