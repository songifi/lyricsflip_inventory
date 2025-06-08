
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { StockMovement } from './stock-movement.entity';
import { StockAdjustment } from './stock-adjustment.entity';
import { ValuationRecord } from './valuation-record.entity';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sku: string;

  @Column()
  locationId: string;

  @Column('int')
  quantity: number;

  @OneToMany(() => StockMovement, mv => mv.sku, { cascade: true })
  movements: StockMovement[];

  @OneToMany(() => StockAdjustment, adj => adj.sku, { cascade: true })
  adjustments: StockAdjustment[];

  @OneToMany(() => ValuationRecord, vr => vr.inventoryItem, { cascade: true })
  valuationRecords: ValuationRecord[];
}
