import { IsNotEmpty, IsOptional, IsString, IsDateString } from "class-validator"

export class UpdateTrackingDto {
  @IsNotEmpty()
  @IsString()
  trackingNumber: string

  @IsNotEmpty()
  @IsString()
  shippingCarrier: string

  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string
}
