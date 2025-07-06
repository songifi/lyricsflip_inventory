import { PartialType, OmitType } from "@nestjs/mapped-types"
import { CreateOrderDto } from "./create-order.dto"

export class UpdateOrderDto extends PartialType(OmitType(CreateOrderDto, ["items", "customerId"] as const)) {}
