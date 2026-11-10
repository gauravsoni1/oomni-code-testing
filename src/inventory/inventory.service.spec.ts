import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from './inventory.service';

const mockProduct = {
  id: 'clprod001',
  name: 'Test Product',
  sku: 'TEST-001',
  price: '99.99',
  active: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockInventory = {
  id: 'clinv001',
  productId: 'clprod001',
  availableQuantity: 50,
  reservedQuantity: 2,
  updatedAt: new Date('2024-01-01'),
};

const mockPrismaService = {
  product: {
    findUnique: jest.fn(),
  },
  inventory: {
    findUnique: jest.fn(),
  },
};

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventoryService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    jest.clearAllMocks();
  });

  describe('findByProductId', () => {
    it('should return inventory', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.inventory.findUnique.mockResolvedValue(mockInventory);

      const result = await service.findByProductId('clprod001');

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'clprod001' },
      });
      expect(mockPrismaService.inventory.findUnique).toHaveBeenCalledWith({
        where: { productId: 'clprod001' },
      });
      expect(result).toEqual(mockInventory);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findByProductId('nonexistent')).rejects.toThrow(NotFoundException);
      await expect(service.findByProductId('nonexistent')).rejects.toThrow(
        'Product with id "nonexistent" not found',
      );
    });
  });
});
