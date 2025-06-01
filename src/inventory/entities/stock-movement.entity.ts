// src/inventory/entities/stock-movement.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sku: string;

  @Column()
  fromLocation: string;

  @Column()
  toLocation: string;

  @Column('int')
  quantity: number;

  @CreateDateColumn()
  movedAt: Date;
}