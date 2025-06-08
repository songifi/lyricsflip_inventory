import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { InventoryItem } from './inventory-item.entity';

export enum ValuationMethod {
  FIFO    = 'FIFO',
  LIFO    = 'LIFO',
  AVERAGE = 'AVERAGE',
}

@Entity('valuation_records')
export class ValuationRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InventoryItem, item => item.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventory_item_id' })
  inventoryItem: InventoryItem;

  @Column({ type: 'enum', enum: ValuationMethod })
  method: ValuationMethod;

  @Column('decimal', { precision: 12, scale: 2 })
  unitCost: number;

  @Column('int')
  quantityOnHand: number;

  @Column('decimal', { precision: 14, scale: 2 })
  totalValue: number;

  @CreateDateColumn()
  createdAt: Date;
}
