import { IsOptional, IsEnum, IsString, IsUUID, IsDateString } from "class-validator"
import { OrderStatus, OrderPriority } from "../entities/order.entity"

export class OrderQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus

  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority

  @IsOptional()
  @IsUUID()
  customerId?: string

  @IsOptional()
  @IsString()
  assignedTo?: string

  @IsOptional()
  @IsDateString()
  createdAfter?: string

  @IsOptional()
  @IsDateString()
  createdBefore?: string

  @IsOptional()
  @IsString()
  orderNumber?: string
}
