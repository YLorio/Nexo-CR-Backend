import { Module } from '@nestjs/common';
import { OrdersController } from './infrastructure/http';
import {
  CREATE_ORDER_UC,
  CANCEL_ORDER_UC,
} from './application/ports/inbound';
import { ORDER_REPOSITORY } from './application/ports/outbound';
import { CreateOrderUC, CancelOrderUC } from './application/use-cases';
import {
  PrismaOrderRepository,
  PrismaProductRepository,
  PrismaSlotAvailabilityChecker,
  PrismaUnitOfWork,
} from './infrastructure/persistence';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

/**
 * Módulo de Orders
 * Gestiona la creación, consulta y cancelación de órdenes
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [OrdersController],
  providers: [
    // Infraestructura
    {
      provide: 'IUnitOfWork',
      useFactory: (prisma: PrismaService) => new PrismaUnitOfWork(prisma),
      inject: [PrismaService],
    },
    {
      provide: ORDER_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaOrderRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'IProductRepository',
      useFactory: (prisma: PrismaService) => new PrismaProductRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'ISlotAvailabilityChecker',
      useFactory: (prisma: PrismaService) => new PrismaSlotAvailabilityChecker(prisma),
      inject: [PrismaService],
    },
    // Casos de uso
    {
      provide: CREATE_ORDER_UC,
      useFactory: (
        orderRepo: PrismaOrderRepository,
        productRepo: PrismaProductRepository,
        slotChecker: PrismaSlotAvailabilityChecker,
        unitOfWork: PrismaUnitOfWork,
      ) => new CreateOrderUC(orderRepo, productRepo, slotChecker, unitOfWork),
      inject: [
        ORDER_REPOSITORY,
        'IProductRepository',
        'ISlotAvailabilityChecker',
        'IUnitOfWork',
      ],
    },
    {
      provide: CANCEL_ORDER_UC,
      useFactory: (
        orderRepo: PrismaOrderRepository,
        productRepo: PrismaProductRepository,
        unitOfWork: PrismaUnitOfWork,
      ) => new CancelOrderUC(orderRepo, productRepo, unitOfWork),
      inject: [ORDER_REPOSITORY, 'IProductRepository', 'IUnitOfWork'],
    },
  ],
  exports: [CREATE_ORDER_UC, CANCEL_ORDER_UC, ORDER_REPOSITORY],
})
export class OrdersModule {}
