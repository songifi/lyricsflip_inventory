import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StorageLocation } from './storage-location.entity';
import { InventoryItem } from './inventory-item.entity';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  state: string;

  @Column({ length: 20 })
  zipCode: string;

  @Column({ length: 100 })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column({ length: 20, nullable: true })
  contactPhone: string;

  @Column({ length: 100, nullable: true })
  contactEmail: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => StorageLocation, location => location.warehouse)
  storageLocations: StorageLocation[];

  @OneToMany(() => InventoryItem, item => item.warehouse)
  inventoryItems: InventoryItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

