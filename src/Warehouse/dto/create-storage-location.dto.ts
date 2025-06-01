import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsInt, IsDecimal, IsBoolean, MaxLength } from 'class-validator';
import { LocationType } from '../entities/storage-location.entity';

export class CreateStorageLocationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEnum(LocationType)
  type: LocationType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  warehouseId: string;

  @IsUUID()
  @IsOptional()
  parentLocationId?: string;

  @IsInt()
  @IsOptional()
  capacity?: number;

  @IsDecimal()
  @IsOptional()
  maxWeight?: number;

  @IsDecimal()
  @IsOptional()
  maxVolume?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

