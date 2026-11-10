import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from './products.service';

const mockProduct = {
  id: 'cltest001',
  name: 'Test Headphones',
  description: 'A test product',
  sku: 'TEST-001',
  price: '99.99',
  active: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockPrismaService = {
  product: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a product', async () => {
      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const dto = {
        name: 'Test Headphones',
        description: 'A test product',
        sku: 'TEST-001',
        price: 99.99,
        active: true,
      };

      const result = await service.create(dto);

      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          description: dto.description,
          sku: dto.sku,
          price: dto.price,
          active: dto.active,
        },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should default active to true when not provided', async () => {
      mockPrismaService.product.create.mockResolvedValue({ ...mockProduct, active: true });

      const dto = { name: 'Test', sku: 'TEST-002', price: 10.0 };
      await service.create(dto);

      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ active: true }),
      });
    });
  });

  describe('findAll', () => {
    it('should return array of active products', async () => {
      const products = [mockProduct, { ...mockProduct, id: 'cltest002', sku: 'TEST-002' }];
      mockPrismaService.product.findMany.mockResolvedValue(products);

      const result = await service.findAll();

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(products);
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return product by id', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne('cltest001');

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'cltest001' },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        'Product with id "nonexistent" not found',
      );
    });
  });
});
