import { PartialType, OmitType, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsDateString } from "class-validator";
import { CreateStockMovementDto } from "./create-stock-movement.dto";

export class UpdateStockMovementDto extends PartialType(
  OmitType(CreateStockMovementDto, ["itemId", "movementType"] as const)
) {
  @ApiPropertyOptional({
    description: "Expiry date for perishable items",
    example: "2024-12-31",
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}