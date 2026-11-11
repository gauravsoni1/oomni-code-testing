import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const mockPrismaService = {
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  product: {
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    update: jest.fn(),
  },
  customer: {
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
  },
  inventory: {
    findUnique: jest.fn().mockResolvedValue(null),
  },
};

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrismaService.product.findMany.mockResolvedValue([]);
    mockPrismaService.product.findUnique.mockResolvedValue(null);
    mockPrismaService.product.create.mockResolvedValue({
      id: 'cle2e001',
      name: 'E2E Headphones',
      description: 'An e2e test product',
      sku: 'E2E-001',
      price: '199.99',
      active: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
  });

  describe('GET /api/v1/products', () => {
    it('should return 200 with empty array', () => {
      return request(app.getHttpServer()).get('/api/v1/products').expect(200).expect([]);
    });
  });

  describe('POST /api/v1/products', () => {
    it('should return 201 with created product for valid body', () => {
      return request(app.getHttpServer())
        .post('/api/v1/products')
        .send({
          name: 'E2E Headphones',
          description: 'An e2e test product',
          sku: 'E2E-001',
          price: 199.99,
          active: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: 'cle2e001',
            name: 'E2E Headphones',
            sku: 'E2E-001',
          });
        });
    });

    it('should return 400 for invalid body (missing required fields)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/products')
        .send({ description: 'Missing name and sku' })
        .expect(400);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should return 404 for non-existent product id', () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      return request(app.getHttpServer()).get('/api/v1/products/nonexistent-id').expect(404);
    });
  });

  describe('PATCH /api/v1/products/:id', () => {
    const existing = {
      id: 'cle2e001',
      name: 'E2E Headphones',
      description: 'An e2e test product',
      sku: 'E2E-001',
      price: '199.99',
      active: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    it('should return 200 with the updated product and only send provided fields', () => {
      mockPrismaService.product.update.mockResolvedValue({ ...existing, price: '149.99' });

      return request(app.getHttpServer())
        .patch('/api/v1/products/cle2e001')
        .send({ price: 149.99 })
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: 'cle2e001',
            name: 'E2E Headphones',
            price: '149.99',
          });
          expect(mockPrismaService.product.update).toHaveBeenCalledWith({
            where: { id: 'cle2e001' },
            data: { price: 149.99 },
          });
        });
    });

    it('should return 404 when the product does not exist', () => {
      mockPrismaService.product.update.mockRejectedValue({ code: 'P2025' });

      return request(app.getHttpServer())
        .patch('/api/v1/products/nonexistent-id')
        .send({ name: 'New name' })
        .expect(404);
    });

    it('should return 409 when the SKU belongs to another product', () => {
      mockPrismaService.product.update.mockRejectedValue({ code: 'P2002' });

      return request(app.getHttpServer())
        .patch('/api/v1/products/cle2e001')
        .send({ sku: 'TAKEN-001' })
        .expect(409);
    });

    it.each([
      [{ price: -5 }],
      [{ price: 'abc' }],
      [{ price: 1.999 }],
      [{ name: '' }],
      [{ sku: null }],
      [{ active: 'yes' }],
      [{ unknownField: 1 }],
    ])('should return 400 for invalid body %j', (body) => {
      return request(app.getHttpServer())
        .patch('/api/v1/products/cle2e001')
        .send(body)
        .expect(400)
        .expect(() => {
          expect(mockPrismaService.product.update).not.toHaveBeenCalled();
        });
    });
  });
});
