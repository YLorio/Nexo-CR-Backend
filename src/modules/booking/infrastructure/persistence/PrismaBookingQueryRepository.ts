import { PrismaClient, BookingStatus } from '@prisma/client';
import { IBookingQueryRepository, BookedSlot } from '../../application/ports/outbound';

/**
 * Implementación Prisma del repositorio de consultas de reservas
 * Usa el modelo Booking para consultar citas programadas
 */
export class PrismaBookingQueryRepository implements IBookingQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findBookedSlotsByTenantAndDate(
    tenantId: string,
    date: Date,
  ): Promise<BookedSlot[]> {
    // Normalizar la fecha a solo fecha (sin tiempo)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await this.prisma.booking.findMany({
      where: {
        service: {
          tenantId,
        },
        scheduledStart: {
          gte: startOfDay,
          lte: endOfDay,
        },
        // Solo bookings que no están cancelados
        status: {
          notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
        },
        deletedAt: null,
      },
      include: {
        service: {
          select: { id: true, durationMinutes: true },
        },
      },
    });

    return bookings.map((booking) => ({
      appointmentTime: booking.scheduledStart.toTimeString().slice(0, 5), // HH:mm format
      durationMinutes: booking.service.durationMinutes,
      productId: booking.serviceId,
      employeeId: booking.staffId,
    }));
  }

  async findBookedSlotsByEmployeeAndDate(
    employeeId: string,
    date: Date,
  ): Promise<BookedSlot[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await this.prisma.booking.findMany({
      where: {
        staffId: employeeId,
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
          select: { id: true, durationMinutes: true },
        },
      },
    });

    return bookings.map((booking) => ({
      appointmentTime: booking.scheduledStart.toTimeString().slice(0, 5),
      durationMinutes: booking.service.durationMinutes,
      productId: booking.serviceId,
      employeeId: booking.staffId,
    }));
  }

  async countBookingsForSlot(
    tenantId: string,
    date: Date,
    startTime: string,
  ): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    // Parsear hora de inicio
    const [hours, minutes] = startTime.split(':').map(Number);
    const slotStart = new Date(startOfDay);
    slotStart.setHours(hours, minutes, 0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + 1); // Buscar citas que empiezan en este minuto exacto

    const count = await this.prisma.booking.count({
      where: {
        service: {
          tenantId,
        },
        scheduledStart: {
          gte: slotStart,
          lt: slotEnd,
        },
        status: {
          notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
        },
        deletedAt: null,
      },
    });

    return count;
  }

  async countBookingsForEmployeeSlot(
    employeeId: string,
    date: Date,
    startTime: string,
  ): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const [hours, minutes] = startTime.split(':').map(Number);
    const slotStart = new Date(startOfDay);
    slotStart.setHours(hours, minutes, 0, 0);

    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + 1);

    const count = await this.prisma.booking.count({
      where: {
        staffId: employeeId,
        scheduledStart: {
          gte: slotStart,
          lt: slotEnd,
        },
        status: {
          notIn: [BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
        },
        deletedAt: null,
      },
    });

    return count;
  }
}
