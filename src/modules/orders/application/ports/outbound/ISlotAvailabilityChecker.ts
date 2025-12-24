/**
 * Puerto de salida: Verificador de disponibilidad de slots
 * Usado durante la creación de órdenes para verificar que los slots están libres
 */
export interface SlotCheckRequest {
  tenantId: string;
  date: Date;
  time: string;  // "HH:mm"
  durationMinutes: number;
}

export interface ISlotAvailabilityChecker {
  /**
   * Verifica si un slot específico tiene capacidad disponible
   * Considera la capacidad del bloque de disponibilidad
   * @returns true si hay al menos un espacio disponible
   */
  isSlotAvailable(request: SlotCheckRequest): Promise<boolean>;

  /**
   * Verifica múltiples slots en batch (optimización)
   * @returns Map de slot key ("date:time") → disponibilidad
   */
  checkMultipleSlots(requests: SlotCheckRequest[]): Promise<Map<string, boolean>>;

  /**
   * Obtiene la capacidad restante de un slot específico
   * @returns número de espacios disponibles (0 si está lleno)
   */
  getRemainingCapacity(request: SlotCheckRequest): Promise<number>;
}

export const SLOT_AVAILABILITY_CHECKER = Symbol('ISlotAvailabilityChecker');
