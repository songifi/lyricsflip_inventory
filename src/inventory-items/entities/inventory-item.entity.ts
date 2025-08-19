import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsNotEmpty, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';
import { Company } from '../companies/entities/company.entity'; // Adjust import path
import { InventoryItemImage } from './inventory-item-image.entity';

export enum InventoryItemStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
  OUT_OF_STOCK = 'out_of_stock',
}

@Entity('inventory_items')
@Index(['companyId', 'sku'], { unique: true })
@Index(['companyId', 'category'])
@Index(['companyId', 'status'])
@Index(['companyId', 'location'])
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  company: Company;

  @Column({ length: 100 })
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Column({ length: 500, nullable: true })
  @IsOptional()
  @MaxLength(500)
  description: string;

  @Column({ length: 50, unique: true })
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @Column({ length: 50, nullable: true })
  @IsOptional()
  @MaxLength(50)
  barcode: string;

  @Column({ length: 100 })
  @IsNotEmpty()
  @MaxLength(100)
  category: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({
    type: 'enum',
    enum: InventoryItemStatus,
    default: InventoryItemStatus.ACTIVE,
  })
  status: InventoryItemStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  currentStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  minStockLevel: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  maxStockLevel: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @Column({ length: 20, nullable: true })
  @IsOptional()
  @MaxLength(20)
  unit: string; // e.g., 'pieces', 'kg', 'liters'

  @Column({ length: 100, nullable: true })
  @IsOptional()
  @MaxLength(100)
  location: string;

  @Column({ length: 50, nullable: true })
  @IsOptional()
  @MaxLength(50)
  supplier: string;

  @Column({ type: 'boolean', default: false })
  isLowStock: boolean;

  @OneToMany(() => InventoryItemImage, (image) => image.inventoryItem, {
    cascade: true,
    eager: false,
  })
  images: InventoryItemImage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  updateLowStockStatus() {
    this.isLowStock = this.currentStock <= this.minStockLevel;
  }
}
