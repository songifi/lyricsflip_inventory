import { 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsBoolean, 
  IsArray, 
  Min, 
  MaxLength, 
  IsNotEmpty, 
  IsEnum, 
  IsUrl, 
  IsUUID,
  ValidateIf,
  Matches,
  IsDateString,
  IsPositive
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProductStatus, ProductCondition } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  costPrice?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  compareAtPrice?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  brand?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  manufacturer?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  model?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  stock?: number = 0;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  reservedStock?: number = 0;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  lowStockThreshold?: number = 10;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : value ? [value] : [])
  tags?: string[] = [];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : value ? [value] : [])
  images?: string[] = [];

  @IsString()
  @IsOptional()
  primaryImage?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus = ProductStatus.DRAFT;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean = true;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isVisible?: boolean = true;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured?: boolean = false;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  @Matches(/^[A-Za-z0-9-_]+$/, { message: 'SKU can only contain alphanumeric characters, hyphens, and underscores' })
  sku?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsUUID()
  @IsOptional()
  supplierId?: string;

  @IsEnum(ProductCondition)
  @IsOptional()
  condition?: ProductCondition = ProductCondition.NEW;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  weight?: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  weightUnit?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  dimensions?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaTitle?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  metaDescription?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @IsDateString()
  @IsOptional()
  publishedAt?: Date;
}