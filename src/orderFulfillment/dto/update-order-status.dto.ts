// orderFulfillment/dto/update-order-status.dto.ts
import { IsEnum } from "class-validator";
import { OrderStatus } from "../enums/order-status.enum";

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
