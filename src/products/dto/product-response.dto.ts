import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsUrl,
  IsPositive,
  Min,
  Max,
  Length,
  IsUUID,
  ValidateNested,
  IsDateString,
  Matches,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import {
  ProductType,
  ProductSize,
  AbsorbencyLevel,
  AgeGroup,
} from "../entities/product.entity";

export class ProductResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ProductType)
  type: ProductType;

  @IsString()
  brand: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  compareAtPrice?: number;

  @IsString()
  currency: string;

  @IsNumber()
  stockQuantity: number;

  @IsNumber()
  reservedQuantity: number;

  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsEnum(ProductSize)
  size?: ProductSize;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsOptional()
  @IsEnum(AbsorbencyLevel)
  absorbencyLevel?: AbsorbencyLevel;

  @IsOptional()
  @IsNumber()
  packSize?: number;

  @IsOptional()
  @IsEnum(AgeGroup)
  ageGroup?: AgeGroup;

  @IsBoolean()
  isOrganic: boolean;

  @IsBoolean()
  isHypoallergenic: boolean;

  @IsBoolean()
  isScented: boolean;

  @IsBoolean()
  hasWings: boolean;

  @IsBoolean()
  isNighttime: boolean;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsArray()
  imageUrls?: string[];

  @IsOptional()
  @IsString()
  primaryImageUrl?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsBoolean()
  isActive: boolean;

  @IsBoolean()
  isVisible: boolean;

  @IsBoolean()
  isFeatured: boolean;

  @IsNumber()
  lowStockThreshold: number;

  @IsBoolean()
  trackInventory: boolean;

  @IsOptional()
  @IsNumber()
  shippingWeight?: number;

  @IsBoolean()
  requiresSpecialShipping: boolean;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;

  @IsOptional()
  @IsDateString()
  discontinuedAt?: Date;

  // Computed properties
  @IsBoolean()
  isInStock: boolean;

  @IsNumber()
  availableQuantity: number;

  @IsBoolean()
  isLowStock: boolean;

  @IsNumber()
  discountPercentage: number;
}

export class StockUpdateDto {
  @IsNumber()
  @Min(0)
  stockQuantity: number;
}

export class StockReservationDto {
  @IsNumber()
  @Min(1)
  quantity: number;
}
