import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean up existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'Premium over-ear headphones with 30-hour battery life and active noise cancellation.',
        sku: 'HDPH-WNC-001',
        price: 299.99,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Mechanical Keyboard TKL',
        description: 'Tenkeyless mechanical keyboard with Cherry MX Red switches and RGB backlighting.',
        sku: 'KB-MECH-TKL-002',
        price: 149.95,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: '4K USB-C Monitor 27"',
        description: '27-inch 4K IPS display with USB-C PD 90W charging and HDR400 support.',
        sku: 'MON-4K-27-003',
        price: 599.00,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Portable SSD 1TB',
        description: 'Ultra-fast USB 3.2 Gen 2 portable SSD with up to 1050MB/s read speed.',
        sku: 'SSD-PORT-1TB-004',
        price: 109.99,
        active: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Ergonomic Mouse Wireless',
        description: 'Vertical ergonomic wireless mouse with 6 programmable buttons and 90-day battery.',
        sku: 'MOUSE-ERG-WL-005',
        price: 69.99,
        active: true,
      },
    }),
  ]);

  console.log(`Created ${products.length} products`);

  // Create inventory for each product
  const inventoryData = [
    { productId: products[0].id, availableQuantity: 45, reservedQuantity: 3 },
    { productId: products[1].id, availableQuantity: 80, reservedQuantity: 5 },
    { productId: products[2].id, availableQuantity: 20, reservedQuantity: 2 },
    { productId: products[3].id, availableQuantity: 100, reservedQuantity: 0 },
    { productId: products[4].id, availableQuantity: 65, reservedQuantity: 1 },
  ];

  for (const inv of inventoryData) {
    await prisma.inventory.create({ data: inv });
  }

  console.log(`Created inventory for ${inventoryData.length} products`);

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Bob Smith',
        email: 'bob.smith@example.com',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Carol Williams',
        email: 'carol.williams@example.com',
      },
    }),
  ]);

  console.log(`Created ${customers.length} customers`);
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
