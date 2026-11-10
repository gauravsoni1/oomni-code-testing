# Sample Inventory & Order Management API

A sample NestJS + TypeScript backend application designed for testing autonomous AI developer agents. This project intentionally has some endpoints implemented and others left as future work, to give AI agents a realistic codebase to extend.

## Tech Stack

- **Framework**: NestJS 10 with TypeScript
- **Database ORM**: Prisma 6 with PostgreSQL
- **Validation**: class-validator + class-transformer
- **API Docs**: Swagger / OpenAPI via @nestjs/swagger
- **Testing**: Jest + ts-jest, Supertest for E2E

## Prerequisites

- Node.js >= 18
- npm >= 9
- Docker and Docker Compose (for PostgreSQL)
- (Optional) `psql` CLI for direct database access

## Installation

```bash
npm install
```

## Environment Setup

Copy the example env file and edit if needed:

```bash
cp .env.example .env
```

The default `.env.example` values work with the Docker Compose setup out of the box.

## Starting PostgreSQL with Docker

```bash
docker-compose up -d
```

This starts a PostgreSQL 16 container at `localhost:5432` with:
- User: `postgres`
- Password: `postgres`
- Database: `inventory_db`

## Running Migrations

```bash
npm run prisma:migrate
```

This applies all Prisma migrations and generates the Prisma client.

## Seeding Data

```bash
npm run prisma:seed
```

Seeds the database with 5 products (electronics/gadgets), 3 customers, and inventory records for each product.

## Starting the API

```bash
# Development (with hot-reload)
npm run start:dev

# Production build
npm run build && npm run start
```

The API runs on port 3000 by default (`PORT` env var overrides this).

## Running Unit Tests

```bash
npm test
```

For coverage:

```bash
npm run test:cov
```

## Running E2E Tests

```bash
npm run test:e2e
```

E2E tests use a fully mocked PrismaService — no real database connection required.

## Swagger API Documentation

Once the app is running, visit:

```
http://localhost:3000/api/docs
```

## Implemented Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/products | Create a new product |
| GET | /api/v1/products | List all active products |
| GET | /api/v1/products/:id | Get a product by ID |
| POST | /api/v1/customers | Create a new customer |
| GET | /api/v1/customers | List all customers |
| GET | /api/v1/inventory/:productId | Get inventory for a product |

## Project Structure

```
sample-inventory-api/
├── src/
│   ├── app.module.ts           # Root module
│   ├── main.ts                 # Bootstrap (ValidationPipe, Swagger, CORS)
│   ├── products/               # Products module (CRUD subset)
│   ├── customers/              # Customers module (CRUD subset)
│   ├── orders/                 # Orders module (empty shell — not yet implemented)
│   ├── inventory/              # Inventory module (read-only)
│   ├── prisma/                 # PrismaService + global PrismaModule
│   └── common/filters/         # Global HttpExceptionFilter
├── prisma/
│   ├── schema.prisma           # Prisma schema (Product, Customer, Inventory, Order, OrderItem)
│   └── seed.ts                 # Seed script
├── test/
│   └── app.e2e-spec.ts         # E2E tests (mocked DB)
├── docker-compose.yml
├── jest.config.js              # Unit test config (rootDir: src)
├── jest.e2e.config.js          # E2E test config (rootDir: .)
└── package.json
```
