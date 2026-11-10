import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

const mockInventory = {
  id: 'clinv001',
  productId: 'clprod001',
  availableQuantity: 50,
  reservedQuantity: 2,
  updatedAt: new Date('2024-01-01'),
};

const mockInventoryService = {
  findByProductId: jest.fn(),
};

describe('InventoryController', () => {
  let controller: InventoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [{ provide: InventoryService, useValue: mockInventoryService }],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    jest.clearAllMocks();
  });

  describe('findByProductId', () => {
    it('should call service.findByProductId and return result', async () => {
      mockInventoryService.findByProductId.mockResolvedValue(mockInventory);

      const result = await controller.findByProductId('clprod001');

      expect(mockInventoryService.findByProductId).toHaveBeenCalledWith('clprod001');
      expect(result).toEqual(mockInventory);
    });
  });
});
