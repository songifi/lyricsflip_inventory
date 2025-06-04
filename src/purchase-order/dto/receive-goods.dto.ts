import { IsArray, IsOptional, IsString, IsUUID, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReceiveGoodsItemDto {
  @ApiProperty({ description: 'Purchase order item ID' })
  @IsUUID()
  itemId: string;

  @ApiProperty({ description: 'Quantity received' })
  quantityReceived: number;

  @ApiPropertyOptional({ description: 'Notes about received item' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Actual delivery date for this item' })
  @IsOptional()
  @IsDateString()
  actualDeliveryDate?: string;
}

export class ReceiveGoodsDto {
  @ApiProperty({ 
    description: 'Items being received',
    type: [ReceiveGoodsItemDto] 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveGoodsItemDto)
  items: ReceiveGoodsItemDto[];

  @ApiPropertyOptional({ description: 'General receiving notes' })
  @IsOptional()
  @IsString()
  receivingNotes?: string;

  @ApiProperty({ description: 'Person receiving the goods' })
  @IsString()
  receivedBy: string;

  @ApiPropertyOptional({ description: 'Delivery address where goods were received' })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;
} 