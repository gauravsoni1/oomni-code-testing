import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CustomersService } from './customers.service';

const mockCustomer = {
  id: 'clcust001',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockPrismaService = {
  customer: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('CustomersService', () => {
  let service: CustomersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomersService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create customer', async () => {
      mockPrismaService.customer.create.mockResolvedValue(mockCustomer);

      const dto = { name: 'Alice Johnson', email: 'alice@example.com' };
      const result = await service.create(dto);

      expect(mockPrismaService.customer.create).toHaveBeenCalledWith({
        data: { name: dto.name, email: dto.email },
      });
      expect(result).toEqual(mockCustomer);
    });

    it('should throw ConflictException if email exists (Prisma P2002)', async () => {
      const prismaUniqueError = { code: 'P2002', message: 'Unique constraint failed' };
      mockPrismaService.customer.create.mockRejectedValue(prismaUniqueError);

      const dto = { name: 'Alice Johnson', email: 'alice@example.com' };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(
        'Customer with email "alice@example.com" already exists',
      );
    });

    it('should re-throw non-P2002 errors', async () => {
      const otherError = new Error('DB connection error');
      mockPrismaService.customer.create.mockRejectedValue(otherError);

      const dto = { name: 'Alice Johnson', email: 'alice@example.com' };

      await expect(service.create(dto)).rejects.toThrow('DB connection error');
    });
  });

  describe('findAll', () => {
    it('should return all customers', async () => {
      const customers = [
        mockCustomer,
        { ...mockCustomer, id: 'clcust002', email: 'bob@example.com' },
      ];
      mockPrismaService.customer.findMany.mockResolvedValue(customers);

      const result = await service.findAll();

      expect(mockPrismaService.customer.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(customers);
      expect(result).toHaveLength(2);
    });
  });
});
