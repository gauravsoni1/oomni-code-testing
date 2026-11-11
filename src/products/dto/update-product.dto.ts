import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

/**
 * Only fields that are present in the request body are validated and updated.
 *
 * `@ValidateIf((_, value) => value !== undefined)` is used instead of `@IsOptional()`
 * for non-nullable columns so that an explicit `null` is rejected with 400 rather
 * than reaching Prisma. `description` is nullable in the schema, so `null` is
 * accepted there and clears the description.
 */
export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Product name', example: 'Wireless Headphones' })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({
    description: 'Product description (send null to clear it)',
    example: 'High-quality wireless headphones',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Stock-keeping unit (must be unique)',
    example: 'HDPH-WNC-001',
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  sku?: string;

  @ApiPropertyOptional({
    description: 'Product price (max 2 decimal places)',
    example: 299.99,
    minimum: 0,
    maximum: 99999999.99,
  })
  @ValidateIf((_, value) => value !== undefined)
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 })
  @Min(0)
  @Max(99999999.99)
  price?: number;

  @ApiPropertyOptional({ description: 'Whether the product is active', example: true })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  active?: boolean;
}
