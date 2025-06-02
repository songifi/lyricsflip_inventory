import { IsEnum, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID, ValidateIf, IsDateString, IsBoolean, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateMovementDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ValidateIf(o => o.type === MovementType.STOCK_OUT || o.type === MovementType.TRANSFER)
  @IsString()
  fromLocationId?: string;

  @ValidateIf(o => o.type === MovementType.STOCK_IN || o.type === MovementType.TRANSFER)
  @IsString()
  toLocationId?: string;

  @IsEnum(MovementType)
  type: MovementType;

  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  quantity: number;

  @IsNotEmpty()
  @IsString()
  unit: string;

  @IsOptional()
  @IsPositive()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  unitCost?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(MovementPriority)
  priority?: MovementPriority;

  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  batchNumber?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: Date;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  metadata?: any;
}

export class TransferStockDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsString()
  fromLocationId: string;

  @IsNotEmpty()
  @IsString()
  toLocationId: string;

  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  quantity: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(MovementPriority)
  priority?: MovementPriority;

  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;

  @IsOptional()
  @IsString()
  batchNumber?: string;
}

export class BulkMovementDto {
  @IsArray()
  @Type(() => CreateMovementDto)
  movements: CreateMovementDto[];

  @IsOptional()
  @IsString()
  groupReference?: string;

  @IsOptional()
  @IsBoolean()
  atomicOperation?: boolean; // All succeed or all fail
}

export class ReserveStockDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsString()
  locationId: string;

  @IsPositive()
  @Transform(({ value }) => parseFloat(value))
  quantity: number;

  @IsNotEmpty()
  @IsString()
  referenceType: string;

  @IsNotEmpty()
  @IsString()
  referenceId: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @Transform(({ value }) => new Date(value))
  expiresAt?: Date;
}

export class UpdateStockLevelsDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsString()
  locationId: string;

  @IsOptional()
  @IsPositive()
  minStockLevel?: number;

  @IsOptional()
  @IsPositive()
  maxStockLevel?: number;

  @IsOptional()
  @IsPositive()
  reorderPoint?: number;
}
