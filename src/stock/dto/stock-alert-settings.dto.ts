import { IsBoolean, IsNumber, IsOptional, IsUUID, Min } from "class-validator"

export class StockAlertSettingsDto {
  @IsUUID()
  stockLevelId: string

  @IsBoolean()
  alertEnabled: boolean

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumThreshold?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumThreshold?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  reorderQuantity?: number
}
