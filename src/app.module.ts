import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { InventoryModule } from './inventory/inventory.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, ProductsModule, CustomersModule, OrdersModule, InventoryModule],
})
export class AppModule {}
