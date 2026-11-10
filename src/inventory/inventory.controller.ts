import { Controller, Get, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { InventoryResponseDto } from './dto/inventory-response.dto';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get(':productId')
  @ApiOperation({ summary: 'Get inventory for a product' })
  @ApiOkResponse({ description: 'Inventory record for the product', type: InventoryResponseDto })
  @ApiNotFoundResponse({ description: 'Product not found' })
  findByProductId(@Param('productId') productId: string) {
    return this.inventoryService.findByProductId(productId);
  }
}
