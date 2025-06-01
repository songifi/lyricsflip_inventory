// src/inventory/inventory.dto.ts
import { IsString, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MoveStockDto {
  @ApiProperty() @IsString() sku: string;
  @ApiProperty() @IsString() fromLocation: string;
  @ApiProperty() @IsString() toLocation: string;
  @ApiProperty() @IsInt() @Min(1) quantity: number;
}

export class TransferStockDto {
  @ApiProperty({ type: [MoveStockDto] })
  @ValidateNested({ each: true })
  @Type(() => MoveStockDto)
  movements: MoveStockDto[];
}

export class AdjustStockDto {
  @ApiProperty() @IsString() sku: string;
  @ApiProperty() @IsString() locationId: string;
  @ApiProperty() @IsInt() quantityChange: number;
  @ApiProperty() @IsString() reason: string;
}