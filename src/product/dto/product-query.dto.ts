import {
	IsOptional,
	IsString,
	IsNumber,
	IsBoolean,
	Min,
	Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ProductQueryDto {
	@IsOptional()
	@IsString()
	search?: string;

	@IsOptional()
	@IsString()
	category?: string;

	@IsOptional()
	@IsString()
	brand?: string;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Type(() => Number)
	minPrice?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Type(() => Number)
	maxPrice?: number;

	@IsOptional()
	@IsBoolean()
	@Transform(({ value }) => value === 'true')
	isActive?: boolean;

	@IsOptional()
	@IsString()
	tags?: string;

	@IsOptional()
	@IsString()
	sortBy?: string = 'createdAt';

	@IsOptional()
	@IsString()
	sortOrder?: 'ASC' | 'DESC' = 'DESC';

	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(100)
	@Type(() => Number)
	limit?: number = 10;

	@IsOptional()
	@IsNumber()
	@Min(1)
	@Type(() => Number)
	page?: number = 1;
}
