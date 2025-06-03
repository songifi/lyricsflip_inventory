import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseOrderDto } from './create-purchase-order.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PurchaseOrderStatus } from '../entities/purchase-order.entity';

export class UpdatePurchaseOrderDto extends PartialType(CreatePurchaseOrderDto) {
  @ApiPropertyOptional({ 
    description: 'Order status',
    enum: PurchaseOrderStatus 
  })
  @IsOptional()
  @IsEnum(PurchaseOrderStatus)
  status?: PurchaseOrderStatus;
} 