
// src/purchase-orders/dto/update-purchase-order.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseOrderDto } from './create-purchase-order.dto';

export class UpdatePurchaseOrderDto extends PartialType(CreatePurchaseOrderDto) {}