import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  Min,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class SupplierQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true || value === 1)
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = "name";

  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC" = "ASC";
}
