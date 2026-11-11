import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
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

const mockProductsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
};

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockProductsService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call service.create and return result', async () => {
      mockProductsService.create.mockResolvedValue(mockProduct);

      const dto = { name: 'Test Headphones', sku: 'TEST-001', price: 99.99 };
      const result = await controller.create(dto as any);

      expect(mockProductsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return array', async () => {
      const products = [mockProduct];
      mockProductsService.findAll.mockResolvedValue(products);

      const result = await controller.findAll();

      expect(mockProductsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne and return result', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne('cltest001');

      expect(mockProductsService.findOne).toHaveBeenCalledWith('cltest001');
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('should call service.update with id and dto and return result', async () => {
      const updated = { ...mockProduct, name: 'Renamed' };
      mockProductsService.update.mockResolvedValue(updated);

      const dto = { name: 'Renamed' };
      const result = await controller.update('cltest001', dto);

      expect(mockProductsService.update).toHaveBeenCalledWith('cltest001', dto);
      expect(result).toEqual(updated);
    });

    it('should propagate NotFoundException from service', async () => {
      mockProductsService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update('nonexistent', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should propagate ConflictException from service', async () => {
      mockProductsService.update.mockRejectedValue(new ConflictException());

      await expect(controller.update('cltest001', { sku: 'TAKEN' })).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
