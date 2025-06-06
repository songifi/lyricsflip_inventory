import { IsNotEmpty, IsOptional, IsEnum, IsString } from "class-validator"
import { TransactionStatus } from "../entities/inventory-transaction.entity"

export class UpdateTransactionStatusDto {
  @IsNotEmpty()
  @IsEnum(TransactionStatus)
  status: TransactionStatus

  @IsOptional()
  @IsString()
  performedBy?: string

  @IsOptional()
  @IsString()
  reason?: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  metadata?: Record<string, any>
}
