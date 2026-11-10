import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

const mockCustomer = {
  id: 'clcust001',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockCustomersService = {
  create: jest.fn(),
  findAll: jest.fn(),
};

describe('CustomersController', () => {
  let controller: CustomersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [{ provide: CustomersService, useValue: mockCustomersService }],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call service.create and return result', async () => {
      mockCustomersService.create.mockResolvedValue(mockCustomer);

      const dto = { name: 'Alice Johnson', email: 'alice@example.com' };
      const result = await controller.create(dto);

      expect(mockCustomersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockCustomer);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll and return array', async () => {
      const customers = [mockCustomer];
      mockCustomersService.findAll.mockResolvedValue(customers);

      const result = await controller.findAll();

      expect(mockCustomersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(customers);
    });
  });
});
