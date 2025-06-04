import { 
  IsArray, 
  ValidateNested, 
  IsUUID, 
  ArrayMinSize, 
  IsNumber, 
  IsOptional, 
  IsBoolean, 
  IsEnum, 
  IsString,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductDto } from './create-product.dto';
import { ProductStatus, ProductCondition } from '../entities/product.entity';

export class BulkCreateProductDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductDto)
  @ArrayMinSize(1)
  products: CreateProductDto[];
}

export class BulkDeleteProductDto {
  @IsArray()
  @IsUUID(4, { each: true })
  @ArrayMinSize(1)
  ids: string[];
}

export class BulkUpdateStockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockUpdateItem)
  @ArrayMinSize(1)
  items: StockUpdateItem[];
}

class StockUpdateItem {
  @IsUUID(4)
  id: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  reservedStock?: number;
}

export class BulkUpdateStatusDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatusUpdateItem)
  @ArrayMinSize(1)
  items: StatusUpdateItem[];
}

class StatusUpdateItem {
  @IsUUID(4)
  id: string;

  @IsEnum(ProductStatus)
  status: ProductStatus;
}

export class BulkUpdatePriceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceUpdateItem)
  @ArrayMinSize(1)
  items: PriceUpdateItem[];
}

class PriceUpdateItem {
  @IsUUID(4)
  id: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  compareAtPrice?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  costPrice?: number;
}

export class BulkUpdateVisibilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VisibilityUpdateItem)
  @ArrayMinSize(1)
  items: VisibilityUpdateItem[];
}

class VisibilityUpdateItem {
  @IsUUID(4)
  id: string;

  @IsBoolean()
  isVisible: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

export class BulkUpdateCategoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryUpdateItem)
  @ArrayMinSize(1)
  items: CategoryUpdateItem[];
}

class CategoryUpdateItem {
  @IsUUID(4)
  id: string;

  @IsString()
  category: string;
}

export class BulkImportProductsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductDto)
  @ArrayMinSize(1)
  products: CreateProductDto[];

  @IsBoolean()
  @IsOptional()
  skipDuplicates?: boolean = true;

  @IsString()
  @IsOptional()
  duplicateCheckField?: 'sku' | 'barcode' | 'name' = 'sku';
}
