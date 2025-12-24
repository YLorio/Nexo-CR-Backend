import {
  IGetAvailableSlotsUC,
  GetAvailableSlotsQuery,
  GetAvailableSlotsResult,
  AvailableSlotDTO,
  AvailableEmployeeDTO,
} from '../ports/inbound';
import {
  IAvailabilityRepository,
  IBookingQueryRepository,
  IProductQueryRepository,
  IEmployeeRepository,
  BookedSlot,
  EmployeeWithAvailability,
} from '../ports/outbound';
import { TimeSlot, DayOfWeek } from '../../domain/value-objects';
import { AvailabilityBlock } from '../../domain/entities';
import {
  ServiceNotFoundError,
  NoAvailabilityConfiguredError,
  InvalidDateError,
  NoEmployeesForServiceError,
} from '../../domain/errors/BookingErrors';

/**
 * Slot interno con información de empleado
 */
interface EmployeeSlot {
  startTime: string;
  endTime: string;
  employeeId: string;
  employeeName: string;
  employeePhotoUrl: string | null;
  capacity: number;
  bookedCount: number;
}

/**
 * Caso de Uso: Obtener Slots Disponibles (Multi-Staff)
 *
 * Algoritmo actualizado para múltiples empleados:
 * 1. Validar que la fecha no sea pasada
 * 2. Obtener información del servicio (para saber duración)
 * 3. Obtener empleados que pueden realizar el servicio con sus horarios
 * 4. Para cada empleado, generar slots teóricos basados en sus bloques de disponibilidad
 * 5. Para cada empleado, obtener sus reservas existentes
 * 6. Combinar todos los slots de todos los empleados
 * 7. Agrupar por hora y mostrar qué empleados están disponibles en cada slot
 */
export class GetAvailableSlotsUC implements IGetAvailableSlotsUC {
  constructor(
    private readonly availabilityRepository: IAvailabilityRepository,
    private readonly bookingQueryRepository: IBookingQueryRepository,
    private readonly productQueryRepository: IProductQueryRepository,
    private readonly employeeRepository: IEmployeeRepository,
  ) {}

  async execute(query: GetAvailableSlotsQuery): Promise<GetAvailableSlotsResult> {
    const { tenantId, serviceId, date, employeeId } = query;

    // 1. Validar que la fecha no sea pasada
    this.validateDate(date);

    // 2. Obtener información del servicio
    const service = await this.productQueryRepository.findServiceById(serviceId);
    if (!service) {
      throw new ServiceNotFoundError(serviceId);
    }

    // Validar que el servicio pertenece al tenant
    if (service.tenantId !== tenantId) {
      throw new ServiceNotFoundError(serviceId);
    }

    // 3. Determinar el día de la semana
    const dayOfWeek = DayOfWeek.fromDate(date);

    // 4. Obtener empleados que pueden realizar el servicio con sus horarios
    let employeesWithAvailability = await this.employeeRepository.findEmployeesWithAvailabilityForDay(
      tenantId,
      serviceId,
      dayOfWeek.value,
    );

    // Si se especificó un empleado, filtrar solo ese
    if (employeeId) {
      employeesWithAvailability = employeesWithAvailability.filter(e => e.id === employeeId);
    }

    // Si no hay empleados asignados al servicio, buscar disponibilidad global (modo legacy)
    if (employeesWithAvailability.length === 0) {
      return this.executeLegacyMode(query, service, dayOfWeek);
    }

    // 5. Generar slots para cada empleado y combinar
    const allEmployeeSlots: EmployeeSlot[] = [];
    const employeesInfo: AvailableEmployeeDTO[] = [];

    for (const employee of employeesWithAvailability) {
      // Agregar info del empleado
      employeesInfo.push({
        id: employee.id,
        name: employee.name,
        photoUrl: employee.photoUrl,
      });

      // Generar slots teóricos para este empleado
      const employeeTheoreticalSlots = this.generateEmployeeSlots(
        employee,
        service.durationMinutes,
      );

      // Obtener reservas de este empleado para la fecha
      const employeeBookings = await this.bookingQueryRepository.findBookedSlotsByEmployeeAndDate(
        employee.id,
        date,
      );

      // Calcular disponibilidad de cada slot
      for (const slot of employeeTheoreticalSlots) {
        const bookedCount = this.countBookingsAffectingSlot(
          slot,
          employeeBookings,
          service.durationMinutes,
        );

        if (bookedCount < slot.capacity) {
          allEmployeeSlots.push({
            ...slot,
            bookedCount,
          });
        }
      }
    }

    // 6. Agrupar slots por hora y combinar empleados disponibles
    const groupedSlots = this.groupSlotsByTime(allEmployeeSlots);

    // 7. Convertir a DTOs
    const resultSlots: AvailableSlotDTO[] = groupedSlots.map(group => ({
      startTime: group.startTime,
      endTime: group.endTime,
      availableSpots: group.employees.length,
      availableEmployees: group.employees,
    }));

    return {
      date,
      dayOfWeek: dayOfWeek.toSpanish(),
      serviceName: service.name,
      serviceDurationMinutes: service.durationMinutes,
      slots: resultSlots,
      totalAvailableSlots: resultSlots.length,
      employees: employeesInfo,
    };
  }

  /**
   * Modo legacy: cuando no hay empleados asignados, usar disponibilidad del tenant
   * Esto permite compatibilidad hacia atrás con la lógica anterior
   */
  private async executeLegacyMode(
    query: GetAvailableSlotsQuery,
    service: { name: string; durationMinutes: number; tenantId: string },
    dayOfWeek: DayOfWeek,
  ): Promise<GetAvailableSlotsResult> {
    const { tenantId, date } = query;

    // Obtener bloques de disponibilidad del tenant (sin empleado específico)
    const availabilityBlocks = await this.availabilityRepository.findByTenantAndDay(
      tenantId,
      dayOfWeek.value,
    );

    if (availabilityBlocks.length === 0) {
      throw new NoAvailabilityConfiguredError(tenantId, dayOfWeek.toSpanish());
    }

    // Generar slots teóricos
    const theoreticalSlots = this.generateTheoreticalSlots(
      availabilityBlocks,
      service.durationMinutes,
    );

    // Obtener reservas existentes (modo tenant)
    const bookedSlots = await this.bookingQueryRepository.findBookedSlotsByTenantAndDate(
      tenantId,
      date,
    );

    // Calcular disponibilidad
    const availableSlots = this.calculateAvailableSlots(
      theoreticalSlots,
      bookedSlots,
      service.durationMinutes,
    );

    // Convertir a DTOs (modo legacy sin empleados específicos)
    const resultSlots: AvailableSlotDTO[] = availableSlots
      .filter(slot => slot.isAvailable)
      .map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        availableSpots: slot.availableSpots,
        availableEmployees: [], // No hay empleados específicos en modo legacy
      }));

    return {
      date,
      dayOfWeek: dayOfWeek.toSpanish(),
      serviceName: service.name,
      serviceDurationMinutes: service.durationMinutes,
      slots: resultSlots,
      totalAvailableSlots: resultSlots.length,
      employees: [], // No hay empleados específicos en modo legacy
    };
  }

  /**
   * Valida que la fecha no sea en el pasado
   */
  private validateDate(date: Date): void {
    const now = new Date();
    const costaRicaOffset = -6 * 60; // UTC-6
    const localOffset = now.getTimezoneOffset();
    const offsetDiff = costaRicaOffset - localOffset;

    const costaRicaNow = new Date(now.getTime() + offsetDiff * 60 * 1000);
    costaRicaNow.setHours(0, 0, 0, 0);

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    if (targetDate < costaRicaNow) {
      throw new InvalidDateError('Cannot check availability for past dates');
    }
  }

  /**
   * Genera slots teóricos para un empleado basado en sus bloques de disponibilidad
   */
  private generateEmployeeSlots(
    employee: EmployeeWithAvailability,
    serviceDurationMinutes: number,
  ): EmployeeSlot[] {
    const slots: EmployeeSlot[] = [];

    for (const block of employee.availabilityBlocks) {
      if (!block.isActive) continue;

      const blockSlots = this.generateSlotsFromBlock(
        block.startTime,
        block.endTime,
        serviceDurationMinutes,
      );

      for (const slot of blockSlots) {
        slots.push({
          startTime: slot.startTime,
          endTime: slot.endTime,
          employeeId: employee.id,
          employeeName: employee.name,
          employeePhotoUrl: employee.photoUrl,
          capacity: block.capacity,
          bookedCount: 0,
        });
      }
    }

    return slots;
  }

  /**
   * Genera slots dentro de un bloque de tiempo
   */
  private generateSlotsFromBlock(
    blockStart: string,
    blockEnd: string,
    serviceDurationMinutes: number,
  ): { startTime: string; endTime: string }[] {
    const slots: { startTime: string; endTime: string }[] = [];
    const startMinutes = TimeSlot.timeToMinutes(blockStart);
    const endMinutes = TimeSlot.timeToMinutes(blockEnd);

    let currentStart = startMinutes;

    while (currentStart + serviceDurationMinutes <= endMinutes) {
      const currentEnd = currentStart + serviceDurationMinutes;
      slots.push({
        startTime: TimeSlot.minutesToTime(currentStart),
        endTime: TimeSlot.minutesToTime(currentEnd),
      });
      currentStart = currentEnd; // Slots consecutivos sin gap
    }

    return slots;
  }

  /**
   * Cuenta cuántas reservas afectan un slot específico de un empleado
   */
  private countBookingsAffectingSlot(
    slot: EmployeeSlot,
    bookedSlots: BookedSlot[],
    serviceDurationMinutes: number,
  ): number {
    const slotStart = TimeSlot.timeToMinutes(slot.startTime);
    const slotEnd = TimeSlot.timeToMinutes(slot.endTime);

    return bookedSlots.filter(booked => {
      const bookedStart = TimeSlot.timeToMinutes(booked.appointmentTime);
      const bookedEnd = bookedStart + booked.durationMinutes;

      // Hay superposición si los rangos se solapan
      return slotStart < bookedEnd && slotEnd > bookedStart;
    }).length;
  }

  /**
   * Agrupa slots por hora y combina los empleados disponibles
   */
  private groupSlotsByTime(slots: EmployeeSlot[]): {
    startTime: string;
    endTime: string;
    employees: AvailableEmployeeDTO[];
  }[] {
    const grouped = new Map<string, {
      startTime: string;
      endTime: string;
      employees: AvailableEmployeeDTO[];
    }>();

    for (const slot of slots) {
      const key = `${slot.startTime}-${slot.endTime}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          startTime: slot.startTime,
          endTime: slot.endTime,
          employees: [],
        });
      }

      grouped.get(key)!.employees.push({
        id: slot.employeeId,
        name: slot.employeeName,
        photoUrl: slot.employeePhotoUrl,
      });
    }

    // Ordenar por hora de inicio y retornar
    return Array.from(grouped.values()).sort((a, b) => {
      const aMinutes = TimeSlot.timeToMinutes(a.startTime);
      const bMinutes = TimeSlot.timeToMinutes(b.startTime);
      return aMinutes - bMinutes;
    });
  }

  // ==================== MÉTODOS LEGACY ====================

  /**
   * Genera todos los slots teóricos a partir de los bloques de disponibilidad (legacy)
   */
  private generateTheoreticalSlots(
    blocks: AvailabilityBlock[],
    serviceDurationMinutes: number,
  ): TimeSlot[] {
    const allSlots: TimeSlot[] = [];

    for (const block of blocks) {
      const blockSlots = block.generateTheoreticalSlots(serviceDurationMinutes);
      for (const slot of blockSlots) {
        allSlots.push(
          new TimeSlot(slot.startTime, slot.endTime, block.capacity, 0)
        );
      }
    }

    return allSlots.sort((a, b) => a.startMinutes - b.startMinutes);
  }

  /**
   * Calcula la disponibilidad real de cada slot (legacy)
   */
  private calculateAvailableSlots(
    theoreticalSlots: TimeSlot[],
    bookedSlots: BookedSlot[],
    serviceDurationMinutes: number,
  ): TimeSlot[] {
    return theoreticalSlots.map(slot => {
      const bookingsAffectingSlot = this.countLegacyBookingsAffectingSlot(
        slot,
        bookedSlots,
        serviceDurationMinutes,
      );

      const bookedCount = Math.min(bookingsAffectingSlot, slot.capacity);
      return new TimeSlot(
        slot.startTime,
        slot.endTime,
        slot.capacity,
        bookedCount,
      );
    });
  }

  /**
   * Cuenta reservas que afectan un slot (legacy)
   */
  private countLegacyBookingsAffectingSlot(
    slot: TimeSlot,
    bookedSlots: BookedSlot[],
    serviceDurationMinutes: number,
  ): number {
    const slotStart = slot.startMinutes;
    const slotEnd = slot.endMinutes;

    return bookedSlots.filter(booked => {
      const bookedStart = TimeSlot.timeToMinutes(booked.appointmentTime);
      const bookedEnd = bookedStart + booked.durationMinutes;
      return slotStart < bookedEnd && slotEnd > bookedStart;
    }).length;
  }
}
