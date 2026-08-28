import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SupplierStatus } from '../entities/supplier.entity';

export class UpdateSupplierStatusDto {
  @IsEnum(SupplierStatus)
  status: SupplierStatus;

  /** Recorded on the communication log, so a suspension has a stated cause. */
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}
