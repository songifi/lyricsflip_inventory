import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, Min, MaxLength, IsNotEmpty } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  brand?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  stock?: number = 0;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => Array.isArray(value) ? value : [])
  tags?: string[] = [];

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean = true;
}