import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Supplier } from './supplier.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';

export enum PurchaseOrderStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ORDERED = 'ORDERED',
  PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
  FULLY_RECEIVED = 'FULLY_RECEIVED',
  CANCELLED = 'CANCELLED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @Column({
    type: 'enum',
    enum: PurchaseOrderStatus,
    default: PurchaseOrderStatus.DRAFT,
  })
  status: PurchaseOrderStatus;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority: Priority;

  @ManyToOne(() => Supplier, supplier => supplier.orders, { eager: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @OneToMany(() => PurchaseOrderItem, item => item.purchaseOrder, {
    cascade: true,
    eager: true,
  })
  items: PurchaseOrderItem[];

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  taxRate: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ nullable: true })
  requestedBy: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  rejectedBy: string;

  @Column('text', { nullable: true })
  rejectionReason: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  orderedAt: Date;

  @Column({ type: 'date', nullable: true })
  expectedDeliveryDate: Date;

  @Column({ type: 'date', nullable: true })
  actualDeliveryDate: Date;

  @Column('text', { nullable: true })
  deliveryAddress: string;

  @Column('text', { nullable: true })
  receivingNotes: string;

  @Column({ nullable: true })
  receivedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  receivedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 