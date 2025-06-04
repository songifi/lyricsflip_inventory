import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsDateString, IsNotEmpty, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority } from '../entities/purchase-order.entity';

export class CreatePurchaseOrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Quantity to order', minimum: 1 })
  @IsNotEmpty()
  quantityOrdered: number;

  @ApiProperty({ description: 'Unit price', minimum: 0 })
  @IsNotEmpty()
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Notes for this item' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Expected delivery date' })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ description: 'Supplier ID' })
  @IsNotEmpty()
  @IsUUID()
  supplierId: string;

  @ApiPropertyOptional({ 
    description: 'Priority level',
    enum: Priority,
    default: Priority.MEDIUM 
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiProperty({ 
    description: 'Purchase order items',
    type: [CreatePurchaseOrderItemDto] 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];

  @ApiPropertyOptional({ description: 'Tax rate percentage' })
  @IsOptional()
  taxRate?: number;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Person requesting the order' })
  @IsNotEmpty()
  @IsString()
  requestedBy: string;

  @ApiPropertyOptional({ description: 'Expected delivery date' })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({ description: 'Delivery address' })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;
} 