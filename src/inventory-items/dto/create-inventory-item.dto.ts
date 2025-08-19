import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsString,
  MaxLength,
  Min,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { InventoryItemStatus } from '../entities/inventory-item.entity';

export class CreateInventoryItemDto {
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @IsOptional()
  @MaxLength(50)
  barcode?: string;

  @IsNotEmpty()
  @MaxLength(100)
  category: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(InventoryItemStatus)
  status?: InventoryItemStatus;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  currentStock: number;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  minStockLevel: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  maxStockLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  unitCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  unitPrice?: number;

  @IsOptional()
  @MaxLength(20)
  unit?: string;

  @IsOptional()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @MaxLength(50)
  supplier?: string;
}