import { ApiProperty } from '@nestjs/swagger';

export class InventoryResponseDto {
  @ApiProperty({ description: 'Unique inventory record identifier' })
  id: string;

  @ApiProperty({ description: 'Associated product ID' })
  productId: string;

  @ApiProperty({ description: 'Number of units available for purchase' })
  availableQuantity: number;

  @ApiProperty({ description: 'Number of units reserved (in pending orders)' })
  reservedQuantity: number;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
