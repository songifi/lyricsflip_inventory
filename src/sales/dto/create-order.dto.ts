import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  Min,
  MaxLength,
  IsUUID,
} from "class-validator"
import { Type } from "class-transformer"
import { OrderStatus, PaymentStatus } from "../entities/sales-order.entity"

export class CreateOrderItemDto {
  @IsUUID()
  productId: string

  @IsString()
  @MaxLength(255)
  productName: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  productSku?: string

  @IsNumber()
  @Min(1)
  quantity: number

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  unitPrice: number

  @IsOptional()
  productVariant?: Record<string, any>
}

export class CreateOrderDto {
  @IsUUID()
  customerId: string

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string

  // Shipping Address
  @IsString()
  @MaxLength(255)
  shippingName: string

  @IsString()
  @MaxLength(255)
  shippingAddress1: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  shippingAddress2?: string

  @IsString()
  @MaxLength(100)
  shippingCity: string

  @IsString()
  @MaxLength(100)
  shippingState: string

  @IsString()
  @MaxLength(20)
  shippingZipCode: string

  @IsString()
  @MaxLength(100)
  shippingCountry: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  shippingPhone?: string

  // Billing Address
  @IsString()
  @MaxLength(255)
  billingName: string

  @IsString()
  @MaxLength(255)
  billingAddress1: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  billingAddress2?: string

  @IsString()
  @MaxLength(100)
  billingCity: string

  @IsString()
  @MaxLength(100)
  billingState: string

  @IsString()
  @MaxLength(20)
  billingZipCode: string

  @IsString()
  @MaxLength(100)
  billingCountry: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  billingPhone?: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  shippingMethod?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[]

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  taxAmount?: number

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  shippingCost?: number

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountAmount?: number
}
