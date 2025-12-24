import { Module } from '@nestjs/common';
import { BookingController } from './infrastructure/http';
import { GET_AVAILABLE_SLOTS_UC } from './application/ports/inbound';
import { GetAvailableSlotsUC } from './application/use-cases';
import {
  PrismaAvailabilityRepository,
  PrismaBookingQueryRepository,
  PrismaProductQueryRepository,
  PrismaEmployeeRepository,
} from './infrastructure/persistence';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Módulo de Booking
 * Gestiona la disponibilidad y reservas de servicios
 */
@Module({
  imports: [PrismaModule],
  controllers: [BookingController],
  providers: [
    // Repositorios
    {
      provide: 'IAvailabilityRepository',
      useFactory: (prisma: PrismaService) => new PrismaAvailabilityRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'IBookingQueryRepository',
      useFactory: (prisma: PrismaService) => new PrismaBookingQueryRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'IProductQueryRepository',
      useFactory: (prisma: PrismaService) => new PrismaProductQueryRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: 'IEmployeeRepository',
      useFactory: (prisma: PrismaService) => new PrismaEmployeeRepository(prisma),
      inject: [PrismaService],
    },
    // Casos de uso
    {
      provide: GET_AVAILABLE_SLOTS_UC,
      useFactory: (
        availabilityRepo: PrismaAvailabilityRepository,
        bookingQueryRepo: PrismaBookingQueryRepository,
        productQueryRepo: PrismaProductQueryRepository,
        employeeRepo: PrismaEmployeeRepository,
      ) => new GetAvailableSlotsUC(
        availabilityRepo,
        bookingQueryRepo,
        productQueryRepo,
        employeeRepo,
      ),
      inject: [
        'IAvailabilityRepository',
        'IBookingQueryRepository',
        'IProductQueryRepository',
        'IEmployeeRepository',
      ],
    },
  ],
  exports: [GET_AVAILABLE_SLOTS_UC],
})
export class BookingModule {}
