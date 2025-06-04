import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Entity('stock_levels')
export class StockLevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  productId: string;

  @Column({ type: 'varchar', length: 50 })
  locationId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reservedQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  availableQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minStockLevel: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  maxStockLevel: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reorderPoint: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  averageCost?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  lastCost?: number;

  @Column({ type: 'boolean', default: false })
  isLowStock: boolean;

  @Column({ type: 'boolean', default: false })
  isOutOfStock: boolean;

  @UpdateDateColumn()
  lastUpdated: Date;

  @CreateDateColumn()
  createdAt: Date;
}