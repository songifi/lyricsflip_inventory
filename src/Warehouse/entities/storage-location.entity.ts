import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { InventoryItem } from './inventory-item.entity';

export enum LocationType {
  ZONE = 'zone',
  AISLE = 'aisle',
  SHELF = 'shelf'
}

@Entity('storage_locations')
export class StorageLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: LocationType
  })
  type: LocationType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('uuid')
  warehouseId: string;

  @ManyToOne(() => Warehouse, warehouse => warehouse.storageLocations)
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column({ type: 'uuid', nullable: true })
  parentLocationId: string;

  @ManyToOne(() => StorageLocation, location => location.childLocations, { nullable: true })
  @JoinColumn({ name: 'parentLocationId' })
  parentLocation: StorageLocation;

  @OneToMany(() => StorageLocation, location => location.parentLocation)
  childLocations: StorageLocation[];

  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxWeight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxVolume: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isOccupied: boolean;

  @OneToMany(() => InventoryItem, item => item.storageLocation)
  inventoryItems: InventoryItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

