import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsUUID,
  IsString,
  IsDateString,
  Min,
  MaxLength,
  IsObject,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MovementType } from "../stock-movement.entity";

export class CreateStockMovementDto {
  @ApiProperty({
    description: "ID of the item being moved",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsNotEmpty()
  @IsUUID()
  itemId: string;

  @ApiPropertyOptional({
    description: "ID of the warehouse for IN/OUT movements",
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({
    description: "Source warehouse ID for TRANSFER movements",
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @IsOptional()
  @IsUUID()
  fromWarehouseId?: string;

  @ApiPropertyOptional({
    description: "Destination warehouse ID for TRANSFER movements",
    example: "123e4567-e89b-12d3-a456-426614174002",
  })
  @IsOptional()
  @IsUUID()
  toWarehouseId?: string;

  @ApiProperty({
    description: "Type of stock movement",
    enum: MovementType,
    example: MovementType.IN,
  })
  @IsNotEmpty()
  @IsEnum(MovementType)
  movementType: MovementType;

  @ApiProperty({
    description: "Quantity of items being moved",
    example: 100,
    minimum: 1,
  })
  @IsNotEmpty()
  @IsPositive()
  quantity: number;

  @ApiPropertyOptional({
    description: "Unit cost in cents",
    example: 2500,
    minimum: 0,
  })
  @IsOptional()
  @Min(0)
  unitCost?: number;

  @ApiPropertyOptional({
    description: "Total cost in cents",
    example: 250000,
    minimum: 0,
  })
  @IsOptional()
  @Min(0)
  totalCost?: number;

  @ApiPropertyOptional({
    description: "Reason for the movement",
    example: "Restocking from supplier",
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({
    description: "Reference number (PO, invoice, etc.)",
    example: "PO-2024-001",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceNumber?: string;

  @ApiPropertyOptional({
    description: "Batch number for tracking",
    example: "BATCH-2024-001",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  batchNumber?: string;

  @ApiPropertyOptional({
    description: "Expiry date for perishable items",
    example: "2024-12-31",
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({
    description: "ID of user performing the movement",
    example: "123e4567-e89b-12d3-a456-426614174003",
  })
  @IsOptional()
  @IsUUID()
  performedBy?: string;

  @ApiPropertyOptional({
    description: "Additional metadata for the movement",
    example: { supplier: "ABC Corp", notes: "Urgent delivery" },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}