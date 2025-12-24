/**
 * Value Object: TimeSlot
 * Representa un bloque de tiempo disponible para reservar
 */
export class TimeSlot {
  constructor(
    public readonly startTime: string, // "HH:mm"
    public readonly endTime: string,   // "HH:mm"
    public readonly capacity: number,  // Capacidad total del slot
    public readonly booked: number,    // Cantidad ya reservada
  ) {
    this.validate();
  }

  private validate(): void {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timeRegex.test(this.startTime)) {
      throw new Error(`Invalid startTime format: ${this.startTime}. Expected HH:mm`);
    }
    if (!timeRegex.test(this.endTime)) {
      throw new Error(`Invalid endTime format: ${this.endTime}. Expected HH:mm`);
    }
    if (this.capacity < 1) {
      throw new Error('Capacity must be at least 1');
    }
    if (this.booked < 0) {
      throw new Error('Booked count cannot be negative');
    }
    if (this.booked > this.capacity) {
      throw new Error('Booked count cannot exceed capacity');
    }
  }

  /**
   * Cantidad de espacios disponibles en este slot
   */
  get availableSpots(): number {
    return this.capacity - this.booked;
  }

  /**
   * Indica si el slot tiene al menos un espacio libre
   */
  get isAvailable(): boolean {
    return this.availableSpots > 0;
  }

  /**
   * Convierte startTime a minutos desde medianoche
   */
  get startMinutes(): number {
    return TimeSlot.timeToMinutes(this.startTime);
  }

  /**
   * Convierte endTime a minutos desde medianoche
   */
  get endMinutes(): number {
    return TimeSlot.timeToMinutes(this.endTime);
  }

  /**
   * Duración del slot en minutos
   */
  get durationMinutes(): number {
    return this.endMinutes - this.startMinutes;
  }

  /**
   * Utilidad: convierte "HH:mm" a minutos desde medianoche
   */
  static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Utilidad: convierte minutos desde medianoche a "HH:mm"
   */
  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Crea un nuevo TimeSlot con una reserva adicional
   */
  withBooking(): TimeSlot {
    if (!this.isAvailable) {
      throw new Error('Cannot book a fully booked slot');
    }
    return new TimeSlot(
      this.startTime,
      this.endTime,
      this.capacity,
      this.booked + 1,
    );
  }

  /**
   * Crea un nuevo TimeSlot liberando una reserva
   */
  withCancellation(): TimeSlot {
    if (this.booked === 0) {
      throw new Error('Cannot cancel booking on a slot with no bookings');
    }
    return new TimeSlot(
      this.startTime,
      this.endTime,
      this.capacity,
      this.booked - 1,
    );
  }

  equals(other: TimeSlot): boolean {
    return (
      this.startTime === other.startTime &&
      this.endTime === other.endTime &&
      this.capacity === other.capacity &&
      this.booked === other.booked
    );
  }

  toString(): string {
    return `${this.startTime}-${this.endTime} (${this.availableSpots}/${this.capacity} disponibles)`;
  }
}
