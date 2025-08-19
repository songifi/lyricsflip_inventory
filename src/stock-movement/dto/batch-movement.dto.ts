import { Type } from "class-transformer";
import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CreateStockMovementDto } from "./create-stock-movement.dto";

export class BatchStockMovementDto {
  @ApiProperty({
    description: "Array of stock movements to create",
    type: [CreateStockMovementDto],
    minItems: 1,
    maxItems: 50,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreateStockMovementDto)
  movements: CreateStockMovementDto[];

  @ApiPropertyOptional({
    description: "Batch reference number",
    example: "BATCH-2024-001",
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  batchReference?: string;

  @ApiPropertyOptional({
    description: "Notes for the entire batch",
    example: "End of month stock adjustment",
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}