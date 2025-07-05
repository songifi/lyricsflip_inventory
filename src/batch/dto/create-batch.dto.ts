import { IsString, IsDateString, IsNumber, IsUUID, IsOptional } from 'class-validator';

export class CreateBatchDto {
  @IsUUID()
  productId: string;

  @IsDateString()
  manufacturingDate: string;

  @IsDateString()
  expiryDate: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  status?: string;
}
