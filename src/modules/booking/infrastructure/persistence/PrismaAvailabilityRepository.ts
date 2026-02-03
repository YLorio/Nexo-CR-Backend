import { PrismaClient, DayOfWeek as PrismaDayOfWeek } from '@prisma/client';
import { IAvailabilityRepository } from '../../application/ports/outbound';
import { AvailabilityBlock } from '../../domain/entities';
import { DayOfWeekEnum } from '../../domain/value-objects';

/**
 * Implementación Prisma del repositorio de disponibilidad
 * Usa ServiceTimeSlot como fuente de datos de disponibilidad
 */
export class PrismaAvailabilityRepository implements IAvailabilityRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByTenantAndDay(
    tenantId: string,
    dayOfWeek: DayOfWeekEnum,
  ): Promise<AvailabilityBlock[]> {
    // Buscar ServiceTimeSlots de servicios activos del tenant
    const timeSlots = await this.prisma.serviceTimeSlot.findMany({
      where: {
        dayOfWeek: dayOfWeek as PrismaDayOfWeek,
        isBlocked: false,
        service: {
          tenantId,
          isActive: true,
          deletedAt: null,
        },
      },
      include: {
        service: {
          select: { maxCapacity: true },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return timeSlots.map((slot) => this.toDomainEntity(slot, tenantId));
  }

  async findAllByTenant(tenantId: string): Promise<AvailabilityBlock[]> {
    const timeSlots = await this.prisma.serviceTimeSlot.findMany({
      where: {
        isBlocked: false,
        service: {
          tenantId,
          isActive: true,
          deletedAt: null,
        },
      },
      include: {
        service: {
          select: { maxCapacity: true },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return timeSlots.map((slot) => this.toDomainEntity(slot, tenantId));
  }

  async findById(id: string): Promise<AvailabilityBlock | null> {
    const slot = await this.prisma.serviceTimeSlot.findUnique({
      where: { id },
      include: {
        service: {
          select: { tenantId: true, maxCapacity: true },
        },
      },
    });

    if (!slot) return null;

    return this.toDomainEntity(slot, slot.service.tenantId);
  }

  /**
   * Mapper: Prisma ServiceTimeSlot → Domain AvailabilityBlock Entity
   */
  private toDomainEntity(
    prismaSlot: {
      id: string;
      dayOfWeek: PrismaDayOfWeek | null;
      startTime: string;
      endTime: string;
      capacityOverride: number | null;
      isBlocked: boolean;
      service?: { maxCapacity: number };
    },
    tenantId: string,
  ): AvailabilityBlock {
    return new AvailabilityBlock({
      id: prismaSlot.id,
      tenantId,
      dayOfWeek: (prismaSlot.dayOfWeek || 'MONDAY') as DayOfWeekEnum,
      startTime: prismaSlot.startTime,
      endTime: prismaSlot.endTime,
      capacity: prismaSlot.capacityOverride ?? prismaSlot.service?.maxCapacity ?? 1,
      isActive: !prismaSlot.isBlocked,
    });
  }
}
