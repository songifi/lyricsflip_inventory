import { IsString, IsOptional, IsEnum, MaxLength } from "class-validator"
import { TrackingEventType } from "../entities/order-tracking.entity"

export class CreateTrackingEventDto {
  @IsEnum(TrackingEventType)
  eventType: TrackingEventType

  @IsString()
  @MaxLength(255)
  description: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string

  @IsOptional()
  metadata?: Record<string, any>
}
