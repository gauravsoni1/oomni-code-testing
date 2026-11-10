import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findByProductId(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${productId}" not found`);
    }

    const inventory = await this.prisma.inventory.findUnique({
      where: { productId },
    });

    return inventory;
  }
}
