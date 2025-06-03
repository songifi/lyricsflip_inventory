import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  Length,
  IsUrl,
} from "class-validator";
import { Transform } from "class-transformer";

export class CreateSupplierDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  contactPerson?: string;

  @IsEmail()
  @Length(1, 255)
  email: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  address?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  country?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  postalCode?: string;

  @IsOptional()
  @IsUrl()
  @Length(1, 100)
  website?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true" || value === true || value === 1)
  isActive?: boolean = true;
}
