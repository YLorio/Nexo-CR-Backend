import { DayOfWeekEnum } from '../value-objects';
import { TimeSlot } from '../value-objects';

/**
 * Entity: AvailabilityBlock
 * Representa un bloque de disponibilidad de un tenant para un día específico
 * Entidad pura de dominio - sin dependencias de infraestructura
 */
export interface AvailabilityBlockProps {
  id: string;
  tenantId: string;
  dayOfWeek: DayOfWeekEnum;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  capacity: number;
  isActive: boolean;
}

export class AvailabilityBlock {
  readonly id: string;
  readonly tenantId: string;
  readonly dayOfWeek: DayOfWeekEnum;
  readonly startTime: string;
  readonly endTime: string;
  readonly capacity: number;
  readonly isActive: boolean;

  constructor(props: AvailabilityBlockProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.dayOfWeek = props.dayOfWeek;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.capacity = props.capacity;
    this.isActive = props.isActive;

    this.validate();
  }

  private validate(): void {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timeRegex.test(this.startTime)) {
      throw new Error(`Invalid startTime: ${this.startTime}`);
    }
    if (!timeRegex.test(this.endTime)) {
      throw new Error(`Invalid endTime: ${this.endTime}`);
    }
    if (this.startMinutes >= this.endMinutes) {
      throw new Error('startTime must be before endTime');
    }
    if (this.capacity < 1) {
      throw new Error('Capacity must be at least 1');
    }
  }

  get startMinutes(): number {
    return TimeSlot.timeToMinutes(this.startTime);
  }

  get endMinutes(): number {
    return TimeSlot.timeToMinutes(this.endTime);
  }

  get durationMinutes(): number {
    return this.endMinutes - this.startMinutes;
  }

  /**
   * Genera slots teóricos basados en la duración del servicio
   * @param serviceDurationMinutes Duración del servicio en minutos
   * @returns Array de TimeSlots teóricos (sin considerar reservas)
   */
  generateTheoreticalSlots(serviceDurationMinutes: number): TimeSlot[] {
    const slots: TimeSlot[] = [];
    let currentMinutes = this.startMinutes;

    while (currentMinutes + serviceDurationMinutes <= this.endMinutes) {
      const slotStart = TimeSlot.minutesToTime(currentMinutes);
      const slotEnd = TimeSlot.minutesToTime(currentMinutes + serviceDurationMinutes);

      slots.push(
        new TimeSlot(slotStart, slotEnd, this.capacity, 0)
      );

      currentMinutes += serviceDurationMinutes;
    }

    return slots;
  }

  /**
   * Verifica si un horario específico cae dentro de este bloque
   */
  containsTime(time: string): boolean {
    const timeMinutes = TimeSlot.timeToMinutes(time);
    return timeMinutes >= this.startMinutes && timeMinutes < this.endMinutes;
  }
}
