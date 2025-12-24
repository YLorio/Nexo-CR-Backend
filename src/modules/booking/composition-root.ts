import { PrismaClient } from '@prisma/client';
import { GetAvailableSlotsUC } from './application/use-cases';
import {
  PrismaAvailabilityRepository,
  PrismaBookingQueryRepository,
  PrismaProductQueryRepository,
  PrismaEmployeeRepository,
} from './infrastructure/persistence';

/**
 * Composition Root: Wiring manual de dependencias para el módulo Booking
 *
 * Este archivo es el único lugar donde se conocen las implementaciones concretas.
 * Los casos de uso solo conocen interfaces (puertos).
 */

export interface BookingModule {
  getAvailableSlotsUC: GetAvailableSlotsUC;
}

export function createBookingModule(prisma: PrismaClient): BookingModule {
  // Crear repositorios (implementaciones de puertos outbound)
  const availabilityRepository = new PrismaAvailabilityRepository(prisma);
  const bookingQueryRepository = new PrismaBookingQueryRepository(prisma);
  const productQueryRepository = new PrismaProductQueryRepository(prisma);
  const employeeRepository = new PrismaEmployeeRepository(prisma);

  // Crear casos de uso (implementaciones de puertos inbound)
  const getAvailableSlotsUC = new GetAvailableSlotsUC(
    availabilityRepository,
    bookingQueryRepository,
    productQueryRepository,
    employeeRepository,
  );

  return {
    getAvailableSlotsUC,
  };
}
