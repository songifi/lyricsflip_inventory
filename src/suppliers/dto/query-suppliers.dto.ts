import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { SupplierStatus } from '../entities/supplier.entity';

export class QuerySuppliersDto {
  /** Case-insensitive match against name and code. */
  @IsString()
  @IsOptional()
  @MaxLength(150)
  search?: string;

  @IsEnum(SupplierStatus)
  @IsOptional()
  status?: SupplierStatus;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
