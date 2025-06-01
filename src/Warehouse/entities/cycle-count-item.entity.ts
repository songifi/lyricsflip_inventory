import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CycleCount } from './cycle-count.entity';
import { InventoryItem } from './inventory-item.entity';

@Entity('cycle_count_items')
export class CycleCountItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  cycleCountId: string;

  @ManyToOne(() => CycleCount, cc => cc.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cycleCountId' })
  cycleCount: CycleCount;

  @Column('uuid')
  inventoryItemId: string;

  @ManyToOne(() => InventoryItem)
  @JoinColumn({ name: 'inventoryItemId' })
  inventoryItem: InventoryItem;

  @Column({ type: 'int' })
  systemQuantity: number;

  @Column({ type: 'int', nullable: true })
  countedQuantity: number;

  @Column({ type: 'int', default: 0 })
  variance: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  isRecounted: boolean;
}

