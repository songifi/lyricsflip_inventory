import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  APPROVED = 'approved',
  ORDERED = 'ordered',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  orderNumber: string;

  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.DRAFT
  })
  status: PurchaseOrderStatus;

  @Column({ length: 200 })
  supplier: string;

  @Column({ length: 100, nullable: true })
  supplierEmail: string;

  @Column('uuid')
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'date' })
  orderDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ type: 'date', nullable: true })
  receivedDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => PurchaseOrderItem, item => item.purchaseOrder, { cascade: true })
  items: PurchaseOrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

