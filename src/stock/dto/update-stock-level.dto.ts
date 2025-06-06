import { IsOptional, IsNumber, IsString, IsBoolean, Min } from "class-validator"

export class UpdateStockLevelDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentQuantity?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumThreshold?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumThreshold?: number

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsBoolean()
  alertEnabled?: boolean

  @IsOptional()
  @IsNumber()
  @Min(1)
  reorderQuantity?: number
}
