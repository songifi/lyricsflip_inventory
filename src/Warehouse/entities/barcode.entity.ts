import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { InventoryItem } from './inventory-item.entity';
import { StorageLocation } from './storage-location.entity';

export enum BarcodeType {
  EAN13 = 'ean13',
  UPC = 'upc',
  CODE128 = 'code128',
  QR_CODE = 'qr_code'
}

@Entity('barcodes')
export class Barcode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: BarcodeType
  })
  type: BarcodeType;

  @Column({ type: 'uuid', nullable: true })
  inventoryItemId: string;

  @ManyToOne(() => InventoryItem, { nullable: true })
  @JoinColumn({ name: 'inventoryItemId' })
  inventoryItem: InventoryItem;

  @Column({ type: 'uuid', nullable: true })
  storageLocationId: string;

  @ManyToOne(() => StorageLocation, { nullable: true })
  @JoinColumn({ name: 'storageLocationId' })
  storageLocation: StorageLocation;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

// Add barcode field to InventoryItem entity
// Update the existing InventoryItem entity by adding this column:
// @Column({ length: 100, nullable: true, unique: true })
// barcode: string;

