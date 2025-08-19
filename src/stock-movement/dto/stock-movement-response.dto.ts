import { Expose } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MovementType, MovementStatus } from "../stock-movement.entity";

export class StockMovementResponseDto {
  @ApiProperty({
    description: "Movement ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: "Item ID",
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @Expose()
  itemId: string;

  @ApiPropertyOptional({
    description: "Warehouse ID",
    example: "123e4567-e89b-12d3-a456-426614174002",
  })
  @Expose()
  warehouseId?: string;

  @ApiPropertyOptional({
    description: "Source warehouse ID for transfers",
    example: "123e4567-e89b-12d3-a456-426614174003",
  })
  @Expose()
  fromWarehouseId?: string;

  @ApiPropertyOptional({
    description: "Destination warehouse ID for transfers",
    example: "123e4567-e89b-12d3-a456-426614174004",
  })
  @Expose()
  toWarehouseId?: string;

  @ApiProperty({
    description: "Movement type",
    enum: MovementType,
    example: MovementType.IN,
  })
  @Expose()
  movementType: MovementType;

  @ApiProperty({
    description: "Quantity moved",
    example: 100,
  })
  @Expose()
  quantity: number;

  @ApiPropertyOptional({
    description: "Unit cost in cents",
    example: 2500,
  })
  @Expose()
  unitCost?: number;

  @ApiPropertyOptional({
    description: "Total cost in cents",
    example: 250000,
  })
  @Expose()
  totalCost?: number;

  @ApiPropertyOptional({
    description: "Reason for movement",
    example: "Restocking from supplier",
  })
  @Expose()
  reason?: string;

  @ApiPropertyOptional({
    description: "Reference number",
    example: "PO-2024-001",
  })
  @Expose()
  referenceNumber?: string;

  @ApiPropertyOptional({
    description: "Batch number",
    example: "BATCH-2024-001",
  })
  @Expose()
  batchNumber?: string;

  @ApiPropertyOptional({
    description: "Expiry date",
    example: "2024-12-31",
  })
  @Expose()
  expiryDate?: Date;

  @ApiProperty({
    description: "Movement status",
    enum: MovementStatus,
    example: MovementStatus.COMPLETED,
  })
  @Expose()
  status: MovementStatus;

  @ApiPropertyOptional({
    description: "ID of user who performed the movement",
    example: "123e4567-e89b-12d3-a456-426614174005",
  })
  @Expose()
  performedBy?: string;

  @ApiPropertyOptional({
    description: "ID of user who approved the movement",
    example: "123e4567-e89b-12d3-a456-426614174006",
  })
  @Expose()
  approvedBy?: string;

  @ApiPropertyOptional({
    description: "Approval timestamp",
    example: "2024-01-15T10:30:00Z",
  })
  @Expose()
  approvedAt?: Date;

  @ApiPropertyOptional({
    description: "Additional metadata",
    example: { supplier: "ABC Corp", notes: "Urgent delivery" },
  })
  @Expose()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2024-01-15T09:00:00Z",
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2024-01-15T10:30:00Z",
  })
  @Expose()
  updatedAt: Date;
}