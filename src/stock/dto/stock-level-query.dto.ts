import { IsOptional, IsString, IsEnum, IsUUID } from "class-validator"

export enum StockStatus {
  AVAILABLE = "available",
  LOW = "low",
  OUT_OF_STOCK = "out_of_stock",
  OVERSTOCKED = "overstocked",
}

export class StockLevelQueryDto {
  @IsOptional()
  @IsUUID()
  productId?: string

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsEnum(StockStatus)
  status?: StockStatus
}
