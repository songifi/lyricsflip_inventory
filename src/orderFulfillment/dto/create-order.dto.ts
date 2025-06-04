// orderFulfillment/dto/create-order.dto.ts
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
} from "class-validator";
import { Type } from "class-transformer";

class OrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
}

class ShippingAddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;

  @IsString()
  country: string;
}

export class CreateOrderDto {
  @IsString()
  customerId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  totalAmount: number;

  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;
}
