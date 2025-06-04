import { IsString, IsOptional, IsObject, IsArray, IsInt, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AdvancedSearchDto {
  @ApiProperty({ example: 'search query', description: 'Search query string' })
  @IsString()
  query: string;

  @ApiProperty({ example: { category: 'technology', status: 'active' }, required: false })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiProperty({ example: 'createdAt', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ example: 'desc', enum: ['asc', 'desc'], required: false })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({ example: 1, minimum: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiProperty({ example: 10, minimum: 1, maximum: 100, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ example: ['products', 'articles'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  indices?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}
