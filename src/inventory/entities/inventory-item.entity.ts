// src/inventory/entities/inventory-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}