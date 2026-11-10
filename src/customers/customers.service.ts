import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      return await this.prisma.customer.create({
        data: {
          name: createCustomerDto.name,
          email: createCustomerDto.email,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException(
          `Customer with email "${createCustomerDto.email}" already exists`,
        );
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
