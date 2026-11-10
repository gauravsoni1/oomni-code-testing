import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Wireless Headphones' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-quality wireless headphones',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Stock-keeping unit (unique identifier)', example: 'HDPH-WNC-001' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ description: 'Product price', example: 299.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Whether the product is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
