import { IsString, IsNotEmpty, IsOptional, IsUUID, IsInt, IsDecimal, IsDateString, Min, MaxLength } from 'class-validator';

export class CreateInventoryItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sku: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  productName: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  reservedQuantity?: number = 0;

  @IsDecimal()
  @IsOptional()
  unitPrice?: number;

  @IsUUID()
  warehouseId: string;

  @IsUUID()
  @IsOptional()
  storageLocationId?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  batchNumber?: string;
}

