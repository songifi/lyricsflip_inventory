import { IsOptional, IsString, IsEnum, IsDateString } from "class-validator"
import { Type } from "class-transformer"
import { OrderStatus, PaymentStatus } from "../entities/sales-order.entity"

export class OrderQueryDto {
  @IsOptional()
  @IsString()
  customerId?: string

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus

  @IsOptional()
  @IsString()
  orderNumber?: string

  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  @IsOptional()
  @Type(() => Number)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10

  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt"

  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC" = "DESC"
}
