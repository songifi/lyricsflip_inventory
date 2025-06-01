import { IsArray, ValidateNested, IsUUID, ArrayMinSize, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductDto } from './create-product.dto';

export class BulkCreateProductDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateProductDto)
	@ArrayMinSize(1)
	products: CreateProductDto[];
}

export class BulkDeleteProductDto {
	@IsArray()
	@IsUUID(4, { each: true })
	@ArrayMinSize(1)
	ids: string[];
}

export class BulkUpdateStockDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => StockUpdateItem)
	@ArrayMinSize(1)
	items: StockUpdateItem[];
}

class StockUpdateItem {
	@IsUUID(4)
	id: string;

	@IsNumber()
	@Type(() => Number)
	stock: number;
}
