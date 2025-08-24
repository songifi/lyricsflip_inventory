import { IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { InventoryItemStatus } from '../inventory-item.entity';

export class InventoryItemQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit: number = 10;

  @IsString()
  @IsOptional()
  search?: string;

  // existing exact-name filter
  @IsString()
  @IsOptional()
  category?: string;

  // new: hierarchical filter by category id (includes descendants)
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsEnum(InventoryItemStatus)
  @IsOptional()
  status?: InventoryItemStatus;

  @IsString()
  @IsOptional()
  location?: string;

  // comma-separated list
  @IsString()
  @IsOptional()
  tags?: string;

  @IsIn(['name', 'sku', 'category', 'currentStock', 'createdAt', 'updatedAt'])
  @IsOptional()
  sortBy?: string;

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder: 'ASC' | 'DESC' = 'DESC';
}
