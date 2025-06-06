import { IsNotEmpty, IsOptional, IsEnum, IsString, IsNumber, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { WarehouseType, WarehouseStatus } from "../entities/warehouse.entity"

export class WarehouseAddressDto {
  @IsNotEmpty()
  @IsString()
  street: string

  @IsNotEmpty()
  @IsString()
  city: string

  @IsNotEmpty()
  @IsString()
  state: string

  @IsNotEmpty()
  @IsString()
  zipCode: string

  @IsNotEmpty()
  @IsString()
  country: string
}

export class CreateWarehouseDto {
  @IsNotEmpty()
  @IsString()
  code: string

  @IsNotEmpty()
  @IsString()
  name: string

  @IsOptional()
  @IsEnum(WarehouseType)
  type?: WarehouseType

  @IsOptional()
  @IsEnum(WarehouseStatus)
  status?: WarehouseStatus

  @IsOptional()
  @ValidateNested()
  @Type(() => WarehouseAddressDto)
  address?: WarehouseAddressDto

  @IsOptional()
  @IsString()
  manager?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  email?: string

  @IsOptional()
  @IsNumber()
  capacity?: number

  @IsOptional()
  @IsString()
  description?: string
}
