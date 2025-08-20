// src/purchase-orders/entities/purchase-order-history.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('purchase_order_history')
export class PurchaseOrderHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string;

  @Column()
  oldValue: string;

  @Column()
  newValue: string;

  @Column()
  changedBy: string;

  @Column({ nullable: true })
  notes: string;

  @ManyToOne(() => PurchaseOrder, purchaseOrder => purchaseOrder.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;

  @Column()
  purchaseOrderId: string;

  @CreateDateColumn()
  createdAt: Date;
}
