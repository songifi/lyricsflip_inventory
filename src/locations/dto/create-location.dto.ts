import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { LocationType } from '../entities/location.entity';

export class CreateLocationDto {
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @MaxLength(60)
  code?: string;

  @IsEnum(LocationType)
  type: LocationType;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @Min(0)
  capacityUnits?: number;

  @IsOptional()
  description?: string;
}
