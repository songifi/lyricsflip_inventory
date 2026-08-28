import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSupplierReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  overall: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  quality?: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  delivery?: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  pricing?: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  communication?: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comment?: string;

  @IsUUID()
  @IsOptional()
  purchaseOrderId?: string;
}
