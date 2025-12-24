import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserStatus, ServiceStaffAssignment, ServiceDefinition } from '@prisma/client';

/**
 * Información de un miembro del staff con sus servicios asignados
 */
export interface StaffWithServices {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  jobTitle: string | null;
  canReceiveBookings: boolean;
  bookingColor: string | null;
  isActive: boolean;
  services: {
    id: string;
    serviceId: string;
    serviceName: string;
    customPriceInCents: number | null;
    customDurationMinutes: number | null;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Alias para compatibilidad con el controller
export type EmployeeWithServices = StaffWithServices;

interface ServiceAssignmentWithService extends ServiceStaffAssignment {
  service: Pick<ServiceDefinition, 'id' | 'name'>;
}

/**
 * Servicio para gestionar staff desde el panel de administración
 */
@Injectable()
export class AdminStaffService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista todos los miembros del staff del tenant con sus servicios asignados
   */
  async listStaff(tenantId: string): Promise<StaffWithServices[]> {
    const staffMembers = await this.prisma.tenantStaff.findMany({
      where: {
        tenantId,
        deletedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            status: true,
          },
        },
        serviceAssignments: {
          where: { isActive: true },
          include: {
            service: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return staffMembers.map(staff => ({
      id: staff.id,
      userId: staff.userId,
      name: [staff.user.firstName, staff.user.lastName].filter(Boolean).join(' ') || staff.user.email,
      email: staff.user.email,
      phone: staff.user.phone,
      avatarUrl: staff.user.avatarUrl,
      jobTitle: staff.jobTitle,
      canReceiveBookings: staff.canReceiveBookings,
      bookingColor: staff.bookingColor,
      isActive: staff.isActive,
      services: staff.serviceAssignments.map(assignment => ({
        id: assignment.id,
        serviceId: assignment.serviceId,
        serviceName: assignment.service.name,
        customPriceInCents: assignment.customPriceInCents,
        customDurationMinutes: assignment.customDurationMinutes,
      })),
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    }));
  }

  /**
   * Obtiene un miembro del staff por su ID
   */
  async getStaff(tenantId: string, staffId: string): Promise<StaffWithServices> {
    const staff = await this.prisma.tenantStaff.findFirst({
      where: {
        id: staffId,
        tenantId,
        deletedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            status: true,
          },
        },
        serviceAssignments: {
          where: { isActive: true },
          include: {
            service: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!staff) {
      throw new NotFoundException('Miembro del staff no encontrado');
    }

    return {
      id: staff.id,
      userId: staff.userId,
      name: [staff.user.firstName, staff.user.lastName].filter(Boolean).join(' ') || staff.user.email,
      email: staff.user.email,
      phone: staff.user.phone,
      avatarUrl: staff.user.avatarUrl,
      jobTitle: staff.jobTitle,
      canReceiveBookings: staff.canReceiveBookings,
      bookingColor: staff.bookingColor,
      isActive: staff.isActive,
      services: staff.serviceAssignments.map(assignment => ({
        id: assignment.id,
        serviceId: assignment.serviceId,
        serviceName: assignment.service.name,
        customPriceInCents: assignment.customPriceInCents,
        customDurationMinutes: assignment.customDurationMinutes,
      })),
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    };
  }

  /**
   * Crea un nuevo miembro del staff (debe existir el usuario previamente)
   */
  async createStaff(
    tenantId: string,
    data: {
      userId: string;
      jobTitle?: string;
      canReceiveBookings?: boolean;
      bookingColor?: string;
      serviceIds?: string[];
    },
  ): Promise<StaffWithServices> {
    // Verificar que el usuario existe y está activo
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('El usuario no está activo');
    }

    // Verificar que no existe ya en este tenant
    const existing = await this.prisma.tenantStaff.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: data.userId,
        },
      },
    });

    if (existing && !existing.deletedAt) {
      throw new BadRequestException('El usuario ya es miembro del staff de este tenant');
    }

    // Validar que los servicios pertenecen al tenant
    if (data.serviceIds && data.serviceIds.length > 0) {
      const services = await this.prisma.serviceDefinition.findMany({
        where: {
          id: { in: data.serviceIds },
          tenantId,
          isActive: true,
        },
      });

      if (services.length !== data.serviceIds.length) {
        throw new BadRequestException('Algunos servicios no son válidos');
      }
    }

    // Si existe pero está eliminado, restaurar
    if (existing && existing.deletedAt) {
      const staff = await this.prisma.tenantStaff.update({
        where: { id: existing.id },
        data: {
          jobTitle: data.jobTitle,
          canReceiveBookings: data.canReceiveBookings ?? false,
          bookingColor: data.bookingColor,
          isActive: true,
          deletedAt: null,
          serviceAssignments: data.serviceIds && data.serviceIds.length > 0
            ? {
                deleteMany: {},
                create: data.serviceIds.map(serviceId => ({
                  serviceId,
                  isActive: true,
                })),
              }
            : undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatarUrl: true,
              status: true,
            },
          },
          serviceAssignments: {
            where: { isActive: true },
            include: {
              service: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      return this.mapStaffToResponse(staff);
    }

    // Crear nuevo
    const staff = await this.prisma.tenantStaff.create({
      data: {
        tenantId,
        userId: data.userId,
        jobTitle: data.jobTitle,
        canReceiveBookings: data.canReceiveBookings ?? false,
        bookingColor: data.bookingColor,
        serviceAssignments: data.serviceIds && data.serviceIds.length > 0
          ? {
              create: data.serviceIds.map(serviceId => ({
                serviceId,
                isActive: true,
              })),
            }
          : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            status: true,
          },
        },
        serviceAssignments: {
          where: { isActive: true },
          include: {
            service: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return this.mapStaffToResponse(staff);
  }

  /**
   * Actualiza un miembro del staff
   */
  async updateStaff(
    tenantId: string,
    staffId: string,
    data: {
      jobTitle?: string;
      canReceiveBookings?: boolean;
      bookingColor?: string;
      isActive?: boolean;
      serviceIds?: string[];
    },
  ): Promise<StaffWithServices> {
    // Verificar que existe
    const existing = await this.prisma.tenantStaff.findFirst({
      where: {
        id: staffId,
        tenantId,
        deletedAt: null
      },
    });

    if (!existing) {
      throw new NotFoundException('Miembro del staff no encontrado');
    }

    // Validar servicios si se actualizan
    if (data.serviceIds !== undefined) {
      if (data.serviceIds.length > 0) {
        const services = await this.prisma.serviceDefinition.findMany({
          where: {
            id: { in: data.serviceIds },
            tenantId,
            isActive: true,
          },
        });

        if (services.length !== data.serviceIds.length) {
          throw new BadRequestException('Algunos servicios no son válidos');
        }
      }

      // Eliminar asignaciones existentes y crear nuevas
      await this.prisma.serviceStaffAssignment.deleteMany({
        where: { staffId },
      });

      if (data.serviceIds.length > 0) {
        await this.prisma.serviceStaffAssignment.createMany({
          data: data.serviceIds.map(serviceId => ({
            staffId,
            serviceId,
            isActive: true,
          })),
        });
      }
    }

    // Actualizar staff
    const staff = await this.prisma.tenantStaff.update({
      where: { id: staffId },
      data: {
        ...(data.jobTitle !== undefined && { jobTitle: data.jobTitle || null }),
        ...(data.canReceiveBookings !== undefined && { canReceiveBookings: data.canReceiveBookings }),
        ...(data.bookingColor !== undefined && { bookingColor: data.bookingColor || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            status: true,
          },
        },
        serviceAssignments: {
          where: { isActive: true },
          include: {
            service: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return this.mapStaffToResponse(staff);
  }

  /**
   * Elimina un miembro del staff (soft delete)
   */
  async deleteStaff(tenantId: string, staffId: string): Promise<void> {
    const existing = await this.prisma.tenantStaff.findFirst({
      where: {
        id: staffId,
        tenantId,
        deletedAt: null
      },
    });

    if (!existing) {
      throw new NotFoundException('Miembro del staff no encontrado');
    }

    // Soft delete
    await this.prisma.tenantStaff.update({
      where: { id: staffId },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Mapea el resultado de Prisma a la respuesta esperada
   */
  private mapStaffToResponse(staff: any): StaffWithServices {
    return {
      id: staff.id,
      userId: staff.userId,
      name: [staff.user.firstName, staff.user.lastName].filter(Boolean).join(' ') || staff.user.email,
      email: staff.user.email,
      phone: staff.user.phone,
      avatarUrl: staff.user.avatarUrl,
      jobTitle: staff.jobTitle,
      canReceiveBookings: staff.canReceiveBookings,
      bookingColor: staff.bookingColor,
      isActive: staff.isActive,
      services: staff.serviceAssignments.map((assignment: ServiceAssignmentWithService) => ({
        id: assignment.id,
        serviceId: assignment.serviceId,
        serviceName: assignment.service.name,
        customPriceInCents: assignment.customPriceInCents,
        customDurationMinutes: assignment.customDurationMinutes,
      })),
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
    };
  }

  // ==================== ALIAS METHODS FOR CONTROLLER COMPATIBILITY ====================

  async listEmployees(tenantId: string): Promise<StaffWithServices[]> {
    return this.listStaff(tenantId);
  }

  async getEmployee(tenantId: string, employeeId: string): Promise<StaffWithServices> {
    return this.getStaff(tenantId, employeeId);
  }

  async createEmployee(tenantId: string, data: any): Promise<StaffWithServices> {
    return this.createStaff(tenantId, data);
  }

  async updateEmployee(tenantId: string, employeeId: string, data: any): Promise<StaffWithServices> {
    return this.updateStaff(tenantId, employeeId, data);
  }

  async deleteEmployee(tenantId: string, employeeId: string): Promise<void> {
    return this.deleteStaff(tenantId, employeeId);
  }

  async setAvailabilityBlocks(tenantId: string, staffId: string, blocks: any[]): Promise<void> {
    // Por ahora, la disponibilidad se maneja a través de ServiceTimeSlot
    // Este método es un placeholder para futura implementación
    const staff = await this.prisma.tenantStaff.findFirst({
      where: { id: staffId, tenantId, deletedAt: null },
    });

    if (!staff) {
      throw new NotFoundException('Miembro del staff no encontrado');
    }

    // TODO: Implementar lógica de bloques de disponibilidad cuando se necesite
  }
}
