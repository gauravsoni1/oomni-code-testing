import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: createProductDto.name,
        description: createProductDto.description,
        sku: createProductDto.sku,
        price: createProductDto.price,
        active: createProductDto.active ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const data: Prisma.ProductUpdateInput = {};
    if (updateProductDto.name !== undefined) data.name = updateProductDto.name;
    if (updateProductDto.description !== undefined) {
      data.description = updateProductDto.description;
    }
    if (updateProductDto.sku !== undefined) data.sku = updateProductDto.sku;
    if (updateProductDto.price !== undefined) data.price = updateProductDto.price;
    if (updateProductDto.active !== undefined) data.active = updateProductDto.active;

    try {
      return await this.prisma.product.update({
        where: { id },
        data,
      });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Product with id "${id}" not found`);
      }
      if (error?.code === 'P2002') {
        throw new ConflictException(`Product with SKU "${updateProductDto.sku}" already exists`);
      }
      throw error;
    }
  }
}
