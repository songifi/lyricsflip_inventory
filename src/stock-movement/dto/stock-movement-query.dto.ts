import { Type } from "class-transformer";
import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsString,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsArray,
  ArrayMaxSize,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { MovementType, MovementStatus } from "../stock-movement.entity";

export class StockMovementQueryDto {
  @ApiPropertyOptional({
    description: "Page number",
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page",
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({
    description: "Filter by item ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  itemId?: string;

  @ApiPropertyOptional({
    description: "Filter by warehouse ID",
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({
    description: "Filter by movement type",
    enum: MovementType,
    example: MovementType.IN,
  })
  @IsOptional()
  @IsEnum(MovementType)
  movementType?: MovementType;

  @ApiPropertyOptional({
    description: "Filter by movement status",
    enum: MovementStatus,
    example: MovementStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(MovementStatus)
  status?: MovementStatus;

  @ApiPropertyOptional({
    description: "Filter by user who performed the movement",
    example: "123e4567-e89b-12d3-a456-426614174003",
  })
  @IsOptional()
  @IsUUID()
  performedBy?: string;

  @ApiPropertyOptional({
    description: "Filter by reference number",
    example: "PO-2024-001",
  })
  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @ApiPropertyOptional({
    description: "Filter by batch number",
    example: "BATCH-2024-001",
  })
  @IsOptional()
  @IsString()
  batchNumber?: string;

  @ApiPropertyOptional({
    description: "Filter movements from this date",
    example: "2024-01-01",
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: "Filter movements until this date",
    example: "2024-12-31",
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: "Fields to sort by",
    example: ["createdAt", "quantity"],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsString({ each: true })
  sortBy?: string[] = ["createdAt"];

  @ApiPropertyOptional({
    description: "Sort order",
    enum: ["asc", "desc"],
    example: "desc",
  })
  @IsOptional()
  @IsEnum(["asc", "desc"])
  sortOrder: "asc" | "desc" = "desc";
}