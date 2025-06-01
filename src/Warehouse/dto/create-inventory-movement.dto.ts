import { IsString, IsNotEmpty, IsUUID, IsEnum, IsInt, IsOptional, IsDecimal, IsDateString, Min, MaxLength } from 'class-validator';
import { MovementType } from '../entities/inventory-movement.entity';

export class CreateInventoryMovementDto {
  @IsEnum(MovementType)
  type: MovementType;

  @IsUUID()
  inventoryItemId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsUUID()
  @IsOptional()
  fromLocationId?: string;

  @IsUUID()
  @IsOptional()
  toLocationId?: string;

  @IsUUID()
  warehouseId: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  referenceNumber?: string;

  @IsDecimal()
  @IsOptional()
  unitCost?: number;

  @IsDateString()
  @IsOptional()
  scheduledDate?: string;
}

