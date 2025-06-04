import { IsString, IsNotEmpty, IsEmail, IsUUID, IsOptional, IsDateString, IsArray, ValidateNested, MaxLength, IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePurchaseOrderItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty()
  @IsInt()
@IsInt()
  @Min(1)
  orderedQuantity: number;

  @IsNumber()
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

