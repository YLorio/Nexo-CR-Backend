import { PrismaClient, DayOfWeek as PrismaDayOfWeek } from '@prisma/client';
import {
  IEmployeeRepository,
  EmployeeInfo,
  EmployeeWithAvailability,
} from '../../application/ports/outbound';
import { DayOfWeekEnum } from '../../domain/value-objects';

/**
 * Implementación Prisma del repositorio de empleados
 * Usa TenantStaff como fuente de datos de empleados
 */
export class PrismaEmployeeRepository implements IEmployeeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Obtiene los empleados activos que pueden realizar un servicio específico
   */
  async findEmployeesForService(
    tenantId: string,
    serviceId: string,
  ): Promise<EmployeeInfo[]> {
    const staffMembers = await this.prisma.tenantStaff.findMany({
      where: {
        tenantId,
        isActive: true,
        canReceiveBookings: true,
        deletedAt: null,
        serviceAssignments: {
          some: {
            serviceId,
            isActive: true,
          },
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return staffMembers.map((staff) => ({
      id: staff.id,
      name: [staff.user.firstName, staff.user.lastName].filter(Boolean).join(' ') || 'Staff',
      photoUrl: staff.user.avatarUrl,
      isActive: staff.isActive,
    }));
  }

  /**
   * Obtiene los empleados con sus bloques de disponibilidad para un día específico
   * Nota: La disponibilidad se determina por los ServiceTimeSlots del servicio
   */
  async findEmployeesWithAvailabilityForDay(
    tenantId: string,
    serviceId: string,
    dayOfWeek: DayOfWeekEnum,
  ): Promise<EmployeeWithAvailability[]> {
    // Primero obtener los time slots del servicio para ese día
    const serviceTimeSlots = await this.prisma.serviceTimeSlot.findMany({
      where: {
        serviceId,
        dayOfWeek: dayOfWeek as PrismaDayOfWeek,
        isBlocked: false,
      },
      orderBy: { startTime: 'asc' },
    });

    // Luego obtener los empleados asignados al servicio
    const staffMembers = await this.prisma.tenantStaff.findMany({
      where: {
        tenantId,
        isActive: true,
        canReceiveBookings: true,
        deletedAt: null,
        serviceAssignments: {
          some: {
            serviceId,
            isActive: true,
          },
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Si no hay time slots para el día, no hay disponibilidad
    if (serviceTimeSlots.length === 0) {
      return [];
    }

    // Mapear los empleados con la disponibilidad del servicio
    return staffMembers.map((staff) => ({
      id: staff.id,
      name: [staff.user.firstName, staff.user.lastName].filter(Boolean).join(' ') || 'Staff',
      photoUrl: staff.user.avatarUrl,
      isActive: staff.isActive,
      availabilityBlocks: serviceTimeSlots.map((slot) => ({
        id: slot.id,
        dayOfWeek: (slot.dayOfWeek || 'MONDAY') as DayOfWeekEnum,
        startTime: slot.startTime,
        endTime: slot.endTime,
        capacity: slot.capacityOverride ?? 1,
        isActive: !slot.isBlocked,
      })),
    }));
  }

  /**
   * Obtiene un empleado por su ID
   */
  async findById(id: string): Promise<EmployeeInfo | null> {
    const staff = await this.prisma.tenantStaff.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!staff || staff.deletedAt) return null;

    return {
      id: staff.id,
      name: [staff.user.firstName, staff.user.lastName].filter(Boolean).join(' ') || 'Staff',
      photoUrl: staff.user.avatarUrl,
      isActive: staff.isActive,
    };
  }

  /**
   * Obtiene todos los empleados activos de un tenant
   */
  async findAllByTenant(tenantId: string): Promise<EmployeeInfo[]> {
    const staffMembers = await this.prisma.tenantStaff.findMany({
      where: {
        tenantId,
        isActive: true,
        canReceiveBookings: true,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return staffMembers.map((staff) => ({
      id: staff.id,
      name: [staff.user.firstName, staff.user.lastName].filter(Boolean).join(' ') || 'Staff',
      photoUrl: staff.user.avatarUrl,
      isActive: staff.isActive,
    }));
  }
}
