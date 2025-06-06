import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsNumber,
  IsString,
  IsUUID,
  IsBoolean,
} from "class-validator"
import { Type } from "class-transformer"
import { TransactionType, TransactionPriority } from "../entities/inventory-transaction.entity"

export class CreateTransactionItemDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string

  @IsNotEmpty()
  @IsNumber()
  plannedQuantity: number

  @IsOptional()
  @IsNumber()
  unitCost?: number

  @IsOptional()
  @IsString()
  lotNumber?: string

  @IsOptional()
  @IsString()
  serialNumber?: string

  @IsOptional()
  @IsString()
  expirationDate?: string

  @IsOptional()
  @IsString()
  condition?: string

  @IsOptional()
  @IsString()
  location?: string

  @IsOptional()
  @IsString()
  notes?: string
}

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType

  @IsNotEmpty()
  @IsUUID()
  warehouseId: string

  @IsOptional()
  @IsUUID()
  destinationWarehouseId?: string

  @IsOptional()
  @IsEnum(TransactionPriority)
  priority?: TransactionPriority

  @IsOptional()
  @IsString()
  referenceNumber?: string

  @IsOptional()
  @IsString()
  referenceType?: string

  @IsOptional()
  @IsString()
  supplier?: string

  @IsOptional()
  @IsString()
  customer?: string

  @IsNotEmpty()
  @IsString()
  initiatedBy: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsString()
  reason?: string

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionItemDto)
  items: CreateTransactionItemDto[]

  @IsOptional()
  metadata?: Record<string, any>
}
