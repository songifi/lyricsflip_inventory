import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  Min,
} from 'class-validator';
import { SupplierStatus } from '../entities/supplier.entity';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(150)
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  phone?: string;

  @IsUrl()
  @IsOptional()
  @MaxLength(200)
  website?: string;

  @IsString()
  @IsOptional()
  @MaxLength(250)
  addressLine1?: string;

  @IsString()
  @IsOptional()
  @MaxLength(250)
  addressLine2?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  postalCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  paymentTerms?: string;

  /** ISO 4217 code, e.g. `USD`. */
  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  leadTimeDays?: number;

  /**
   * Defaults to `pending`. A supplier normally becomes orderable through
   * `PATCH /suppliers/:id/status` once onboarding is done.
   */
  @IsEnum(SupplierStatus)
  @IsOptional()
  status?: SupplierStatus;
}
