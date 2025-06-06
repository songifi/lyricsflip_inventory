import { IsNotEmpty, IsOptional, IsEnum, IsString } from "class-validator"
import { OrderStatus } from "../entities/order.entity"

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status: OrderStatus

  @IsOptional()
  @IsString()
  reason?: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsString()
  changedBy?: string

  @IsOptional()
  metadata?: Record<string, any>
}
