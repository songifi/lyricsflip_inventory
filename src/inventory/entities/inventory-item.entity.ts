import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { StockMovement } from './stock-movement.entity';
import { StockAdjustment } from './stock-adjustment.entity';
import { ValuationRecord } from './valuation-record.entity';
import { Reservation } from './reservation.entity';

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

  @OneToMany(() => StockMovement, mv => mv.sku)
  movements: StockMovement[];

  @OneToMany(() => StockAdjustment, adj => adj.sku)
  adjustments: StockAdjustment[];

  @OneToMany(() => ValuationRecord, vr => vr.inventoryItem)
  valuationRecords: ValuationRecord[];

  @OneToMany(() => Reservation, r => r.sku)
  reservations: Reservation[];

  
  get available(): number {
    const reservedQty = this.reservations
      ?.filter(r => r.status === ReservationStatus.ACTIVE)
      .reduce((sum, r) => sum + r.quantity, 0) ?? 0;
    return this.quantity - reservedQty;
  }
}
