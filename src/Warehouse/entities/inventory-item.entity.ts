import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { StorageLocation } from './storage-location.entity';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  sku: string;

  @Column({ length: 200 })
  productName: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  reservedQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitPrice: number;

  @Column('uuid')
  warehouseId: string;

  @ManyToOne(() => Warehouse, warehouse => warehouse.inventoryItems)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ type: 'uuid', nullable: true })
  storageLocationId: string;

  @ManyToOne(() => StorageLocation, location => location.inventoryItems, { nullable: true })
  @JoinColumn({ name: 'storageLocationId' })
  storageLocation: StorageLocation;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ length: 50, nullable: true })
  batchNumber: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

