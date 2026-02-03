import { PrismaClient } from '@prisma/client';
import { CreateOrderUC, CancelOrderUC } from './application/use-cases';
import {
  PrismaOrderRepository,
  PrismaProductRepository,
  PrismaUnitOfWork,
} from './infrastructure/persistence';

/**
 * Composition Root: Wiring manual de dependencias para el módulo Orders
 *
 * Este archivo es el único lugar donde se conocen las implementaciones concretas.
 * Los casos de uso solo conocen interfaces (puertos).
 */

export interface OrdersModule {
  createOrderUC: CreateOrderUC;
  cancelOrderUC: CancelOrderUC;
}

export function createOrdersModule(prisma: PrismaClient): OrdersModule {
  // Crear implementaciones de infraestructura
  const unitOfWork = new PrismaUnitOfWork(prisma);
  const orderRepository = new PrismaOrderRepository(prisma);
  const productRepository = new PrismaProductRepository(prisma);

  // Crear casos de uso
  const createOrderUC = new CreateOrderUC(
    orderRepository,
    productRepository,
    unitOfWork,
  );

  const cancelOrderUC = new CancelOrderUC(
    orderRepository,
    productRepository,
    unitOfWork,
  );

  return {
    createOrderUC,
    cancelOrderUC,
  };
}
