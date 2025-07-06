import { IsString, IsOptional, IsEnum, MaxLength } from "class-validator"
import { OrderStatus } from "../entities/sales-order.entity"

export class FulfillOrderDto {
  @IsEnum(OrderStatus)
  status: OrderStatus

  @IsOptional()
  @IsString()
  @MaxLength(100)
  trackingNumber?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  shippingMethod?: string

  @IsOptional()
  @IsString()
  notes?: string
}

export class ShipOrderDto {
  @IsString()
  @MaxLength(100)
  trackingNumber: string

  @IsString()
  @MaxLength(100)
  shippingMethod: string

  @IsOptional()
  @IsString()
  notes?: string
}
