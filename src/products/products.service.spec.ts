import { ConflictException, NotFoundException } from '@nestjs/common';
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
    update: jest.fn(),
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

  describe('update', () => {
    it('should update all provided fields and return the updated product', async () => {
      const updated = {
        ...mockProduct,
        name: 'New Name',
        description: 'New description',
        sku: 'TEST-NEW',
        price: '149.50',
        active: false,
      };
      mockPrismaService.product.update.mockResolvedValue(updated);

      const dto = {
        name: 'New Name',
        description: 'New description',
        sku: 'TEST-NEW',
        price: 149.5,
        active: false,
      };
      const result = await service.update('cltest001', dto);

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'cltest001' },
        data: dto,
      });
      expect(result).toEqual(updated);
    });

    it('should only send provided fields to Prisma (partial update)', async () => {
      mockPrismaService.product.update.mockResolvedValue({ ...mockProduct, price: '79.99' });

      const result = await service.update('cltest001', { price: 79.99 });

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'cltest001' },
        data: { price: 79.99 },
      });
      expect(result.price).toBe('79.99');
      expect(result.name).toBe(mockProduct.name);
    });

    it('should allow deactivating a product without touching other fields', async () => {
      mockPrismaService.product.update.mockResolvedValue({ ...mockProduct, active: false });

      await service.update('cltest001', { active: false });

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'cltest001' },
        data: { active: false },
      });
    });

    it('should allow clearing the description with null', async () => {
      mockPrismaService.product.update.mockResolvedValue({ ...mockProduct, description: null });

      await service.update('cltest001', { description: null });

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'cltest001' },
        data: { description: null },
      });
    });

    it('should throw NotFoundException when product does not exist (P2025)', async () => {
      mockPrismaService.product.update.mockRejectedValue({ code: 'P2025' });

      await expect(service.update('nonexistent', { name: 'X' })).rejects.toThrow(NotFoundException);
      await expect(service.update('nonexistent', { name: 'X' })).rejects.toThrow(
        'Product with id "nonexistent" not found',
      );
    });

    it('should throw ConflictException when SKU is already used (P2002)', async () => {
      mockPrismaService.product.update.mockRejectedValue({ code: 'P2002' });

      await expect(service.update('cltest001', { sku: 'TAKEN-001' })).rejects.toThrow(
        ConflictException,
      );
      await expect(service.update('cltest001', { sku: 'TAKEN-001' })).rejects.toThrow(
        'Product with SKU "TAKEN-001" already exists',
      );
    });

    it('should rethrow unknown errors', async () => {
      const error = new Error('db down');
      mockPrismaService.product.update.mockRejectedValue(error);

      await expect(service.update('cltest001', { name: 'X' })).rejects.toBe(error);
    });
  });
});
