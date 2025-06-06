import { IsOptional, IsEnum, IsString, IsUUID, IsDateString } from "class-validator"
import { TransactionType, TransactionStatus, TransactionPriority } from "../entities/inventory-transaction.entity"

export class TransactionQueryDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus

  @IsOptional()
  @IsEnum(TransactionPriority)
  priority?: TransactionPriority

  @IsOptional()
  @IsUUID()
  warehouseId?: string

  @IsOptional()
  @IsUUID()
  productId?: string

  @IsOptional()
  @IsString()
  initiatedBy?: string

  @IsOptional()
  @IsString()
  referenceNumber?: string

  @IsOptional()
  @IsDateString()
  createdAfter?: string

  @IsOptional()
  @IsDateString()
  createdBefore?: string
}
