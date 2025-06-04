import { IsNotEmpty, IsString, IsArray, IsObject, IsOptional, IsBoolean } from 'class-validator';

export class CreateCustomReportDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  fields: string[];

  @IsObject()
  filters: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupBy?: string[];

  @IsOptional()
  @IsObject()
  orderBy?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsNotEmpty()
  @IsString()
  userId: string;
}