import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import {
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsUUID,
  Min,
} from "class-validator";

export enum MovementType {
  IN = "in",
  OUT = "out",
  TRANSFER = "transfer",
  ADJUSTMENT = "adjustment",
}

export enum MovementStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

@Entity("stock_movements")
@Index(["itemId", "movementType"])
@Index(["warehouseId", "createdAt"])
@Index(["status", "createdAt"])
export class StockMovement {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "item_id" })
  @IsNotEmpty()
  @IsUUID()
  itemId: string;

  @Column({ name: "warehouse_id", nullable: true })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @Column({ name: "from_warehouse_id", nullable: true })
  @IsOptional()
  @IsUUID()
  fromWarehouseId?: string;

  @Column({ name: "to_warehouse_id", nullable: true })
  @IsOptional()
  @IsUUID()
  toWarehouseId?: string;

  @Column({
    type: "enum",
    enum: MovementType,
    name: "movement_type",
  })
  @IsNotEmpty()
  movementType: MovementType;

  @Column({ type: "integer" })
  @IsNotEmpty()
  @IsPositive()
  quantity: number;

  @Column({ type: "integer", name: "unit_cost", nullable: true })
  @IsOptional()
  @Min(0)
  unitCost?: number;

  @Column({ type: "integer", name: "total_cost", nullable: true })
  @IsOptional()
  @Min(0)
  totalCost?: number;

  @Column({ nullable: true })
  @IsOptional()
  reason?: string;

  @Column({ name: "reference_number", nullable: true })
  @IsOptional()
  referenceNumber?: string;

  @Column({ name: "batch_number", nullable: true })
  @IsOptional()
  batchNumber?: string;

  @Column({ type: "date", name: "expiry_date", nullable: true })
  @IsOptional()
  expiryDate?: Date;

  @Column({
    type: "enum",
    enum: MovementStatus,
    default: MovementStatus.PENDING,
  })
  status: MovementStatus;

  @Column({ name: "performed_by", nullable: true })
  @IsOptional()
  @IsUUID()
  performedBy?: string;

  @Column({ name: "approved_by", nullable: true })
  @IsOptional()
  @IsUUID()
  approvedBy?: string;

  @Column({ type: "timestamp", name: "approved_at", nullable: true })
  approvedAt?: Date;

  @Column({ type: "jsonb", nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}