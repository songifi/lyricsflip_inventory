// src/inventory/entities/stock-adjustment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('stock_adjustments')
export class StockAdjustment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sku: string;

  @Column()
  locationId: string;

  @Column('int')
  quantityChange: number;

  @Column()
  reason: string;

  @CreateDateColumn()
  adjustedAt: Date;
}