// src/purchase-orders/dto/add-purchase-order-item.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class AddPurchaseOrderItemDto {
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