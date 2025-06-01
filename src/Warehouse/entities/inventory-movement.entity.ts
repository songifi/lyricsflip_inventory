import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { InventoryItem } from './inventory-item.entity';
import { StorageLocation } from './storage-location.entity';
import { Warehouse } from './warehouse.entity';
import { User } from './user.entity';

export enum MovementType {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
  CYCLE_COUNT = 'cycle_count'
}

export enum MovementStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('inventory_movements')
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  movementNumber: string;

  @Column({
    type: 'enum',
    enum: MovementType
  })
  type: MovementType;

  @Column({
    type: 'enum',
    enum: MovementStatus,
    default: MovementStatus.PENDING
  })
  status: MovementStatus;

  @Column('uuid')
  inventoryItemId: string;

  @ManyToOne(() => InventoryItem)
  @JoinColumn({ name: 'inventoryItemId' })
  inventoryItem: InventoryItem;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'uuid', nullable: true })
  fromLocationId: string;

  @ManyToOne(() => StorageLocation, { nullable: true })
  @JoinColumn({ name: 'fromLocationId' })
  fromLocation: StorageLocation;

  @Column({ type: 'uuid', nullable: true })
  toLocationId: string;

  @ManyToOne(() => StorageLocation, { nullable: true })
  @JoinColumn({ name: 'toLocationId' })
  toLocation: StorageLocation;

  @Column('uuid')
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ length: 100, nullable: true })
  referenceNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitCost: number;

  @Column({ type: 'timestamp', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}

