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
<<<<<<< HEAD
=======
  PrismaSlotAvailabilityChecker,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  PrismaUnitOfWork,
} from './infrastructure/persistence';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Módulo de Orders
 * Gestiona la creación, consulta y cancelación de órdenes
 */
@Module({
  imports: [PrismaModule],
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
<<<<<<< HEAD
=======
    {
      provide: 'ISlotAvailabilityChecker',
      useFactory: (prisma: PrismaService) => new PrismaSlotAvailabilityChecker(prisma),
      inject: [PrismaService],
    },
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    // Casos de uso
    {
      provide: CREATE_ORDER_UC,
      useFactory: (
        orderRepo: PrismaOrderRepository,
        productRepo: PrismaProductRepository,
<<<<<<< HEAD
        unitOfWork: PrismaUnitOfWork,
      ) => new CreateOrderUC(orderRepo, productRepo, unitOfWork),
      inject: [
        ORDER_REPOSITORY,
        'IProductRepository',
=======
        slotChecker: PrismaSlotAvailabilityChecker,
        unitOfWork: PrismaUnitOfWork,
      ) => new CreateOrderUC(orderRepo, productRepo, slotChecker, unitOfWork),
      inject: [
        ORDER_REPOSITORY,
        'IProductRepository',
        'ISlotAvailabilityChecker',
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
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
