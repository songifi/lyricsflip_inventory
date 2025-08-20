
// src/purchase-orders/dto/create-purchase-order.dto.ts
import { IsString, IsOptional, IsArray, ValidateNested, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../entities/purchase-order.entity';

export class CreatePurchaseOrderItemDto {
  @IsString()
  productId: string;

  @IsString()
  productName: string;

  @IsString()
  productSku: string;

  @IsString()
  quantity: string;

  @IsString()
  unitPrice: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreatePurchaseOrderDto {
  @IsString()
  supplierId: string;

  @IsString()
  supplierName: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  taxAmount?: string;

  @IsOptional()
  @IsString()
  shippingAmount?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];
}