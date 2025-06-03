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

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  brand?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  model?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  compareAtPrice?: number;

  @IsOptional()
  @IsString()
  @Length(3, 10)
  @Matches(/^[A-Z]{3}$/, { message: "Currency must be a 3-letter ISO code" })
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reservedQuantity?: number;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  sku?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  barcode?: string;

  @IsOptional()
  @IsEnum(ProductSize)
  size?: ProductSize;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  weight?: number;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  dimensions?: string;

  @IsOptional()
  @IsEnum(AbsorbencyLevel)
  absorbencyLevel?: AbsorbencyLevel;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  packSize?: number;

  @IsOptional()
  @IsEnum(AgeGroup)
  ageGroup?: AgeGroup;

  @IsOptional()
  @IsBoolean()
  isOrganic?: boolean;

  @IsOptional()
  @IsBoolean()
  isHypoallergenic?: boolean;

  @IsOptional()
  @IsBoolean()
  isScented?: boolean;

  @IsOptional()
  @IsBoolean()
  hasWings?: boolean;

  @IsOptional()
  @IsBoolean()
  isNighttime?: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  material?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsUrl()
  @Length(1, 500)
  primaryImageUrl?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  metaDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  shippingWeight?: number;

  @IsOptional()
  @IsBoolean()
  requiresSpecialShipping?: boolean;

  @IsOptional()
  @IsDateString()
  discontinuedAt?: string;
}
