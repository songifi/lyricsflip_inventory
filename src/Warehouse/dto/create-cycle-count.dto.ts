import { IsUUID, IsOptional, IsDateString, IsString } from 'class-validator';

export class CreateCycleCountDto {
  @IsUUID()
  warehouseId: string;

  @IsUUID()
  @IsOptional()
  locationId?: string;

  @IsUUID()
  @IsOptional()
  assignedUserId?: string;

  @IsDateString()
  scheduledDate: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

