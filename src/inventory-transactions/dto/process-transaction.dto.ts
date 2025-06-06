import { IsArray, ValidateNested, IsNumber, IsUUID, IsOptional, IsString } from "class-validator"
import { Type } from "class-transformer"

export class ProcessTransactionItemDto {
  @IsUUID()
  itemId: string

  @IsNumber()
  actualQuantity: number

  @IsOptional()
  @IsString()
  notes?: string
}

export class ProcessTransactionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessTransactionItemDto)
  items: ProcessTransactionItemDto[]

  @IsOptional()
  @IsString()
  processedBy?: string

  @IsOptional()
  @IsString()
  notes?: string
}
