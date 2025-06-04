import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DISCONTINUED = 'discontinued',
  OUT_OF_STOCK = 'out_of_stock',
  ARCHIVED = 'archived'
}

export enum ProductCondition {
  NEW = 'new',
  USED = 'used',
  REFURBISHED = 'refurbished'
}

@Entity('products')
@Index(['name', 'category'])
@Index(['price'])
@Index(['status'])
@Index(['sku'])
@Index(['barcode'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  @Index()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  costPrice: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  compareAtPrice: number;

  @Column({ length: 100, nullable: true })
  @Index()
  category: string;

  @Column({ length: 100, nullable: true })
  brand: string;

  @Column({ length: 100, nullable: true })
  manufacturer: string;

  @Column({ length: 100, nullable: true })
  model: string;

  @Column('int', { default: 0 })
  stock: number;

  @Column('int', { default: 0 })
  reservedStock: number;

  @Column('int', { default: 10 })
  lowStockThreshold: number;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  primaryImage: string;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT
  })
  status: ProductStatus;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('boolean', { default: true })
  isVisible: boolean;

  @Column('boolean', { default: false })
  isFeatured: boolean;

  @Column({ length: 50, nullable: true })
  @Index()
  sku: string;

  @Column({ nullable: true })
  @Index()
  barcode: string;

  @Column({ nullable: true })
  supplierId: string;

  @Column({
    type: 'enum',
    enum: ProductCondition,
    default: ProductCondition.NEW
  })
  condition: ProductCondition;

  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  weight: number;

  @Column({ length: 20, nullable: true })
  weightUnit: string;

  @Column({ length: 100, nullable: true })
  dimensions: string;

  @Column({ length: 255, nullable: true })
  metaTitle: string;

  @Column({ length: 500, nullable: true })
  metaDescription: string;

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  discontinuedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed properties
  get availableStock(): number {
    return Math.max(0, this.stock - this.reservedStock);
  }

  get isLowStock(): boolean {
    return this.availableStock <= this.lowStockThreshold;
  }

  get discountPercentage(): number {
    if (!this.compareAtPrice || this.compareAtPrice <= this.price) {
      return 0;
    }
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }

  get profit(): number {
    if (!this.costPrice) {
      return 0;
    }
    return this.price - this.costPrice;
  }

  get profitMargin(): number {
    if (!this.costPrice || this.costPrice === 0) {
      return 0;
    }
    return Math.round((this.profit / this.price) * 100);
  }
}