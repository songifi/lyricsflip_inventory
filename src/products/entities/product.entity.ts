import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

export enum ProductType {
  COTTON_WOOL = "cotton_wool",
  SANITARY_PAD = "sanitary_pad",
  DIAPER = "diaper",
}

export enum ProductSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  EXTRA_LARGE = "extra_large",
}

export enum AbsorbencyLevel {
  LIGHT = "light",
  REGULAR = "regular",
  SUPER = "super",
  OVERNIGHT = "overnight",
  ULTRA = "ultra",
}

export enum AgeGroup {
  NEWBORN = "newborn",
  INFANT = "infant",
  TODDLER = "toddler",
  ADULT = "adult",
}

@Entity("products")
@Index(["type", "isActive"])
@Index(["brand", "type"])
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: ProductType,
  })
  type: ProductType;

  @Column({ length: 100 })
  brand: string;

  @Column({ length: 50, nullable: true })
  model: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price: number;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  compareAtPrice: number;

  @Column({ length: 10 })
  currency: string;

  @Column("int")
  stockQuantity: number;

  @Column("int", { default: 0 })
  reservedQuantity: number;

  @Column({ length: 50, unique: true })
  sku: string;

  @Column({ length: 20, nullable: true })
  barcode: string;

  // Size-related fields
  @Column({
    type: "enum",
    enum: ProductSize,
    nullable: true,
  })
  size: ProductSize;

  @Column("decimal", { precision: 8, scale: 2, nullable: true })
  weight: number; // in grams

  @Column({ length: 20, nullable: true })
  dimensions: string; // e.g., "10x5x2 cm"

  // Product-specific fields
  @Column({
    type: "enum",
    enum: AbsorbencyLevel,
    nullable: true,
  })
  absorbencyLevel: AbsorbencyLevel;

  @Column("int", { nullable: true })
  packSize: number; // number of items per pack

  @Column({
    type: "enum",
    enum: AgeGroup,
    nullable: true,
  })
  ageGroup: AgeGroup;

  @Column("boolean", { default: false })
  isOrganic: boolean;

  @Column("boolean", { default: false })
  isHypoallergenic: boolean;

  @Column("boolean", { default: false })
  isScented: boolean;

  @Column("boolean", { default: false })
  hasWings: boolean; // for sanitary pads

  @Column("boolean", { default: false })
  isNighttime: boolean;

  @Column({ length: 50, nullable: true })
  material: string; // cotton, bamboo, synthetic, etc.

  // Images and media
  @Column("simple-array", { nullable: true })
  imageUrls: string[];

  @Column({ length: 500, nullable: true })
  primaryImageUrl: string;

  // SEO and marketing
  @Column({ length: 255, nullable: true })
  metaTitle: string;

  @Column({ length: 500, nullable: true })
  metaDescription: string;

  @Column("simple-array", { nullable: true })
  tags: string[];

  // Status and visibility
  @Column("boolean", { default: true })
  isActive: boolean;

  @Column("boolean", { default: true })
  isVisible: boolean;

  @Column("boolean", { default: false })
  isFeatured: boolean;

  // Inventory tracking
  @Column("int", { default: 10 })
  lowStockThreshold: number;

  @Column("boolean", { default: true })
  trackInventory: boolean;

  // Shipping info
  @Column("decimal", { precision: 8, scale: 2, nullable: true })
  shippingWeight: number;

  @Column("boolean", { default: false })
  requiresSpecialShipping: boolean;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  discontinuedAt: Date;

  // Computed properties
  get isInStock(): boolean {
    return this.stockQuantity > this.reservedQuantity;
  }

  get availableQuantity(): number {
    return Math.max(0, this.stockQuantity - this.reservedQuantity);
  }

  get isLowStock(): boolean {
    return this.availableQuantity <= this.lowStockThreshold;
  }

  get discountPercentage(): number {
    if (!this.compareAtPrice || this.compareAtPrice <= this.price) {
      return 0;
    }
    return Math.round(
      ((this.compareAtPrice - this.price) / this.compareAtPrice) * 100
    );
  }
}
