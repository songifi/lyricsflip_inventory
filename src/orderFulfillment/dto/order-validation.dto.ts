// orderFulfillment/dto/order-validation.dto.ts
import { IsString, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class ValidationItemDto {
  @IsString()
  productId: string;

  @IsString()
  quantity: number;
}

export class OrderValidationDto {
  @IsString()
  customerId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidationItemDto)
  items: ValidationItemDto[];
}
