import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ description: 'Unique product identifier' })
  id: string;

  @ApiProperty({ description: 'Product name' })
  name: string;

  @ApiPropertyOptional({ description: 'Product description' })
  description?: string;

  @ApiProperty({ description: 'Stock-keeping unit' })
  sku: string;

  @ApiProperty({ description: 'Product price' })
  price: string;

  @ApiProperty({ description: 'Whether the product is active' })
  active: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
