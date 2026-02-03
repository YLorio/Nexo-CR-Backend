import { PrismaClient, BookingStatus, DayOfWeek } from '@prisma/client';
import {
  ISlotAvailabilityChecker,
  SlotCheckRequest,
} from '../../application/ports/outbound';
import { BaseRepository } from './BaseRepository';
import { DayOfWeek as DayOfWeekVO } from '../../../booking/domain/value-objects';
import { TimeSlot } from '../../../booking/domain/value-objects';

/**
 * Implementación Prisma del verificador de disponibilidad de slots
 * Usa ServiceTimeSlot para disponibilidad y Booking para reservas existentes
 */
export class PrismaSlotAvailabilityChecker
  extends BaseRepository
  implements ISlotAvailabilityChecker
{
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async isSlotAvailable(request: SlotCheckRequest): Promise<boolean> {
    const remainingCapacity = await this.getRemainingCapacity(request);
    return remainingCapacity > 0;
  }

  async checkMultipleSlots(
    requests: SlotCheckRequest[],
  ): Promise<Map<string, boolean>> {
    const result = new Map<string, boolean>();

    // Por ahora, verificar uno por uno (se puede optimizar después)
    for (const request of requests) {
      const key = `${request.date.toISOString().split('T')[0]}:${request.time}`;
      const isAvailable = await this.isSlotAvailable(request);
      result.set(key, isAvailable);
    }

    return result;
  }

  async getRemainingCapacity(request: SlotCheckRequest): Promise<number> {
    const client = this.getClient();

    // 1. Obtener el día de la semana
    const dayOfWeek = DayOfWeekVO.fromDate(request.date);

    // 2. Obtener los time slots del servicio para ese día
    const timeSlots = await client.serviceTimeSlot.findMany({
      where: {
        service: {
          tenantId: request.tenantId,
          isActive: true,
          deletedAt: null,
        },
        dayOfWeek: dayOfWeek.value as DayOfWeek,
        isBlocked: false,
      },
      include: {
        service: {
          select: { maxCapacity: true },
        },
      },
    });

    // Encontrar el time slot que contiene este horario
    const requestTimeMinutes = TimeSlot.timeToMinutes(request.time);
    const matchingSlot = timeSlots.find((slot) => {
      const startMinutes = TimeSlot.timeToMinutes(slot.startTime);
      const endMinutes = TimeSlot.timeToMinutes(slot.endTime);
      return requestTimeMinutes >= startMinutes && requestTimeMinutes < endMinutes;
    });

    if (!matchingSlot) {
      // No hay bloque de disponibilidad para este horario
      return 0;
    }

    const capacity = matchingSlot.capacityOverride ?? matchingSlot.service.maxCapacity;

    // 3. Contar reservas existentes que se solapan con este slot
    const startOfDay = new Date(request.date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(request.date);
    endOfDay.setHours(23, 59, 59, 999);

    // Obtener todas las reservas del día usando el modelo Booking
    const existingBookings = await client.booking.findMany({
      where: {
        service: {
          tenantId: request.tenantId,
        },
        scheduledStart: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
        },
        deletedAt: null,
      },
      include: {
        service: {
          select: { durationMinutes: true },
        },
      },
    });

    // Contar cuántas reservas se solapan con el slot solicitado
    const requestStart = requestTimeMinutes;
    const requestEnd = requestStart + request.durationMinutes;

    const overlappingBookings = existingBookings.filter((booking) => {
      const bookingStartTime = booking.scheduledStart.toTimeString().slice(0, 5);
      const bookingStart = TimeSlot.timeToMinutes(bookingStartTime);
      const bookingEnd = bookingStart + booking.service.durationMinutes;

      // Hay superposición si los rangos se solapan
      return requestStart < bookingEnd && requestEnd > bookingStart;
    });

    return Math.max(0, capacity - overlappingBookings.length);
  }
}
