import { IsString, IsNotEmpty, IsEmail, IsUUID, IsOptional, IsDateString, IsArray, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseOrderItemDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsInt()
  @Min(1)
  orderedQuantity: number;

  @IsDecimal()
  unitPrice: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreatePurchaseOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  supplier: string;

  @IsEmail()
  @IsOptional()
  supplierEmail?: string;

  @IsUUID()
  warehouseId: string;

  @IsDateString()
  orderDate: string;

  @IsDateString()
  @IsOptional()
  expectedDeliveryDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];
}

