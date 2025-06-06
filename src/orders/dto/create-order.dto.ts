import { IsNotEmpty, IsOptional, IsArray, ValidateNested, IsEnum, IsNumber, IsString, IsUUID } from "class-validator"
import { Type } from "class-transformer"
import { OrderPriority } from "../entities/order.entity"

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string

  @IsNotEmpty()
  @IsNumber()
  quantity: number

  @IsNotEmpty()
  @IsNumber()
  unitPrice: number
}

export class AddressDto {
  @IsNotEmpty()
  @IsString()
  street: string

  @IsNotEmpty()
  @IsString()
  city: string

  @IsNotEmpty()
  @IsString()
  state: string

  @IsNotEmpty()
  @IsString()
  zipCode: string

  @IsNotEmpty()
  @IsString()
  country: string
}

export class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  customerId?: string

  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[]

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress?: AddressDto

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress?: AddressDto

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsString()
  assignedTo?: string
}
