import { IsEnum, IsOptional, IsUUID, MaxLength, Min } from 'class-validator';
import { LocationType } from '../entities/location.entity';

export class UpdateLocationDto {
  @IsOptional()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @MaxLength(60)
  code?: string;

  @IsOptional()
  @IsEnum(LocationType)
  type?: LocationType;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @Min(0)
  capacityUnits?: number;

  @IsOptional()
  description?: string;
}
