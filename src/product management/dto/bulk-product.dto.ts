import { IsArray, ValidateNested, ArrayMinSize, IsString } from "class-validator"
import { Type } from "class-transformer"
import { CreateProductDto } from "./create-product.dto"
import { UpdateProductDto } from "./update-product.dto"

export class BulkCreateProductDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductDto)
  products: CreateProductDto[]
}

export class BulkUpdateProductDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateItem)
  products: BulkUpdateItem[]
}

class BulkUpdateItem extends UpdateProductDto {
  @IsString()
  id: string
}

export class BulkDeleteProductDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids: string[]
}
