import { TimeSlot } from '../../../domain/value-objects';

/**
 * Puerto de entrada: Caso de uso para obtener slots disponibles
 */
export interface GetAvailableSlotsQuery {
  tenantId: string;
  serviceId: string;  // ID del producto/servicio
  date: Date;         // Fecha para la cual buscar disponibilidad
  employeeId?: string; // Opcional: filtrar por empleado específico
}

/**
 * Información de un empleado disponible para un slot
 */
export interface AvailableEmployeeDTO {
  id: string;
  name: string;
  photoUrl: string | null;
}

/**
 * Slot disponible con información de empleados
 */
export interface AvailableSlotDTO {
  startTime: string;      // "HH:mm"
  endTime: string;        // "HH:mm"
  availableSpots: number; // Total de empleados disponibles en este slot
  availableEmployees: AvailableEmployeeDTO[]; // Lista de empleados disponibles
}

export interface GetAvailableSlotsResult {
  date: Date;
  dayOfWeek: string;
  serviceName: string;
  serviceDurationMinutes: number;
  slots: AvailableSlotDTO[];
  totalAvailableSlots: number;
  // Información adicional de empleados que pueden realizar el servicio
  employees: AvailableEmployeeDTO[];
}

export interface IGetAvailableSlotsUC {
  /**
   * Ejecuta el caso de uso
   * @throws ServiceNotFoundError si el servicio no existe
   * @throws NoAvailabilityConfiguredError si no hay bloques de disponibilidad
   * @throws NoEmployeesForServiceError si no hay empleados asignados al servicio
   */
  execute(query: GetAvailableSlotsQuery): Promise<GetAvailableSlotsResult>;
}

export const GET_AVAILABLE_SLOTS_UC = Symbol('IGetAvailableSlotsUC');
