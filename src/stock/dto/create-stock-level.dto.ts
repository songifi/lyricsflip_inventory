import { IsNotEmpty, IsNumber, IsUUID, IsString, IsOptional, IsBoolean, Min } from "class-validator"

export class CreateStockLevelDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  currentQuantity: number

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  minimumThreshold: number

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
