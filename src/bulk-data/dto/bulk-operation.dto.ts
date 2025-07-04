import { IsString, IsOptional, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkUpdateDto {
  @IsString()
  id: string;

  @IsOptional()
  data: Record<string, any>;
}

export class BulkOperationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateDto)
  items: BulkUpdateDto[];

  @IsOptional()
  @IsBoolean()
  skipValidation?: boolean;
}

export class ImportOptionsDto {
  @IsOptional()
  @IsBoolean()
  skipValidation?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredFields?: string[];

  @IsOptional()
  @IsString()
  entityType?: string;
}
