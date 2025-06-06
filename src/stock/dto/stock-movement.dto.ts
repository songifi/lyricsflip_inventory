import { IsNotEmpty, IsNumber, IsUUID, IsString, IsOptional, IsEnum } from "class-validator"

export enum StockMovementType {
  ADDITION = "addition",
  REDUCTION = "reduction",
  ADJUSTMENT = "adjustment",
  INVENTORY_COUNT = "inventory_count",
}

export class StockMovementDto {
  @IsNotEmpty()
  @IsUUID()
  stockLevelId: string

  @IsNotEmpty()
  @IsNumber()
  quantity: number

  @IsNotEmpty()
  @IsEnum(StockMovementType)
  type: StockMovementType

  @IsOptional()
  @IsString()
  reference?: string

  @IsOptional()
  @IsString()
  performedBy?: string

  @IsOptional()
  @IsString()
  notes?: string
}
