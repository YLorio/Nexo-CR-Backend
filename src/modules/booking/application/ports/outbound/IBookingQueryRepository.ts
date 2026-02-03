/**
 * Puerto de salida: Consultas de reservas existentes
 * Interface para consultar las citas/reservas ya realizadas
 */
export interface BookedSlot {
  appointmentTime: string;  // "HH:mm"
  durationMinutes: number;
  productId: string;
  employeeId: string | null; // ID del empleado asignado (null para reservas legacy)
}

export interface IBookingQueryRepository {
  /**
   * Obtiene las reservas existentes para un tenant en una fecha específica
   * Solo considera órdenes que NO están canceladas
   * @returns Array de slots ocupados con su hora y duración
   */
  findBookedSlotsByTenantAndDate(
    tenantId: string,
    date: Date,
  ): Promise<BookedSlot[]>;

  /**
   * Obtiene las reservas existentes de un empleado específico en una fecha
   * Solo considera órdenes que NO están canceladas
   */
  findBookedSlotsByEmployeeAndDate(
    employeeId: string,
    date: Date,
  ): Promise<BookedSlot[]>;

  /**
   * Cuenta cuántas reservas existen para un slot específico
   * Útil para verificar capacidad disponible
   */
  countBookingsForSlot(
    tenantId: string,
    date: Date,
    startTime: string,
  ): Promise<number>;

  /**
   * Cuenta las reservas de un empleado para un slot específico
   */
  countBookingsForEmployeeSlot(
    employeeId: string,
    date: Date,
    startTime: string,
  ): Promise<number>;
}

export const BOOKING_QUERY_REPOSITORY = Symbol('IBookingQueryRepository');
