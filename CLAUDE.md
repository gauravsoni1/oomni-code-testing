# CLAUDE.md — Guidance for AI Coding Agents

## Project Architecture

NestJS modular architecture with Prisma ORM. Each feature domain has its own module containing a controller, service, DTOs, and tests. PrismaModule is `@Global()` so PrismaService can be injected anywhere without re-importing.

```
src/
  app.module.ts         ← imports all feature modules + PrismaModule
  main.ts               ← bootstrap: ValidationPipe, Swagger, CORS, global prefix /api/v1
  prisma/               ← global PrismaService (extends PrismaClient)
  common/filters/       ← HttpExceptionFilter (global)
  products/             ← Products feature module
  customers/            ← Customers feature module
  orders/               ← Orders feature module (empty shell)
  inventory/            ← Inventory feature module
```

## Module Responsibilities

| Module | Endpoints | Notes |
|--------|-----------|-------|
| Products | POST /products, GET /products, GET /products/:id | Active filter on findAll |
| Customers | POST /customers, GET /customers | P2002 → ConflictException |
| Inventory | GET /inventory/:productId | Checks product exists first |
| Orders | (none) | Empty controller, reserved for future work |

## Naming Conventions

- **Classes**: PascalCase (`ProductsService`, `CreateProductDto`)
- **Methods**: camelCase (`findAll`, `findByProductId`)
- **Files**: kebab-case (`products.service.ts`, `create-product.dto.ts`)
- **Module folders**: kebab-case (`products/`, `customers/`)

## How to Add a New Endpoint

1. **DTO**: Create or update `src/<module>/dto/<action>-<entity>.dto.ts`. Add `class-validator` decorators and `@ApiProperty` for Swagger.
2. **Service method**: Add method to `src/<module>/<module>.service.ts`. Inject `PrismaService` and call `this.prisma.<model>.<operation>()`. Throw appropriate NestJS exceptions (NotFoundException, ConflictException, etc.).
3. **Controller route**: Add decorated method to `src/<module>/<module>.controller.ts`. Use `@Get`, `@Post`, `@Patch`, `@Delete` etc. Add Swagger decorators (`@ApiOperation`, `@ApiOkResponse`, `@ApiNotFoundResponse`, ...).
4. **Service test**: Add test case in `<module>.service.spec.ts`. Mock the relevant `mockPrismaService.<model>.<method>` return value.
5. **Controller test**: Add test case in `<module>.controller.spec.ts`. Mock the service method return value.

## Using Prisma

Inject `PrismaService` via constructor:

```typescript
constructor(private readonly prisma: PrismaService) {}
```

Use as:

```typescript
// Find with filter
await this.prisma.product.findMany({ where: { active: true } });

// Find one or null
await this.prisma.product.findUnique({ where: { id } });

// Create
await this.prisma.product.create({ data: { name, sku, price } });

// Catch Prisma unique constraint violation
} catch (error: any) {
  if (error?.code === 'P2002') throw new ConflictException('...');
  throw error;
}
```

## Writing Tests

Unit tests use Jest describe/it pattern with mocked dependencies:

```typescript
const mockPrismaService = {
  product: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

// In beforeEach: jest.clearAllMocks()
// In each test: mockPrismaService.product.findUnique.mockResolvedValue(...)
```

Controller tests mock the service, not Prisma directly:

```typescript
const mockProductsService = { create: jest.fn(), findAll: jest.fn(), findOne: jest.fn() };
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Compile TypeScript to dist/ |
| `npm run lint` | ESLint with auto-fix |
| `npm test` | Run unit tests (src/**/*.spec.ts) |
| `npm run test:cov` | Unit tests with coverage report |
| `npm run test:e2e` | Run E2E tests (test/**/*.e2e-spec.ts) |
| `npm run prisma:generate` | Regenerate Prisma client after schema changes |
| `npm run prisma:migrate` | Apply migrations in development |
| `npm run start:dev` | Start with hot-reload |

## Rules

- **Preserve existing behavior** — do not change existing service logic unless fixing a bug.
- **Do not break existing tests** — run `npm test` after any change.
- **Use ValidationPipe DTOs** — all request bodies must have a DTO with `class-validator` decorators; never accept raw `any`.
- **Handle errors with NestJS exceptions** — use `NotFoundException`, `ConflictException`, `BadRequestException` etc. from `@nestjs/common`; never throw raw errors from controllers.
- **Swagger coverage** — every new route should have `@ApiOperation` and at least one `@ApiResponse` decorator.
- **No unimplemented stubs** — the Orders controller is intentionally empty; do not add TODO stub methods.
