// src/purchase-orders/entities/purchase-order.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PurchaseOrderItem } from './purchase-order-item.entity';
import { PurchaseOrderHistory } from './purchase-order-history.entity';

export enum OrderStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  RECEIVED = 'received',
  COMPLETED = 'completed'
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @Column()
  supplierId: string;

  @Column()
  supplierName: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.DRAFT
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING
  })
  approvalStatus: ApprovalStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shippingAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  grandTotal: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  expectedDeliveryDate: Date;

  @OneToMany(() => PurchaseOrderItem, item => item.purchaseOrder, { cascade: true })
  items: PurchaseOrderItem[];

  @OneToMany(() => PurchaseOrderHistory, history => history.purchaseOrder, { cascade: true })
  history: PurchaseOrderHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}