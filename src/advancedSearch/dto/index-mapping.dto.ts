import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IndexMappingDto {
  @ApiProperty({
    example: {
      properties: {
        title: { type: 'text' },
        content: { type: 'text' },
        category: { type: 'keyword' },
      },
    },
  })
  @IsObject()
  properties: Record<string, any>;
}