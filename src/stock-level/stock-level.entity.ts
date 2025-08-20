import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from "typeorm";
import {
  IsNotEmpty,
  IsUUID,
  Min,
} from "class-validator";

@Entity("stock_levels")
@Unique(["itemId", "warehouseId"])
@Index(["itemId"])
@Index(["warehouseId"])
export class StockLevel {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "item_id" })
  @IsNotEmpty()
  @IsUUID()
  itemId: string;

  @Column({ name: "warehouse_id" })
  @IsNotEmpty()
  @IsUUID()
  warehouseId: string;

  @Column({ type: "integer", default: 0 })
  @Min(0)
  quantity: number;

  @Column({ type: "integer", default: 0, name: "reserved_quantity" })
  @Min(0)
  reservedQuantity: number;

  @Column({ type: "integer", default: 0, name: "available_quantity" })
  @Min(0)
  availableQuantity: number;

  @Column({ type: "integer", nullable: true, name: "minimum_stock_level" })
  @Min(0)
  minimumStockLevel?: number;

  @Column({ type: "integer", nullable: true, name: "maximum_stock_level" })
  @Min(0)
  maximumStockLevel?: number;

  @Column({ type: "timestamp", name: "last_movement_at", nullable: true })
  lastMovementAt?: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}