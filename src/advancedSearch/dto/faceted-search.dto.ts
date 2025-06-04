import { IsString, IsOptional, IsObject, IsArray, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FacetedSearchDto {
  @ApiProperty({ example: 'search query', required: false })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ example: { category: ['tech', 'business'], status: ['active'] }, required: false })
  @IsOptional()
  @IsObject()
  facets?: Record<string, string[]>;

  @ApiProperty({ example: ['category', 'tags', 'author'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facetFields?: string[];

  @ApiProperty({ example: ['price', 'rating'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  numericFacets?: string[];

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  histogramInterval?: number;

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
}